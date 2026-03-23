import { NextResponse } from "next/server"
import { moduleConfig } from "@/lib/modules"
import {
  getAuthenticatedUser,
  isAdmin,
  unauthorizedResponse,
  forbiddenResponse,
  checkRateLimit,
  rateLimitResponse,
} from "@/lib/auth"

interface RemoteCommand {
  action: string
  target?: string
  params?: Record<string, unknown>
}

interface CommandResult {
  success: boolean
  action: string
  target?: string
  message: string
  data?: unknown
  timestamp: string
}

// Actions allowed right now. Everything else is blocked.
const ALLOWED_ACTIONS = new Set(["ping", "status"])

// Disabled actions — kept here so it's clear what will be re-enabled later.
// "restart-services", "clear-cache", "maintenance-mode",
// "toggle-module", "sync-hud", "backup", "generate-report"

// In-memory command history (would be persisted in production)
const commandHistory: CommandResult[] = []

// ---------------------------------------------------------------------------
// GET /api/remote-control — admin-only system status
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request)
  if (!user) return unauthorizedResponse()
  if (!isAdmin(user.role)) return forbiddenResponse()

  const modules = Object.entries(moduleConfig).map(([key, value]) => ({
    id: key,
    enabled: value.enabled,
    order: value.order,
  }))

  return NextResponse.json({
    status: "online",
    modules,
    recentCommands: commandHistory.slice(-20),
    systemInfo: {
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage(),
      environment: process.env.NODE_ENV || "development",
    },
    allowedActions: Array.from(ALLOWED_ACTIONS),
    timestamp: new Date().toISOString(),
  })
}

// ---------------------------------------------------------------------------
// POST /api/remote-control — execute a command (admin-only, rate-limited)
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  // 1. Auth check
  const user = await getAuthenticatedUser(request)
  if (!user) return unauthorizedResponse()
  if (!isAdmin(user.role)) return forbiddenResponse()

  // 2. Rate limit: 30 requests per minute per user
  const rl = checkRateLimit(`rc:${user.id}`, 30, 60_000)
  if (!rl.allowed) return rateLimitResponse(rl.resetAt)

  // 3. Parse body
  let body: RemoteCommand
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { action } = body
  if (!action) {
    return NextResponse.json({ error: "Action is required" }, { status: 400 })
  }

  // 4. Block disabled actions
  if (!ALLOWED_ACTIONS.has(action)) {
    return NextResponse.json(
      {
        error: `Action "${action}" is currently disabled`,
        allowedActions: Array.from(ALLOWED_ACTIONS),
      },
      { status: 403 },
    )
  }

  // 5. Execute
  const result = executeCommand(action)

  // 6. Log
  commandHistory.push(result)
  if (commandHistory.length > 100) {
    commandHistory.splice(0, commandHistory.length - 100)
  }

  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
    headers: {
      "X-RateLimit-Remaining": String(rl.remaining),
    },
  })
}

// ---------------------------------------------------------------------------
// Command execution — only safe, read-only actions
// ---------------------------------------------------------------------------
function executeCommand(action: string): CommandResult {
  const timestamp = new Date().toISOString()

  switch (action) {
    case "ping":
      return {
        success: true,
        action,
        message: "pong",
        timestamp,
      }

    case "status":
      return {
        success: true,
        action,
        message: "System status retrieved",
        data: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
        },
        timestamp,
      }

    default:
      return {
        success: false,
        action,
        message: `Unknown action: ${action}`,
        timestamp,
      }
  }
}
