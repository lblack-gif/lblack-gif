import { NextResponse } from "next/server"
import { moduleConfig } from "@/lib/modules"

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

// System state tracked in-memory (would be persisted in production)
const systemState = {
  maintenanceMode: false,
  lastRestart: new Date().toISOString(),
  activeCommands: [] as CommandResult[],
}

export async function GET() {
  const modules = Object.entries(moduleConfig).map(([key, value]) => ({
    id: key,
    enabled: value.enabled,
    order: value.order,
  }))

  return NextResponse.json({
    status: "online",
    maintenanceMode: systemState.maintenanceMode,
    lastRestart: systemState.lastRestart,
    modules,
    recentCommands: systemState.activeCommands.slice(-20),
    systemInfo: {
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage(),
      environment: process.env.NODE_ENV || "development",
    },
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: Request) {
  try {
    const body: RemoteCommand = await request.json()
    const { action, target, params } = body

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    const result = executeCommand(action, target, params)

    systemState.activeCommands.push(result)
    if (systemState.activeCommands.length > 100) {
      systemState.activeCommands = systemState.activeCommands.slice(-100)
    }

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Invalid request body",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    )
  }
}

function executeCommand(
  action: string,
  target?: string,
  params?: Record<string, unknown>,
): CommandResult {
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
          maintenanceMode: systemState.maintenanceMode,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
        },
        timestamp,
      }

    case "toggle-module":
      if (!target) {
        return {
          success: false,
          action,
          message: "Module target is required",
          timestamp,
        }
      }
      if (!(target in moduleConfig)) {
        return {
          success: false,
          action,
          target,
          message: `Unknown module: ${target}`,
          timestamp,
        }
      }
      ;(moduleConfig as Record<string, { enabled: boolean; order: number }>)[target].enabled =
        !(moduleConfig as Record<string, { enabled: boolean; order: number }>)[target].enabled
      return {
        success: true,
        action,
        target,
        message: `Module ${target} ${(moduleConfig as Record<string, { enabled: boolean; order: number }>)[target].enabled ? "enabled" : "disabled"}`,
        data: { enabled: (moduleConfig as Record<string, { enabled: boolean; order: number }>)[target].enabled },
        timestamp,
      }

    case "maintenance-mode":
      const enable = params?.enable !== undefined ? Boolean(params.enable) : !systemState.maintenanceMode
      systemState.maintenanceMode = enable
      return {
        success: true,
        action,
        message: `Maintenance mode ${enable ? "enabled" : "disabled"}`,
        data: { maintenanceMode: enable },
        timestamp,
      }

    case "restart-services":
      systemState.lastRestart = timestamp
      return {
        success: true,
        action,
        message: "Services restart initiated",
        data: { restartTime: timestamp },
        timestamp,
      }

    case "clear-cache":
      return {
        success: true,
        action,
        message: "Cache cleared successfully",
        timestamp,
      }

    case "generate-report":
      return {
        success: true,
        action,
        target: target || "compliance",
        message: `Report generation initiated for: ${target || "compliance"}`,
        data: { reportType: target || "compliance", estimatedCompletion: "2 minutes" },
        timestamp,
      }

    case "sync-hud":
      return {
        success: true,
        action,
        message: "HUD data synchronization initiated",
        data: { syncType: "full", estimatedDuration: "5 minutes" },
        timestamp,
      }

    case "backup":
      return {
        success: true,
        action,
        message: "System backup initiated",
        data: { backupType: params?.type || "full", timestamp },
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
