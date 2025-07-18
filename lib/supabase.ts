import { createClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

// Validate URL format
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Use valid demo URL when environment variables are missing or invalid
const defaultUrl = "https://xyzcompany.supabase.co"
const defaultKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

// Determine which URL and key to use
let finalUrl = defaultUrl
let finalKey = defaultKey

if (supabaseUrl && isValidUrl(supabaseUrl) && supabaseAnonKey) {
  finalUrl = supabaseUrl
  finalKey = supabaseAnonKey
} else {
  // Only throw error in production if variables are missing or invalid
  if (process.env.NODE_ENV === "production") {
    if (!supabaseUrl) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable in production")
    }
    if (!isValidUrl(supabaseUrl)) {
      throw new Error("Invalid NEXT_PUBLIC_SUPABASE_URL format in production")
    }
    if (!supabaseAnonKey) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable in production")
    }
  } else {
    // Log warning in development
    console.warn("⚠️ Supabase environment variables not found or invalid. Using demo mode.")
    if (supabaseUrl && !isValidUrl(supabaseUrl)) {
      console.warn(`⚠️ Invalid Supabase URL format: ${supabaseUrl}`)
    }
  }
}

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Types based on our database schema
export interface Project {
  id: string
  name: string
  hud_project_id?: string
  location?: string
  total_budget?: number
  start_date?: string
  end_date?: string
  status: string
  created_at: string
  updated_at: string
}

export interface Worker {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  address?: string
  is_section3_worker: boolean
  is_targeted_section3_worker: boolean
  verification_status: string
  hire_date?: string
  created_at: string
  updated_at: string
}

export interface LaborHours {
  id: string
  project_id: string
  contractor_id: string
  worker_id: string
  hours_worked: number
  work_date: string
  hourly_rate?: number
  job_category?: string
  verified: boolean
  created_at: string
  updated_at: string
}

export interface Email {
  id: string
  sender_email?: string
  subject?: string
  body?: string
  received_at: string
  classification?: string
  priority: string
  status: string
  project_id?: string
  assigned_to?: string
  ai_summary?: string
  created_at: string
  updated_at: string
}

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  return !!(url && isValidUrl(url) && key)
}

// Mock data for demo mode
export const mockData = {
  projects: [
    {
      id: "1",
      name: "Metro Housing Development",
      hud_project_id: "HUD-2024-001",
      location: "Washington, DC",
      total_budget: 2500000,
      start_date: "2024-01-15",
      end_date: "2024-12-31",
      status: "active",
      created_at: "2024-01-15T00:00:00Z",
      updated_at: "2024-01-15T00:00:00Z",
    },
    {
      id: "2",
      name: "Senior Housing Complex",
      hud_project_id: "HUD-2024-002",
      location: "Washington, DC",
      total_budget: 1800000,
      start_date: "2024-03-01",
      end_date: "2025-02-28",
      status: "active",
      created_at: "2024-03-01T00:00:00Z",
      updated_at: "2024-03-01T00:00:00Z",
    },
  ],
  workers: [
    {
      id: "1",
      first_name: "John",
      last_name: "Smith",
      email: "john.smith@example.com",
      phone: "(202) 555-0123",
      address: "123 Main St, Washington, DC",
      is_section3_worker: true,
      is_targeted_section3_worker: false,
      verification_status: "verified",
      hire_date: "2024-02-01",
      created_at: "2024-02-01T00:00:00Z",
      updated_at: "2024-02-01T00:00:00Z",
    },
    {
      id: "2",
      first_name: "Maria",
      last_name: "Garcia",
      email: "maria.garcia@example.com",
      phone: "(202) 555-0124",
      address: "456 Oak Ave, Washington, DC",
      is_section3_worker: true,
      is_targeted_section3_worker: true,
      verification_status: "verified",
      hire_date: "2024-02-15",
      created_at: "2024-02-15T00:00:00Z",
      updated_at: "2024-02-15T00:00:00Z",
    },
  ],
  laborHours: [
    {
      id: "1",
      project_id: "1",
      contractor_id: "contractor-1",
      worker_id: "1",
      hours_worked: 40,
      work_date: "2024-07-08",
      hourly_rate: 25.5,
      job_category: "Construction",
      verified: true,
      created_at: "2024-07-08T00:00:00Z",
      updated_at: "2024-07-08T00:00:00Z",
    },
    {
      id: "2",
      project_id: "1",
      contractor_id: "contractor-1",
      worker_id: "2",
      hours_worked: 35,
      work_date: "2024-07-08",
      hourly_rate: 28.0,
      job_category: "Electrical",
      verified: true,
      created_at: "2024-07-08T00:00:00Z",
      updated_at: "2024-07-08T00:00:00Z",
    },
  ],
}
