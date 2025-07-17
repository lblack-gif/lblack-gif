#!/usr/bin/env node

/**
 * Advanced Deployment Failure Analyzer for Section 3 Compliance System
 * Analyzes deployment logs, identifies failure patterns, and provides solutions
 */

import { execSync } from "child_process"
import fs from "fs"
import path from "path"

interface DeploymentError {
  type: "build" | "runtime" | "environment" | "database" | "network"
  severity: "critical" | "warning" | "info"
  message: string
  solution: string
  commands?: string[]
}

class DeploymentAnalyzer {
  private errors: DeploymentError[] = []
  private logPath = ""

  constructor() {
    this.logPath = path.join(process.cwd(), "deployment.log")
  }

  log(message: string, type: "info" | "warn" | "error" = "info") {
    const timestamp = new Date().toISOString()
    const prefix = type === "error" ? "❌" : type === "warn" ? "⚠️" : "✅"
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  addError(error: DeploymentError) {
    this.errors.push(error)
    this.log(error.message, error.severity === "critical" ? "error" : "warn")
  }

  // Analyze build failures
  analyzeBuildFailures() {
    this.log("🔍 Analyzing build failures...")

    try {
      // Check for TypeScript errors
      execSync("npx tsc --noEmit", { stdio: "pipe" })
    } catch (error: any) {
      if (error.stdout?.includes("error TS")) {
        this.addError({
          type: "build",
          severity: "critical",
          message: "TypeScript compilation errors detected",
          solution: "Fix TypeScript errors in your code",
          commands: ["npx tsc --noEmit --listFiles"],
        })
      }
    }

    // Check for missing dependencies
    try {
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"))
      const requiredDeps = ["@supabase/supabase-js", "next", "react", "react-dom", "tailwindcss", "lucide-react"]

      const missingDeps = requiredDeps.filter(
        (dep) => !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep],
      )

      if (missingDeps.length > 0) {
        this.addError({
          type: "build",
          severity: "critical",
          message: `Missing required dependencies: ${missingDeps.join(", ")}`,
          solution: "Install missing dependencies",
          commands: [`npm install ${missingDeps.join(" ")}`],
        })
      }
    } catch (error) {
      this.addError({
        type: "build",
        severity: "critical",
        message: "Cannot read package.json",
        solution: "Ensure package.json exists and is valid JSON",
      })
    }
  }

  // Analyze environment variable issues
  analyzeEnvironmentIssues() {
    this.log("🔍 Analyzing environment configuration...")

    const requiredEnvVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "OPENAI_API_KEY",
    ]

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      this.addError({
        type: "environment",
        severity: "critical",
        message: `Missing environment variables: ${missingVars.join(", ")}`,
        solution: "Set required environment variables in your deployment platform",
        commands: [
          "vercel env add NEXT_PUBLIC_SUPABASE_URL",
          "vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY",
          "vercel env add SUPABASE_SERVICE_ROLE_KEY",
          "vercel env add OPENAI_API_KEY",
        ],
      })
    }

    // Check for malformed URLs
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://")) {
      this.addError({
        type: "environment",
        severity: "critical",
        message: "SUPABASE_URL must be a valid HTTPS URL",
        solution: "Ensure SUPABASE_URL starts with https://",
      })
    }
  }

  // Analyze database connectivity issues
  analyzeDatabaseIssues() {
    this.log("🔍 Analyzing database connectivity...")

    // Check if database schema files exist
    const schemaFiles = [
      "scripts/seed-comprehensive-data.sql",
      "scripts/add-ai-integration-schema.sql",
      "scripts/add-worker-management-schema.sql",
    ]

    const missingSchemas = schemaFiles.filter((file) => !fs.existsSync(file))

    if (missingSchemas.length > 0) {
      this.addError({
        type: "database",
        severity: "warning",
        message: `Missing database schema files: ${missingSchemas.join(", ")}`,
        solution: "Ensure all database schema files are present and run migrations",
      })
    }
  }

  // Analyze runtime errors
  analyzeRuntimeErrors() {
    this.log("🔍 Analyzing runtime errors...")

    // Check for common Next.js runtime issues
    const nextConfigPath = "next.config.mjs"
    if (fs.existsSync(nextConfigPath)) {
      try {
        const configContent = fs.readFileSync(nextConfigPath, "utf8")
        if (!configContent.includes("export default")) {
          this.addError({
            type: "runtime",
            severity: "critical",
            message: "Invalid Next.js configuration format",
            solution: "Ensure next.config.mjs exports default configuration object",
          })
        }
      } catch (error) {
        this.addError({
          type: "runtime",
          severity: "critical",
          message: "Cannot read Next.js configuration",
          solution: "Fix syntax errors in next.config.mjs",
        })
      }
    }
  }

  // Analyze network and API issues
  analyzeNetworkIssues() {
    this.log("🔍 Analyzing network and API connectivity...")

    // Check for API route issues
    const apiRoutes = [
      "app/api/health/route.ts",
      "app/api/ai/process-email/route.ts",
      "app/api/reports/compliance/route.ts",
    ]

    const missingRoutes = apiRoutes.filter((route) => !fs.existsSync(route))

    if (missingRoutes.length > 0) {
      this.addError({
        type: "network",
        severity: "warning",
        message: `Missing API routes: ${missingRoutes.join(", ")}`,
        solution: "Ensure all required API routes are implemented",
      })
    }
  }

  // Generate deployment fix script
  generateFixScript() {
    if (this.errors.length === 0) return

    const fixCommands = this.errors.filter((error) => error.commands).flatMap((error) => error.commands!)

    if (fixCommands.length === 0) return

    const fixScript = `#!/bin/bash
# Auto-generated deployment fix script
# Generated: ${new Date().toISOString()}

echo "🔧 Applying deployment fixes..."

${fixCommands
  .map(
    (cmd, index) => `
echo "Executing: ${cmd}"
${cmd}
if [ $? -ne 0 ]; then
  echo "❌ Command failed: ${cmd}"
  exit 1
fi
`,
  )
  .join("")}

echo "✅ All fixes applied successfully!"
`

    fs.writeFileSync("fix-deployment.sh", fixScript)
    execSync("chmod +x fix-deployment.sh")
    this.log("Generated fix script: ./fix-deployment.sh")
  }

  // Main analysis function
  async analyze() {
    this.log("🚀 Starting deployment failure analysis...")

    this.analyzeBuildFailures()
    this.analyzeEnvironmentIssues()
    this.analyzeDatabaseIssues()
    this.analyzeRuntimeErrors()
    this.analyzeNetworkIssues()

    this.generateReport()
    this.generateFixScript()
  }

  // Generate comprehensive report
  generateReport() {
    console.log("\n" + "=".repeat(80))
    console.log("📊 DEPLOYMENT FAILURE ANALYSIS REPORT")
    console.log("=".repeat(80))

    if (this.errors.length === 0) {
      this.log("🎉 No deployment issues detected!")
      this.log("Your Section 3 Compliance System should deploy successfully.")
      return
    }

    // Group errors by type
    const errorsByType = this.errors.reduce(
      (acc, error) => {
        if (!acc[error.type]) acc[error.type] = []
        acc[error.type].push(error)
        return acc
      },
      {} as Record<string, DeploymentError[]>,
    )

    // Critical errors
    const criticalErrors = this.errors.filter((e) => e.severity === "critical")
    if (criticalErrors.length > 0) {
      console.log("\n🚨 CRITICAL ISSUES (Must fix before deployment):")
      criticalErrors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.message}`)
        console.log(`   Type: ${error.type}`)
        console.log(`   Solution: ${error.solution}`)
        if (error.commands) {
          console.log(`   Commands: ${error.commands.join(", ")}`)
        }
      })
    }

    // Warnings
    const warnings = this.errors.filter((e) => e.severity === "warning")
    if (warnings.length > 0) {
      console.log("\n⚠️ WARNINGS (Recommended to fix):")
      warnings.forEach((warning, index) => {
        console.log(`\n${index + 1}. ${warning.message}`)
        console.log(`   Solution: ${warning.solution}`)
      })
    }

    // Deployment platform specific guidance
    console.log("\n🚀 PLATFORM-SPECIFIC DEPLOYMENT GUIDANCE:")

    console.log("\n📦 VERCEL DEPLOYMENT:")
    console.log("1. Ensure all environment variables are set in Vercel dashboard")
    console.log("2. Check build logs in Vercel deployment interface")
    console.log("3. Verify Node.js version compatibility (18.x recommended)")
    console.log("4. Commands:")
    console.log("   vercel --prod")
    console.log("   vercel logs [deployment-url]")

    console.log("\n🐳 DOCKER DEPLOYMENT:")
    console.log("1. Build Docker image: docker build -t section3-compliance .")
    console.log("2. Run container: docker run -p 3000:3000 section3-compliance")
    console.log("3. Check container logs: docker logs [container-id]")

    console.log("\n☁️ AWS/NETLIFY DEPLOYMENT:")
    console.log("1. Configure build settings: npm run build")
    console.log("2. Set publish directory: .next")
    console.log("3. Configure environment variables in platform dashboard")

    // Next steps
    console.log("\n📋 NEXT STEPS:")
    if (criticalErrors.length > 0) {
      console.log("1. ❌ Fix all critical issues listed above")
      console.log("2. 🔄 Re-run this analyzer: npm run analyze-deployment")
      console.log("3. 🧪 Test local build: npm run build")
      console.log("4. 🚀 Retry deployment")
    } else {
      console.log("1. ✅ Address any warnings if possible")
      console.log("2. 🚀 Proceed with deployment")
      console.log("3. 📊 Monitor deployment logs")
      console.log("4. 🔍 Run health checks post-deployment")
    }

    console.log("\n📞 SUPPORT RESOURCES:")
    console.log("• Next.js Deployment Docs: https://nextjs.org/docs/deployment")
    console.log("• Vercel Troubleshooting: https://vercel.com/docs/concepts/deployments/troubleshoot-a-build")
    console.log("• Supabase Connection Issues: https://supabase.com/docs/guides/platform/troubleshooting")
  }
}

// Execute analyzer
const analyzer = new DeploymentAnalyzer()
analyzer.analyze().catch(console.error)
