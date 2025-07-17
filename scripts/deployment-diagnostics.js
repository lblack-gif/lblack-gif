#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("🔍 Section 3 Compliance System - Deployment Diagnostics")
console.log("=".repeat(60))

const issues = []
const fixes = []
const warnings = []

// Check Node.js version
function checkNodeVersion() {
  console.log("\n📦 Checking Node.js version...")
  const nodeVersion = process.version
  const majorVersion = Number.parseInt(nodeVersion.slice(1).split(".")[0])

  if (majorVersion < 18) {
    issues.push("Node.js version is too old. Requires Node.js 18+")
    fixes.push("Update Node.js to version 18 or higher")
  } else {
    console.log(`✅ Node.js version: ${nodeVersion}`)
  }
}

// Check package.json
function checkPackageJson() {
  console.log("\n📋 Checking package.json...")

  if (!fs.existsSync("package.json")) {
    issues.push("package.json not found")
    fixes.push("Run: npm init -y")
    return
  }

  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"))

  // Check required dependencies
  const requiredDeps = ["next", "react", "react-dom", "@supabase/supabase-js", "lucide-react", "tailwindcss"]

  const missingDeps = requiredDeps.filter(
    (dep) => !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep],
  )

  if (missingDeps.length > 0) {
    issues.push(`Missing dependencies: ${missingDeps.join(", ")}`)
    fixes.push(`Run: npm install ${missingDeps.join(" ")}`)
  } else {
    console.log("✅ All required dependencies found")
  }

  // Check scripts
  if (!packageJson.scripts?.build) {
    warnings.push("No build script found in package.json")
    fixes.push('Add "build": "next build" to package.json scripts')
  }

  if (!packageJson.scripts?.start) {
    warnings.push("No start script found in package.json")
    fixes.push('Add "start": "next start" to package.json scripts')
  }
}

// Check environment variables
function checkEnvironmentVariables() {
  console.log("\n🔐 Checking environment variables...")

  const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

  const envFiles = [".env.local", ".env", ".env.production"]
  let envFound = false

  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      envFound = true
      console.log(`✅ Found ${envFile}`)

      const envContent = fs.readFileSync(envFile, "utf8")
      const missingVars = requiredEnvVars.filter((varName) => !envContent.includes(varName))

      if (missingVars.length > 0) {
        warnings.push(`Missing environment variables in ${envFile}: ${missingVars.join(", ")}`)
      }
      break
    }
  }

  if (!envFound) {
    issues.push("No environment file found")
    fixes.push("Create .env.local with required environment variables")
  }
}

// Check Next.js configuration
function checkNextConfig() {
  console.log("\n⚙️  Checking Next.js configuration...")

  if (fs.existsSync("next.config.js") || fs.existsSync("next.config.mjs")) {
    console.log("✅ Next.js config found")
  } else {
    warnings.push("No Next.js config file found")
    fixes.push("Consider creating next.config.mjs for optimization")
  }
}

// Check TypeScript configuration
function checkTypeScript() {
  console.log("\n📝 Checking TypeScript configuration...")

  if (!fs.existsSync("tsconfig.json")) {
    issues.push("tsconfig.json not found")
    fixes.push("Run: npx tsc --init or create tsconfig.json")
    return
  }

  console.log("✅ TypeScript configuration found")

  try {
    const tsConfig = JSON.parse(fs.readFileSync("tsconfig.json", "utf8"))

    if (!tsConfig.compilerOptions?.strict) {
      warnings.push("TypeScript strict mode is not enabled")
    }

    if (!tsConfig.include?.includes("**/*.tsx")) {
      warnings.push("TSX files may not be included in TypeScript compilation")
    }
  } catch (error) {
    issues.push("Invalid tsconfig.json format")
    fixes.push("Fix JSON syntax in tsconfig.json")
  }
}

// Check Tailwind CSS
function checkTailwind() {
  console.log("\n🎨 Checking Tailwind CSS...")

  if (!fs.existsSync("tailwind.config.ts") && !fs.existsSync("tailwind.config.js")) {
    issues.push("Tailwind config not found")
    fixes.push("Run: npx tailwindcss init -p")
    return
  }

  console.log("✅ Tailwind config found")

  if (!fs.existsSync("postcss.config.js") && !fs.existsSync("postcss.config.mjs")) {
    warnings.push("PostCSS config not found")
    fixes.push("Create postcss.config.js for Tailwind processing")
  }
}

// Check build process
function checkBuild() {
  console.log("\n🔨 Testing build process...")

  try {
    console.log("Running build test...")
    execSync("npm run build", { stdio: "pipe" })
    console.log("✅ Build successful")
  } catch (error) {
    issues.push("Build process failed")
    fixes.push("Fix build errors before deployment")
    console.log("❌ Build failed:", error.message)
  }
}

// Check file structure
function checkFileStructure() {
  console.log("\n📁 Checking file structure...")

  const requiredFiles = ["app/layout.tsx", "app/page.tsx", "components/ui", "lib/utils.ts"]

  const missingFiles = requiredFiles.filter((file) => !fs.existsSync(file))

  if (missingFiles.length > 0) {
    issues.push(`Missing required files: ${missingFiles.join(", ")}`)
    fixes.push("Ensure all required Next.js App Router files are present")
  } else {
    console.log("✅ Required file structure present")
  }
}

// Check database schema
function checkDatabaseSchema() {
  console.log("\n🗄️  Checking database schema...")

  const schemaFiles = [
    "scripts/add-reporting-schema.sql",
    "scripts/add-ai-integration-schema.sql",
    "scripts/add-worker-management-schema.sql",
  ]

  const missingSchemas = schemaFiles.filter((file) => !fs.existsSync(file))

  if (missingSchemas.length > 0) {
    warnings.push(`Missing database schema files: ${missingSchemas.join(", ")}`)
    fixes.push("Run database setup scripts before deployment")
  } else {
    console.log("✅ Database schema files found")
  }
}

// Generate fix script
function generateFixScript() {
  if (fixes.length === 0) return

  console.log("\n🔧 Generating fix script...")

  const fixScript = `#!/bin/bash
# Auto-generated fix script for Section 3 Compliance System
# Generated on ${new Date().toISOString()}

echo "🔧 Applying fixes for deployment issues..."

${fixes
  .map(
    (fix, index) => `
echo "Fix ${index + 1}: ${fix}"
${fix.startsWith("Run: ") ? fix.replace("Run: ", "") : `echo "Manual fix required: ${fix}"`}
`,
  )
  .join("")}

echo "✅ All automated fixes applied!"
echo "Please review any manual fixes listed above."
`

  fs.writeFileSync("fix-deployment.sh", fixScript)
  execSync("chmod +x fix-deployment.sh")
  console.log("✅ Fix script created: ./fix-deployment.sh")
}

// Main diagnostic function
function runDiagnostics() {
  checkNodeVersion()
  checkPackageJson()
  checkEnvironmentVariables()
  checkNextConfig()
  checkTypeScript()
  checkTailwind()
  checkFileStructure()
  checkDatabaseSchema()

  // Only run build check if no critical issues
  if (issues.length === 0) {
    checkBuild()
  }

  // Summary
  console.log("\n" + "=".repeat(60))
  console.log("📊 DIAGNOSTIC SUMMARY")
  console.log("=".repeat(60))

  if (issues.length === 0) {
    console.log("✅ No critical issues found!")
  } else {
    console.log(`❌ ${issues.length} critical issue(s) found:`)
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`)
    })
  }

  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} warning(s):`)
    warnings.forEach((warning, index) => {
      console.log(`   ${index + 1}. ${warning}`)
    })
  }

  if (fixes.length > 0) {
    console.log(`\n🔧 ${fixes.length} recommended fix(es):`)
    fixes.forEach((fix, index) => {
      console.log(`   ${index + 1}. ${fix}`)
    })

    generateFixScript()
  }

  // Deployment recommendations
  console.log("\n🚀 DEPLOYMENT RECOMMENDATIONS:")

  if (issues.length === 0) {
    console.log("✅ Ready for deployment!")
    console.log("   • Use Vercel for optimal Next.js hosting")
    console.log("   • Ensure environment variables are set in production")
    console.log("   • Run database migrations before first deployment")
  } else {
    console.log("❌ Fix critical issues before deployment")
    console.log("   • Run ./fix-deployment.sh to apply automated fixes")
    console.log("   • Address manual fixes listed above")
    console.log("   • Re-run diagnostics after fixes")
  }

  console.log("\n📚 Additional Resources:")
  console.log("   • Next.js Deployment: https://nextjs.org/docs/deployment")
  console.log("   • Vercel Deployment: https://vercel.com/docs")
  console.log("   • Supabase Setup: https://supabase.com/docs")
}

// Run diagnostics
runDiagnostics()
