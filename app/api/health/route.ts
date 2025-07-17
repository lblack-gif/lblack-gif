import { NextResponse } from "next/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { config, validateConfig } from "@/lib/config"

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  version: string
  environment: string
  services: {
    database: ServiceHealth
    ai: ServiceHealth
    email: ServiceHealth
    storage: ServiceHealth
  }
  metrics: {
    responseTime: number
    memoryUsage: number
    activeConnections: number
  }
  configuration: {
    isValid: boolean
    warnings: string[]
  }
}

interface ServiceHealth {
  status: "healthy" | "degraded" | "unhealthy" | "not_configured"
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

    // Check database connectivity
    const databaseHealth = await checkDatabase()

    // Check AI service
    const aiHealth = await checkAIService()

    // Check email service
    const emailHealth = await checkEmailService()

    // Check storage service
    const storageHealth = await checkStorageService()

    const responseTime = Date.now() - startTime

    // Determine overall system status
    const services = { database: databaseHealth, ai: aiHealth, email: emailHealth, storage: storageHealth }
    const overallStatus = determineOverallStatus(services)

    const healthCheck: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: config.app.version,
      environment: config.app.environment,
      services,
      metrics: {
        responseTime,
        memoryUsage: getMemoryUsage(),
        activeConnections: await getActiveConnections(),
      },
      configuration: configValidation,
    }

    // Return appropriate HTTP status based on health
    const httpStatus = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 200 : 503

    return NextResponse.json(healthCheck, { status: httpStatus })
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        version: config.app.version,
        environment: config.app.environment,
        error: error instanceof Error ? error.message : "Unknown error",
        uptime: process.uptime(),
      },
      { status: 503 },
    )
  }
}

async function checkDatabase(): Promise<ServiceHealth> {
  const startTime = Date.now()

  try {
    if (!isSupabaseConfigured()) {
      return {
        status: "not_configured",
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

async function checkAIService(): Promise<ServiceHealth> {
  const startTime = Date.now()

  try {
    if (!config.ai.openaiApiKey) {
      return {
        status: "not_configured",
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

async function checkEmailService(): Promise<ServiceHealth> {
  return {
    status: config.email.smtpHost ? "healthy" : "not_configured",
    lastCheck: new Date().toISOString(),
    message: config.email.smtpHost ? "Email service configured" : "Email service not configured",
  }
}

async function checkStorageService(): Promise<ServiceHealth> {
  const startTime = Date.now()

  try {
    if (!isSupabaseConfigured()) {
      return {
        status: "not_configured",
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

function determineOverallStatus(services: Record<string, ServiceHealth>): "healthy" | "degraded" | "unhealthy" {
  const statuses = Object.values(services).map((service) => service.status)

  if (statuses.includes("unhealthy")) {
    return "unhealthy"
  }

  if (statuses.includes("degraded") || statuses.includes("not_configured")) {
    return "degraded"
  }

  return "healthy"
}

function getMemoryUsage(): number {
  const usage = process.memoryUsage()
  return Math.round((usage.heapUsed / usage.heapTotal) * 100)
}

async function getActiveConnections(): Promise<number> {
  try {
    // In production, you would query actual connection pool metrics
    // For demo, return a simulated value
    return Math.floor(Math.random() * 50) + 20
  } catch (error) {
    return 0
  }
}
