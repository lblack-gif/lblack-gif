import { type NextRequest, NextResponse } from "next/server"

// Mock data for demonstration
const mockSchedules = [
  {
    id: "1",
    name: "Weekly Section 3 Compliance Report",
    type: "compliance",
    frequency: "weekly",
    recipients: ["compliance@agency.gov", "director@agency.gov"],
    lastRun: "2024-01-08T09:00:00Z",
    nextRun: "2024-01-15T09:00:00Z",
    status: "active",
    format: "pdf",
    enabled: true,
  },
  {
    id: "2",
    name: "Monthly Performance Dashboard",
    type: "performance",
    frequency: "monthly",
    recipients: ["performance@agency.gov"],
    lastRun: "2024-01-01T08:00:00Z",
    nextRun: "2024-02-01T08:00:00Z",
    status: "active",
    format: "excel",
    enabled: true,
  },
  {
    id: "3",
    name: "Quarterly Financial Summary",
    type: "financial",
    frequency: "quarterly",
    recipients: ["finance@agency.gov", "audit@agency.gov"],
    lastRun: "2024-01-01T10:00:00Z",
    nextRun: "2024-04-01T10:00:00Z",
    status: "paused",
    format: "pdf",
    enabled: false,
  },
]

const mockHistory = [
  {
    id: "1",
    scheduleId: "1",
    reportName: "Weekly Section 3 Compliance Report",
    generatedAt: "2024-01-08T09:00:00Z",
    status: "completed",
    fileSize: "2.4 MB",
    downloadUrl: "/reports/compliance-2024-01-08.pdf",
    generationTime: 45,
  },
  {
    id: "2",
    scheduleId: "2",
    reportName: "Monthly Performance Dashboard",
    generatedAt: "2024-01-01T08:00:00Z",
    status: "completed",
    fileSize: "5.1 MB",
    downloadUrl: "/reports/performance-2024-01.xlsx",
    generationTime: 120,
  },
  {
    id: "3",
    scheduleId: "1",
    reportName: "Weekly Section 3 Compliance Report",
    generatedAt: "2024-01-01T09:00:00Z",
    status: "failed",
    fileSize: "0 MB",
    error: "Database connection timeout",
    generationTime: 0,
  },
]

export async function GET(request: NextRequest) {
  try {
    // In a real application, you would fetch from your database
    // For now, we'll return mock data

    return NextResponse.json({
      success: true,
      schedules: mockSchedules,
      history: mockHistory,
    })
  } catch (error) {
    console.error("Error fetching report schedules:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch report schedules",
        schedules: mockSchedules, // Fallback data
        history: mockHistory,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // In a real application, you would save to your database
    const newSchedule = {
      id: Date.now().toString(),
      ...body,
      status: body.enabled ? "active" : "paused",
      lastRun: null,
      nextRun: getNextRunDate(body.frequency),
    }

    return NextResponse.json({
      success: true,
      schedule: newSchedule,
    })
  } catch (error) {
    console.error("Error creating report schedule:", error)
    return NextResponse.json({ success: false, error: "Failed to create report schedule" }, { status: 500 })
  }
}

function getNextRunDate(frequency: string): string {
  const now = new Date()
  switch (frequency) {
    case "daily":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    case "weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    case "monthly":
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString()
    case "quarterly":
      return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate()).toISOString()
    default:
      return now.toISOString()
  }
}
