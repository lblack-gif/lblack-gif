import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const section3Only = searchParams.get("section3") === "true"

    let query = supabase.from("workers").select(`
        *,
        worker_skills(skill_name, proficiency_level, certified),
        worker_verifications(verification_type, verification_status),
        worker_performance_metrics(quality_score, attendance_rate)
      `)

    // Apply filters
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (status !== "all") {
      query = query.eq("verification_status", status)
    }

    if (section3Only) {
      query = query.eq("is_section3_worker", true)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: workers, error, count } = await query.range(from, to).order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching workers:", error)
      return NextResponse.json({ error: "Failed to fetch workers" }, { status: 500 })
    }

    return NextResponse.json({
      workers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["first_name", "last_name", "address"]
    const missingFields = requiredFields.filter((field) => !body[field])

    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(", ")}` }, { status: 400 })
    }

    // Insert worker
    const { data: worker, error } = await supabase
      .from("workers")
      .insert({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zip_code: body.zip_code,
        is_section3_worker: body.is_section3_worker || false,
        is_targeted_section3_worker: body.is_targeted_section3_worker || false,
        hourly_rate: body.hourly_rate,
        skills: body.skills || [],
        certifications: body.certifications || [],
        verification_status: "pending",
        availability_status: "available",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating worker:", error)
      return NextResponse.json({ error: "Failed to create worker" }, { status: 500 })
    }

    // Add skills as separate records if provided
    if (body.skills && body.skills.length > 0) {
      const skillRecords = body.skills.map((skill: string) => ({
        worker_id: worker.id,
        skill_name: skill,
        proficiency_level: "intermediate",
        certified: false,
      }))

      await supabase.from("worker_skills").insert(skillRecords)
    }

    // Create audit log entry
    await supabase.from("audit_logs").insert({
      table_name: "workers",
      record_id: worker.id,
      action: "INSERT",
      new_values: worker,
      changed_by: "00000000-0000-0000-0000-000000000000", // System user
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
    })

    return NextResponse.json({ worker }, { status: 201 })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
