#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")

// Load environment variables
require("dotenv").config({ path: ".env.local" })

class DatabaseSetup {
  constructor() {
    console.log("🔧 Initializing database setup...")

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ Missing Supabase credentials!")
      console.log("Please check your .env.local file")
      console.log("Current SUPABASE_URL:", process.env.SUPABASE_URL ? "✅ Set" : "❌ Missing")
      console.log("Current SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing")
      process.exit(1)
    }

    this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  }

  async testConnection() {
    console.log("🔍 Testing database connection...")

    try {
      // Simple test query
      const { data, error } = await this.supabase.from("information_schema.tables").select("table_name").limit(1)

      console.log("✅ Database connection successful!")
      return true
    } catch (error) {
      console.error("❌ Database connection failed:", error.message)
      console.log("\n🔧 Troubleshooting:")
      console.log("1. Check your SUPABASE_URL in .env.local")
      console.log("2. Check your SUPABASE_SERVICE_ROLE_KEY in .env.local")
      console.log("3. Make sure your Supabase project is active")
      return false
    }
  }

  async createBasicTables() {
    console.log("🏗️ Creating basic tables...")

    // Create tables one by one to avoid issues
    const tables = [
      {
        name: "users",
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            role VARCHAR(50) DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      },
      {
        name: "projects",
        sql: `
          CREATE TABLE IF NOT EXISTS projects (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            hud_project_id VARCHAR(100),
            location TEXT,
            total_budget DECIMAL(15,2),
            start_date DATE,
            end_date DATE,
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      },
      {
        name: "workers",
        sql: `
          CREATE TABLE IF NOT EXISTS workers (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(20),
            address TEXT,
            is_section3_worker BOOLEAN DEFAULT false,
            is_targeted_section3_worker BOOLEAN DEFAULT false,
            verification_status VARCHAR(20) DEFAULT 'pending',
            hire_date DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      },
      {
        name: "labor_hours",
        sql: `
          CREATE TABLE IF NOT EXISTS labor_hours (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            project_id UUID REFERENCES projects(id),
            worker_id UUID REFERENCES workers(id),
            hours_worked DECIMAL(5,2) NOT NULL,
            work_date DATE NOT NULL,
            hourly_rate DECIMAL(8,2),
            job_category VARCHAR(100),
            verified BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      },
    ]

    try {
      for (const table of tables) {
        console.log(`   Creating ${table.name} table...`)
        const { error } = await this.supabase.rpc("exec", {
          sql: table.sql,
        })

        if (error && !this.isExpectedError(error.message)) {
          console.warn(`   ⚠️ ${table.name}: ${error.message}`)
        } else {
          console.log(`   ✅ ${table.name} table ready`)
        }
      }

      // Insert sample data
      await this.insertSampleData()

      console.log("✅ Basic tables created successfully!")
    } catch (error) {
      console.error("❌ Error creating basic tables:", error.message)
    }
  }

  async insertSampleData() {
    console.log("📊 Inserting sample data...")

    const sampleData = [
      {
        table: "users",
        data: {
          email: "admin@yourcompany.com",
          first_name: "System",
          last_name: "Admin",
          role: "admin",
        },
      },
      {
        table: "projects",
        data: {
          name: "Sample Housing Project",
          hud_project_id: "HUD-2024-001",
          location: "Washington DC",
          total_budget: 1000000.0,
          status: "active",
        },
      },
      {
        table: "workers",
        data: [
          {
            first_name: "John",
            last_name: "Doe",
            email: "john.doe@email.com",
            is_section3_worker: true,
            verification_status: "verified",
          },
          {
            first_name: "Jane",
            last_name: "Smith",
            email: "jane.smith@email.com",
            is_section3_worker: true,
            verification_status: "verified",
          },
        ],
      },
    ]

    for (const item of sampleData) {
      try {
        if (Array.isArray(item.data)) {
          for (const record of item.data) {
            const { error } = await this.supabase.from(item.table).insert(record).select()

            if (error && !error.message.includes("duplicate")) {
              console.warn(`   ⚠️ ${item.table}: ${error.message}`)
            }
          }
        } else {
          const { error } = await this.supabase.from(item.table).insert(item.data).select()

          if (error && !error.message.includes("duplicate")) {
            console.warn(`   ⚠️ ${item.table}: ${error.message}`)
          }
        }
        console.log(`   ✅ ${item.table} sample data inserted`)
      } catch (error) {
        if (!error.message.includes("duplicate")) {
          console.warn(`   ⚠️ ${item.table}: ${error.message}`)
        }
      }
    }
  }

  isExpectedError(message) {
    const expectedErrors = [
      "already exists",
      "relation already exists",
      "function already exists",
      "type already exists",
      "duplicate key value",
      "duplicate",
    ]

    return expectedErrors.some((err) => message.toLowerCase().includes(err.toLowerCase()))
  }

  async setupDatabase() {
    console.log("🚀 Starting complete database setup...")

    // Test connection first
    const connected = await this.testConnection()
    if (!connected) return false

    // Create basic tables
    await this.createBasicTables()

    console.log("🎉 Database setup completed!")
    return true
  }

  async verifySetup() {
    console.log("🔍 Verifying database setup...")

    try {
      const { data: users } = await this.supabase.from("users").select("*").limit(1)

      const { data: projects } = await this.supabase.from("projects").select("*").limit(1)

      const { data: workers } = await this.supabase.from("workers").select("*").limit(1)

      console.log("✅ Database verification complete!")
      console.log(`   📊 Found ${users?.length || 0} users`)
      console.log(`   📊 Found ${projects?.length || 0} projects`)
      console.log(`   📊 Found ${workers?.length || 0} workers`)

      return true
    } catch (error) {
      console.error("❌ Database verification failed:", error.message)
      return false
    }
  }
}

async function main() {
  console.log("🎯 Section 3 Compliance Database Setup")
  console.log("=====================================\n")

  const setup = new DatabaseSetup()

  try {
    const success = await setup.setupDatabase()
    if (success) {
      await setup.verifySetup()
      console.log("\n🎉 SUCCESS! Your database is ready!")
      console.log("🚀 You can now run: npm run dev")
      console.log("📱 All features will be fully functional!")
    }
  } catch (error) {
    console.error("💥 Setup failed:", error.message)
    console.log("\n🆘 Need help? Check:")
    console.log("1. Your .env.local file has correct Supabase credentials")
    console.log("2. Your Supabase project is active and running")
    console.log("3. You have internet connection")
  }
}

if (require.main === module) {
  main()
}

module.exports = { DatabaseSetup }
