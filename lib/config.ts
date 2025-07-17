// Production configuration for Section 3 Compliance System
export const config = {
  // Database Configuration
  database: {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    isConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  },

  // AI Configuration
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY || "",
    model: "gpt-4",
    maxTokens: 2000,
    temperature: 0.1,
  },

  // Email Configuration
  email: {
    smtpHost: process.env.SMTP_HOST || "",
    smtpPort: Number.parseInt(process.env.SMTP_PORT || "587"),
    smtpUser: process.env.SMTP_USER || "",
    smtpPassword: process.env.SMTP_PASSWORD || "",
    fromAddress: process.env.FROM_EMAIL || "noreply@section3compliance.gov",
  },

  // HUD Integration
  hud: {
    spearsApiUrl: process.env.HUD_SPEARS_API_URL || "",
    spearsApiKey: process.env.HUD_SPEARS_API_KEY || "",
    idisApiUrl: process.env.HUD_IDIS_API_URL || "",
    idisApiKey: process.env.HUD_IDIS_API_KEY || "",
  },

  // Payroll Integration
  payroll: {
    adp: {
      clientId: process.env.ADP_CLIENT_ID || "",
      clientSecret: process.env.ADP_CLIENT_SECRET || "",
      apiUrl: process.env.ADP_API_URL || "https://api.adp.com",
    },
    quickbooks: {
      clientId: process.env.QB_CLIENT_ID || "",
      clientSecret: process.env.QB_CLIENT_SECRET || "",
      apiUrl: process.env.QB_API_URL || "https://sandbox-quickbooks.api.intuit.com",
    },
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || "demo-jwt-secret-for-development-only",
    encryptionKey: process.env.ENCRYPTION_KEY || "demo-encryption-key-for-development",
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
    maxLoginAttempts: 5,
    lockoutDuration: 30 * 60 * 1000, // 30 minutes
  },

  // File Storage
  storage: {
    bucket: process.env.STORAGE_BUCKET || "section3-documents",
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },

  // Notification Configuration
  notifications: {
    pushService: process.env.PUSH_SERVICE_URL || "",
    pushServiceKey: process.env.PUSH_SERVICE_KEY || "",
    smsProvider: process.env.SMS_PROVIDER || "twilio",
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || "",
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || "",
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || "",
  },

  // Application Settings
  app: {
    name: "Section 3 Compliance System",
    version: "1.0.0",
    description: "Autonomous compliance assistant for DCHA Section 3 requirements",
    environment: process.env.NODE_ENV || "development",
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    supportEmail: process.env.SUPPORT_EMAIL || "support@section3compliance.gov",
    maxConcurrentUsers: Number.parseInt(process.env.MAX_CONCURRENT_USERS || "1000"),
  },

  // Compliance Settings
  compliance: {
    section3Threshold: 0.25, // 25% minimum requirement
    targetedSection3Threshold: 0.05, // 5% targeted hire goal
    reportingFrequency: "monthly",
    auditRetentionPeriod: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
    documentRetentionPeriod: 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
  },

  // Performance Monitoring
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    logLevel: process.env.LOG_LEVEL || "info",
    metricsEnabled: process.env.METRICS_ENABLED === "true",
    healthCheckInterval: 60000, // 1 minute
  },
}

// Validate required environment variables
export function validateConfig() {
  const warnings: string[] = []

  // Check for missing environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    warnings.push("NEXT_PUBLIC_SUPABASE_URL not set - using demo mode")
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    warnings.push("NEXT_PUBLIC_SUPABASE_ANON_KEY not set - using demo mode")
  }

  if (!process.env.OPENAI_API_KEY) {
    warnings.push("OPENAI_API_KEY not set - AI features will be limited")
  }

  if (!process.env.JWT_SECRET) {
    warnings.push("JWT_SECRET not set - using demo secret (not secure for production)")
  }

  if (!process.env.ENCRYPTION_KEY) {
    warnings.push("ENCRYPTION_KEY not set - using demo key (not secure for production)")
  }

  // Only throw errors in production for critical missing variables
  if (process.env.NODE_ENV === "production") {
    const criticalMissing = []

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) criticalMissing.push("NEXT_PUBLIC_SUPABASE_URL")
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) criticalMissing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if (!process.env.JWT_SECRET) criticalMissing.push("JWT_SECRET")
    if (!process.env.ENCRYPTION_KEY) criticalMissing.push("ENCRYPTION_KEY")

    if (criticalMissing.length > 0) {
      throw new Error(`Missing critical environment variables for production: ${criticalMissing.join(", ")}`)
    }
  } else {
    // In development, just log warnings
    if (warnings.length > 0) {
      console.warn("⚠️ Configuration warnings:")
      warnings.forEach((warning) => console.warn(`  - ${warning}`))
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  }
}
