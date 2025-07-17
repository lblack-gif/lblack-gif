import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          status: "warning",
          message: "OpenAI API key not configured",
        },
        { status: 200 },
      )
    }

    // Test AI service availability (without making actual API call)
    return NextResponse.json({
      status: "healthy",
      message: "AI services configured and ready",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "AI health check failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
