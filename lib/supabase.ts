import { createClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

// Use demo values when environment variables are missing (development only)
const defaultUrl = supabaseUrl || "https://demo.supabase.co"
const defaultKey =
  supabaseAnonKey ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

// Only throw error in production
if ((!supabaseUrl || !supabaseAnonKey) && process.env.NODE_ENV === "production") {
  throw new Error("Missing Supabase environment variables in production")
}

// Log warning in development
if ((!supabaseUrl || !supabaseAnonKey) && process.env.NODE_ENV !== "production") {
  console.warn("⚠️ Supabase environment variables not found. Using demo mode.")
}

export const supabase = createClient(defaultUrl, defaultKey, {
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
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
