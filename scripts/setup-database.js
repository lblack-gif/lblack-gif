#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")

class DatabaseSetup {
  constructor() {
    this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  }

  async runSQLFile(filename) {
    console.log(`📄 Running ${filename}...`)

    const filePath = path.join(__dirname, filename)
    const sql = fs.readFileSync(filePath, "utf8")

    try {
      const { error } = await this.supabase.rpc("exec_sql", { sql_query: sql })
      if (error) throw error
      console.log(`✅ ${filename} completed successfully`)
    } catch (error) {
      console.error(`❌ Error in ${filename}:`, error.message)
      throw error
    }
  }

  async setupDatabase() {
    console.log("🚀 Starting database setup...")

    const scripts = [
      "add-ai-integration-schema.sql",
      "add-worker-management-schema.sql",
      "seed-comprehensive-data.sql",
      "seed-worker-management-data.sql",
    ]

    for (const script of scripts) {
      await this.runSQLFile(script)
      // Wait between scripts to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    console.log("🎉 Database setup completed!")
  }

  async testConnection() {
    console.log("🔍 Testing database connection...")

    try {
      const { data, error } = await this.supabase.from("users").select("count").limit(1)

      if (error) throw error
      console.log("✅ Database connection successful")
      return true
    } catch (error) {
      console.error("❌ Database connection failed:", error.message)
      return false
    }
  }
}

async function main() {
  // Load environment variables
  require("dotenv").config({ path: ".env.local" })

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing required environment variables")
    console.log("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local")
    process.exit(1)
  }

  const setup = new DatabaseSetup()

  try {
    await setup.testConnection()
    await setup.setupDatabase()
    console.log("\n🎯 Setup complete! You can now run: npm run dev")
  } catch (error) {
    console.error("💥 Setup failed:", error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
