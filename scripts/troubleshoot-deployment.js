#!/usr/bin/env node

/**
 * Deployment Troubleshooting Script
 * This script helps identify and resolve common deployment issues
 */

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

class DeploymentTroubleshooter {
  constructor() {
    this.issues = []
    this.warnings = []
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${type.toUpperCase()}]`
    console.log(`${prefix} ${message}`)
  }

  addIssue(issue) {
    this.issues.push(issue)
    this.log(issue, "error")
  }

  addWarning(warning) {
    this.warnings.push(warning)
    this.log(warning, "warn")
  }

  checkEnvironmentVariables() {
    this.log("Checking environment variables...")

    const requiredVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "OPENAI_API_KEY",
    ]

    const optionalVars = ["JWT_SECRET", "ENCRYPTION_KEY", "SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD"]

    // Check required variables
    requiredVars.forEach((varName) => {
      if (!process.env[varName]) {
        this.addIssue(`Missing required environment variable: ${varName}`)
      }
    })

    // Check optional variables
    optionalVars.forEach((varName) => {
      if (!process.env[varName]) {
        this.addWarning(`Optional environment variable not set: ${varName}`)
      }
    })
  }

  checkPackageJson() {
    this.log("Checking package.json...")

    try {
      const packagePath = path.join(process.cwd(), "package.json")
      const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"))

      // Check for required scripts
      const requiredScripts = ["build", "start", "dev"]
      requiredScripts.forEach((script) => {
        if (!packageJson.scripts || !packageJson.scripts[script]) {
          this.addIssue(`Missing required script in package.json: ${script}`)
        }
      })

      // Check Node.js version compatibility
      if (packageJson.engines && packageJson.engines.node) {
        this.log(`Node.js version requirement: ${packageJson.engines.node}`)
      } else {
        this.addWarning("No Node.js version specified in package.json engines field")
      }
    } catch (error) {
      this.addIssue(`Error reading package.json: ${error.message}`)
    }
  }

  checkTypeScriptConfig() {
    this.log("Checking TypeScript configuration...")

    try {
      const tsconfigPath = path.join(process.cwd(), "tsconfig.json")
      if (!fs.existsSync(tsconfigPath)) {
        this.addIssue("tsconfig.json not found")
        return
      }

      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"))

      // Check for essential compiler options
      const requiredOptions = ["jsx", "module", "moduleResolution"]
      requiredOptions.forEach((option) => {
        if (!tsconfig.compilerOptions || !tsconfig.compilerOptions[option]) {
          this.addWarning(`TypeScript compiler option not set: ${option}`)
        }
      })
    } catch (error) {
      this.addIssue(`Error reading tsconfig.json: ${error.message}`)
    }
  }

  checkNextConfig() {
    this.log("Checking Next.js configuration...")

    const nextConfigPath = path.join(process.cwd(), "next.config.mjs")
    if (!fs.existsSync(nextConfigPath)) {
      this.addWarning("next.config.mjs not found - using default configuration")
      return
    }

    try {
      // Basic syntax check
      const configContent = fs.readFileSync(nextConfigPath, "utf8")
      if (!configContent.includes("export default")) {
        this.addIssue("next.config.mjs must export default configuration")
      }
    } catch (error) {
      this.addIssue(`Error reading next.config.mjs: ${error.message}`)
    }
  }

  checkDependencies() {
    this.log("Checking dependencies...")

    try {
      // Check if node_modules exists
      const nodeModulesPath = path.join(process.cwd(), "node_modules")
      if (!fs.existsSync(nodeModulesPath)) {
        this.addIssue("node_modules directory not found - run npm install")
        return
      }

      // Check for common dependency issues
      const packageLockPath = path.join(process.cwd(), "package-lock.json")
      const yarnLockPath = path.join(process.cwd(), "yarn.lock")

      if (fs.existsSync(packageLockPath) && fs.existsSync(yarnLockPath)) {
        this.addWarning("Both package-lock.json and yarn.lock found - this may cause issues")
      }
    } catch (error) {
      this.addIssue(`Error checking dependencies: ${error.message}`)
    }
  }

  checkBuildProcess() {
    this.log("Testing build process...")

    try {
      // Try to run type checking
      execSync("npx tsc --noEmit", { stdio: "pipe" })
      this.log("TypeScript compilation check passed")
    } catch (error) {
      this.addIssue(`TypeScript compilation failed: ${error.message}`)
    }

    try {
      // Try to run linting
      execSync("npx next lint --dir . --quiet", { stdio: "pipe" })
      this.log("ESLint check passed")
    } catch (error) {
      this.addWarning(`ESLint issues found: ${error.message}`)
    }
  }

  checkVercelConfig() {
    this.log("Checking Vercel configuration...")

    const vercelConfigPath = path.join(process.cwd(), "vercel.json")
    if (fs.existsSync(vercelConfigPath)) {
      try {
        const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, "utf8"))

        // Check for common configuration issues
        if (vercelConfig.functions) {
          this.log("Custom function configuration found")
        }

        if (vercelConfig.redirects && vercelConfig.redirects.length > 100) {
          this.addWarning("Large number of redirects may impact performance")
        }
      } catch (error) {
        this.addIssue(`Error reading vercel.json: ${error.message}`)
      }
    }
  }

  generateReport() {
    this.log("\n=== DEPLOYMENT TROUBLESHOOTING REPORT ===")

    if (this.issues.length === 0 && this.warnings.length === 0) {
      this.log("✅ No issues found! Your project should deploy successfully.", "info")
      return
    }

    if (this.issues.length > 0) {
      this.log("\n🚨 CRITICAL ISSUES (must be fixed):")
      this.issues.forEach((issue, index) => {
        this.log(`${index + 1}. ${issue}`, "error")
      })
    }

    if (this.warnings.length > 0) {
      this.log("\n⚠️  WARNINGS (recommended to fix):")
      this.warnings.forEach((warning, index) => {
        this.log(`${index + 1}. ${warning}`, "warn")
      })
    }

    this.log("\n=== RECOMMENDED ACTIONS ===")

    if (this.issues.length > 0) {
      this.log("1. Fix all critical issues listed above")
      this.log("2. Run this script again to verify fixes")
      this.log("3. Test local build with: npm run build")
      this.log("4. Try deployment again")
    }

    if (this.warnings.length > 0) {
      this.log("5. Address warnings for better deployment reliability")
    }

    this.log("\n=== ADDITIONAL DEBUGGING STEPS ===")
    this.log("• Check Vercel deployment logs for specific error messages")
    this.log("• Verify all environment variables are set in Vercel dashboard")
    this.log("• Ensure your Git repository is properly connected")
    this.log("• Try deploying from a clean branch")
    this.log("• Check Vercel status page: https://vercel-status.com")
  }

  async run() {
    this.log("Starting deployment troubleshooting...")

    this.checkEnvironmentVariables()
    this.checkPackageJson()
    this.checkTypeScriptConfig()
    this.checkNextConfig()
    this.checkDependencies()
    this.checkBuildProcess()
    this.checkVercelConfig()

    this.generateReport()
  }
}

// Run the troubleshooter
const troubleshooter = new DeploymentTroubleshooter()
troubleshooter.run().catch(console.error)
