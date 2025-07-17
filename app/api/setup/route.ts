// app/api/setup/route.ts
import { NextRequest, NextResponse } from "next/server"

interface SetupStatus {
  timestamp: string
  environment: string
  services: {
    supabase: {
      configured: boolean
      url: string
      anonKey: string
      serviceKey: string
    }
    ai: {
      configured: boolean
      openai: string
    }
    security: {
      jwtSecret: string
      encryptionKey: string
    }
    email: {
      configured: boolean
      host: string
      user: string
    }
  }
  recommendations: string[]
}

export async function GET() {
  const setupStatus: SetupStatus = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "development",
    services: {
      supabase: {
        configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing",
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing",
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓ Set" : "✗ Missing",
      },
      ai: {
        configured: !!process.env.OPENAI_API_KEY,
        openai: process.env.OPENAI_API_KEY ? "✓ Set" : "✗ Missing",
      },
      security: {
        jwtSecret: process.env.JWT_SECRET ? "✓ Set" : "✗ Missing",
        encryptionKey: process.env.ENCRYPTION_KEY ? "✓ Set" : "✗ Missing",
      },
      email: {
        configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
        host: process.env.SMTP_HOST ? "✓ Set" : "✗ Missing",
        user: process.env.SMTP_USER ? "✓ Set" : "✗ Missing",
      },
    },
    // ← now typed as string[] so .push() works below
    recommendations: [],
  }

  // Add any recommendations for missing config:
  if (!setupStatus.services.supabase.configured) {
    setupStatus.recommendations.push(
      "Configure Supabase environment variables for database functionality"
    )
  }
  if (!setupStatus.services.ai.configured) {
    setupStatus.recommendations.push("Add OpenAI API key for AI-powered features")
  }
  if (!process.env.JWT_SECRET) {
    setupStatus.recommendations.push("Set JWT_SECRET for secure authentication")
  }
  if (!process.env.ENCRYPTION_KEY) {
    setupStatus.recommendations.push("Set ENCRYPTION_KEY for data encryption")
  }

  return NextResponse.json(setupStatus)
}

export async function POST() {
  const { randomBytes } = await import("crypto")
  const jwtSecret = randomBytes(32).toString("hex")
  const encryptionKey = randomBytes(32).toString("hex")

  const template = [
    "# Generated Environment Variables for Development",
    "# Copy these to your .env.local file",
    "",
    "# Security Keys (Generated)",
    `JWT_SECRET=${jwtSecret}`,
    `ENCRYPTION_KEY=${encryptionKey}`,
    "",
    "# Database Configuration (Supabase)",
    "NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key",
    "",
    "# AI Configuration",
    "OPENAI_API_KEY=your_openai_api_key",
    "",
    "# Email Configuration (Optional)",
    "SMTP_HOST=smtp.gmail.com",
    "SMTP_PORT=587",
    "SMTP_USER=your_email@gmail.com",
    "SMTP_PASSWORD=your_app_password",
    "FROM_EMAIL=noreply@yourcompany.com",
    "",
    "# Application Settings",
    "NEXT_PUBLIC_BASE_URL=http://localhost:3000",
    "NODE_ENV=development",
  ].join("\n")

  return NextResponse.json({
    success: true,
    template,
    instructions: [
      "1. Copy the generated template to your .env.local file",
      "2. Replace placeholder values with your actual credentials",
      "3. Restart your development server",
      "4. Visit /api/setup to verify configuration",
    ],
  })
}
