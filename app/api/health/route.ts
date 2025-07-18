import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { config, validateConfig, getConfigStatus } from "@/lib/config"

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy" | "error"
  timestamp: string
  version: string
  environment: string
  services: {
    database: ServiceHealth
    ai: ServiceHealth
    email: ServiceHealth
    storage: ServiceHealth
    security: {
      jwtSecret: boolean
      encryptionKey: boolean
    }
  }
  isDemoMode: boolean
  configuration?: {
    isValid: boolean
    warnings: string[]
    errors?: string[]
  }
}

interface ServiceHealth {
  status: "healthy" | "degraded" | "unhealthy" | "not_configured" | "connected" | "demo_mode" | "configured"
  configured?: boolean
  hasValidUrl?: boolean
  hasKey?: boolean
  responseTime?: number
  lastCheck: string
  error?: string
  message?: string
}

export async function GET() {
  const startTime = Date.now()

  try {
    // Validate configuration
    const configValidation = validateConfig()
    const configStatus = getConfigStatus()

    // Check database connectivity
    const databaseHealth = await checkDatabase(configStatus)

    // Check AI service
    const aiHealth = await checkAIService(configStatus)

    // Check email service
    const emailHealth = await checkEmailService(configStatus)

    // Check storage service
    const storageHealth = await checkStorageService(configStatus)

    const responseTime = Date.now() - startTime

    // Determine overall system status
    const services = {
      database: databaseHealth,
      ai: aiHealth,
      email: emailHealth,
      storage: storageHealth,
      security: configStatus.security,
    }
    const overallStatus = determineOverallStatus(services)

    const healthCheck: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: config.app.version,
      environment: config.app.environment,
      services,
      isDemoMode: configStatus.isDemoMode,
      configuration: configValidation,
    }

    // Return appropriate HTTP status based on health
    const httpStatus = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 200 : 503

    return NextResponse.json(healthCheck, { status: httpStatus })
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        version: config.app.version,
        environment: config.app.environment,
        error: error instanceof Error ? error.message : "Unknown error",
        uptime: process.uptime(),
      },
      { status: 500 },
    )
  }
}

async function checkDatabase(configStatus: any): Promise<ServiceHealth> {
  const startTime = Date.now()

  try {
    if (!configStatus.supabase.configured) {
      return {
        status: "demo_mode",
        configured: false,
        hasValidUrl: false,
        hasKey: false,
        lastCheck: new Date().toISOString(),
        message: "Supabase not configured - running in demo mode",
      }
    }

    // Simple query to test database connectivity
    const { data, error } = await supabase.from("projects").select("id").limit(1)

    if (error) {
      return {
        status: "unhealthy",
        lastCheck: new Date().toISOString(),
        error: error.message,
      }
    }

    const responseTime = Date.now() - startTime

    return {
      status: responseTime < 1000 ? "healthy" : "degraded",
      responseTime,
      lastCheck: new Date().toISOString(),
      configured: true,
      hasValidUrl: configStatus.supabase.hasValidUrl,
      hasKey: configStatus.supabase.hasKey,
      message: "Database connection successful",
    }
  } catch (error) {
    return {
      status: "unhealthy",
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Database connection failed",
    }
  }
}

async function checkAIService(configStatus: any): Promise<ServiceHealth> {
  const startTime = Date.now()

  try {
    if (!configStatus.openai.configured) {
      return {
        status: "not_configured",
        configured: false,
        lastCheck: new Date().toISOString(),
        message: "OpenAI API key not configured",
      }
    }

    // Simple test of AI service availability
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${config.ai.openaiApiKey}`,
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    if (!response.ok) {
      return {
        status: "unhealthy",
        lastCheck: new Date().toISOString(),
        error: `AI service returned ${response.status}`,
      }
    }

    const responseTime = Date.now() - startTime

    return {
      status: responseTime < 2000 ? "healthy" : "degraded",
      responseTime,
      lastCheck: new Date().toISOString(),
      configured: true,
      message: "AI service accessible",
    }
  } catch (error) {
    return {
      status: "unhealthy",
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : "AI service unavailable",
    }
  }
}

async function checkEmailService(configStatus: any): Promise<ServiceHealth> {
  return {
    status: configStatus.email.smtpHost ? "healthy" : "not_configured",
    lastCheck: new Date().toISOString(),
    configured: configStatus.email.smtpHost ? true : false,
    message: configStatus.email.smtpHost ? "Email service configured" : "Email service not configured",
  }
}

async function checkStorageService(configStatus: any): Promise<ServiceHealth> {
  const startTime = Date.now()

  try {
    if (!configStatus.supabase.configured) {
      return {
        status: "demo_mode",
        configured: false,
        hasValidUrl: false,
        hasKey: false,
        lastCheck: new Date().toISOString(),
        message: "Storage not configured - Supabase required",
      }
    }

    // Test storage service by listing buckets
    const { data, error } = await supabase.storage.listBuckets()

    if (error) {
      return {
        status: "unhealthy",
        lastCheck: new Date().toISOString(),
        error: error.message,
      }
    }

    const responseTime = Date.now() - startTime

    return {
      status: responseTime < 1000 ? "healthy" : "degraded",
      responseTime,
      lastCheck: new Date().toISOString(),
      configured: true,
      hasValidUrl: configStatus.supabase.hasValidUrl,
      hasKey: configStatus.supabase.hasKey,
      message: "Storage service accessible",
    }
  } catch (error) {
    return {
      status: "unhealthy",
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Storage service unavailable",
    }
  }
}

function determineOverallStatus(
  services: Record<string, ServiceHealth>,
): "healthy" | "degraded" | "unhealthy" | "error" {
  const statuses = Object.values(services).map((service) => service.status)

  if (statuses.includes("unhealthy")) {
    return "unhealthy"
  }

  if (statuses.includes("degraded") || statuses.includes("not_configured") || statuses.includes("demo_mode")) {
    return "degraded"
  }

  return "healthy"
}
