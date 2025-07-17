#!/usr/bin/env node

/**
 * Post-Deployment Health Check for Section 3 Compliance System
 * Verifies all system components are functioning correctly
 */

interface HealthCheckResult {
  component: string
  status: "healthy" | "warning" | "error"
  message: string
  responseTime?: number
}

class HealthChecker {
  private results: HealthCheckResult[] = []
  private baseUrl: string

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000") {
    this.baseUrl = baseUrl
  }

  async checkApiHealth() {
    console.log("🔍 Checking API health...")

    try {
      const start = Date.now()
      const response = await fetch(`${this.baseUrl}/api/health`)
      const responseTime = Date.now() - start

      if (response.ok) {
        const data = await response.json()
        this.results.push({
          component: "API Health",
          status: "healthy",
          message: `API responding correctly: ${data.status}`,
          responseTime,
        })
      } else {
        this.results.push({
          component: "API Health",
          status: "error",
          message: `API returned ${response.status}: ${response.statusText}`,
        })
      }
    } catch (error: any) {
      this.results.push({
        component: "API Health",
        status: "error",
        message: `API unreachable: ${error.message}`,
      })
    }
  }

  async checkDatabaseConnection() {
    console.log("🔍 Checking database connection...")

    try {
      const response = await fetch(`${this.baseUrl}/api/health/database`)

      if (response.ok) {
        this.results.push({
          component: "Database",
          status: "healthy",
          message: "Database connection successful",
        })
      } else {
        this.results.push({
          component: "Database",
          status: "error",
          message: "Database connection failed",
        })
      }
    } catch (error: any) {
      this.results.push({
        component: "Database",
        status: "error",
        message: `Database check failed: ${error.message}`,
      })
    }
  }

  async checkAIIntegration() {
    console.log("🔍 Checking AI integration...")

    try {
      const response = await fetch(`${this.baseUrl}/api/ai/health`)

      if (response.ok) {
        this.results.push({
          component: "AI Integration",
          status: "healthy",
          message: "AI services responding",
        })
      } else {
        this.results.push({
          component: "AI Integration",
          status: "warning",
          message: "AI services may be unavailable",
        })
      }
    } catch (error: any) {
      this.results.push({
        component: "AI Integration",
        status: "warning",
        message: `AI integration check failed: ${error.message}`,
      })
    }
  }

  async runAllChecks() {
    console.log("🚀 Starting post-deployment health checks...")

    await this.checkApiHealth()
    await this.checkDatabaseConnection()
    await this.checkAIIntegration()

    this.generateReport()
  }

  generateReport() {
    console.log("\n" + "=".repeat(60))
    console.log("📊 HEALTH CHECK REPORT")
    console.log("=".repeat(60))

    const healthy = this.results.filter((r) => r.status === "healthy").length
    const warnings = this.results.filter((r) => r.status === "warning").length
    const errors = this.results.filter((r) => r.status === "error").length

    console.log(`\n📈 SUMMARY: ${healthy} healthy, ${warnings} warnings, ${errors} errors`)

    this.results.forEach((result) => {
      const icon = result.status === "healthy" ? "✅" : result.status === "warning" ? "⚠️" : "❌"
      const time = result.responseTime ? ` (${result.responseTime}ms)` : ""
      console.log(`${icon} ${result.component}: ${result.message}${time}`)
    })

    if (errors > 0) {
      console.log("\n🚨 CRITICAL ISSUES DETECTED")
      console.log("Deployment may not be fully functional. Check error messages above.")
    } else if (warnings > 0) {
      console.log("\n⚠️ WARNINGS DETECTED")
      console.log("Deployment is functional but some features may be limited.")
    } else {
      console.log("\n🎉 ALL SYSTEMS HEALTHY")
      console.log("Deployment successful and fully functional!")
    }
  }
}

// Execute health check
const checker = new HealthChecker()
checker.runAllChecks().catch(console.error)
