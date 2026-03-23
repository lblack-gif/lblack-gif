"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Radio,
  Power,
  RefreshCw,
  Trash2,
  FileText,
  Database,
  Server,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Shield,
  Settings,
  Terminal,
} from "lucide-react"

interface SystemStatus {
  status: string
  maintenanceMode: boolean
  lastRestart: string
  modules: Array<{ id: string; enabled: boolean; order: number }>
  recentCommands: CommandResult[]
  systemInfo: {
    uptime: number
    nodeVersion: string
    platform: string
    memoryUsage: {
      rss: number
      heapTotal: number
      heapUsed: number
      external: number
    }
    environment: string
  }
  timestamp: string
}

interface CommandResult {
  success: boolean
  action: string
  target?: string
  message: string
  data?: unknown
  timestamp: string
}

const quickActions = [
  { action: "ping", label: "Ping", icon: Activity, description: "Test system connectivity" },
  { action: "status", label: "Status", icon: Server, description: "Get system status" },
  { action: "clear-cache", label: "Clear Cache", icon: Trash2, description: "Clear all caches" },
  { action: "restart-services", label: "Restart", icon: RefreshCw, description: "Restart services" },
  { action: "sync-hud", label: "Sync HUD", icon: Database, description: "Sync HUD data" },
  { action: "backup", label: "Backup", icon: Shield, description: "Create system backup" },
]

const reportTypes = [
  { target: "compliance", label: "Compliance Report" },
  { target: "labor-hours", label: "Labor Hours Report" },
  { target: "contractor-performance", label: "Contractor Performance" },
  { target: "audit-summary", label: "Audit Summary" },
]

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function formatBytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatModuleName(id: string): string {
  return id
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

export function RemoteControl() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [commandLog, setCommandLog] = useState<CommandResult[]>([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/remote-control")
      if (response.ok) {
        const data: SystemStatus = await response.json()
        setSystemStatus(data)
      }
    } catch (error) {
      console.error("Failed to fetch system status:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 15000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  const executeCommand = async (
    action: string,
    target?: string,
    params?: Record<string, unknown>,
  ) => {
    setExecuting(action)
    try {
      const response = await fetch("/api/remote-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, target, params }),
      })
      const result: CommandResult = await response.json()
      setCommandLog((prev) => [result, ...prev].slice(0, 50))
      await fetchStatus()
    } catch (error) {
      setCommandLog((prev) => [
        {
          success: false,
          action,
          message: `Network error: ${error instanceof Error ? error.message : "Unknown"}`,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 50))
    } finally {
      setExecuting(null)
    }
  }

  const toggleModule = async (moduleId: string) => {
    await executeCommand("toggle-module", moduleId)
  }

  const toggleMaintenance = async () => {
    await executeCommand("maintenance-mode", undefined, {
      enable: !systemStatus?.maintenanceMode,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-3 text-lg text-slate-600">Connecting to remote control...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <Radio className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Remote Control</h2>
            <p className="text-sm text-slate-500">Centralized system management interface</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge
            variant={systemStatus?.status === "online" ? "default" : "destructive"}
            className={
              systemStatus?.status === "online"
                ? "bg-green-100 text-green-700 border-green-200"
                : ""
            }
          >
            {systemStatus?.status === "online" ? "Online" : "Offline"}
          </Badge>
          {systemStatus?.maintenanceMode && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Maintenance Mode
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={fetchStatus}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {systemStatus?.maintenanceMode && (
        <Alert className="border-amber-200 bg-amber-50">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            System is in maintenance mode. Some features may be unavailable to end users.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="commands" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="commands">Quick Actions</TabsTrigger>
          <TabsTrigger value="modules">Module Control</TabsTrigger>
          <TabsTrigger value="system">System Info</TabsTrigger>
          <TabsTrigger value="log">Command Log</TabsTrigger>
        </TabsList>

        {/* Quick Actions Tab */}
        <TabsContent value="commands" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((qa) => (
              <Card key={qa.action} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <qa.icon className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{qa.label}</p>
                        <p className="text-xs text-slate-500">{qa.description}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => executeCommand(qa.action)}
                      disabled={executing === qa.action}
                    >
                      {executing === qa.action ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Maintenance Mode Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Maintenance Mode</span>
              </CardTitle>
              <CardDescription>
                Enable maintenance mode to restrict access during updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">
                    Status:{" "}
                    <span
                      className={
                        systemStatus?.maintenanceMode
                          ? "text-amber-600 font-medium"
                          : "text-green-600 font-medium"
                      }
                    >
                      {systemStatus?.maintenanceMode ? "Enabled" : "Disabled"}
                    </span>
                  </p>
                </div>
                <Switch
                  checked={systemStatus?.maintenanceMode || false}
                  onCheckedChange={toggleMaintenance}
                />
              </div>
            </CardContent>
          </Card>

          {/* Report Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Generate Reports</span>
              </CardTitle>
              <CardDescription>Trigger on-demand report generation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {reportTypes.map((rt) => (
                  <Button
                    key={rt.target}
                    variant="outline"
                    size="sm"
                    onClick={() => executeCommand("generate-report", rt.target)}
                    disabled={executing === "generate-report"}
                    className="text-xs"
                  >
                    {rt.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Module Control Tab */}
        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Power className="h-5 w-5" />
                <span>Module Management</span>
              </CardTitle>
              <CardDescription>Enable or disable system modules remotely</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemStatus?.modules.map((mod) => (
                  <div
                    key={mod.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant="outline"
                        className={
                          mod.enabled
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }
                      >
                        {mod.enabled ? "On" : "Off"}
                      </Badge>
                      <span className="font-medium text-slate-700">
                        {formatModuleName(mod.id)}
                      </span>
                    </div>
                    <Switch
                      checked={mod.enabled}
                      onCheckedChange={() => toggleModule(mod.id)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Info Tab */}
        <TabsContent value="system" className="space-y-4">
          {systemStatus?.systemInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Runtime</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Uptime</span>
                    <span className="text-sm font-medium">
                      {formatUptime(systemStatus.systemInfo.uptime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Node Version</span>
                    <span className="text-sm font-medium">
                      {systemStatus.systemInfo.nodeVersion}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Platform</span>
                    <span className="text-sm font-medium">
                      {systemStatus.systemInfo.platform}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Environment</span>
                    <Badge variant="outline" className="text-xs">
                      {systemStatus.systemInfo.environment}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Last Restart</span>
                    <span className="text-sm font-medium">
                      {new Date(systemStatus.lastRestart).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Memory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">RSS</span>
                    <span className="text-sm font-medium">
                      {formatBytes(systemStatus.systemInfo.memoryUsage.rss)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Heap Total</span>
                    <span className="text-sm font-medium">
                      {formatBytes(systemStatus.systemInfo.memoryUsage.heapTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Heap Used</span>
                    <span className="text-sm font-medium">
                      {formatBytes(systemStatus.systemInfo.memoryUsage.heapUsed)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">External</span>
                    <span className="text-sm font-medium">
                      {formatBytes(systemStatus.systemInfo.memoryUsage.external)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Command Log Tab */}
        <TabsContent value="log" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Terminal className="h-5 w-5" />
                    <span>Command History</span>
                  </CardTitle>
                  <CardDescription>Recent remote commands and their results</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCommandLog([])}
                  disabled={commandLog.length === 0}
                >
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {commandLog.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Terminal className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No commands executed yet</p>
                  <p className="text-sm mt-1">Use Quick Actions to get started</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {commandLog.map((cmd, index) => (
                    <div
                      key={`${cmd.timestamp}-${index}`}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      {cmd.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-mono font-medium text-slate-700">
                            {cmd.action}
                            {cmd.target ? `:${cmd.target}` : ""}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${cmd.success ? "text-green-600" : "text-red-600"}`}
                          >
                            {cmd.success ? "OK" : "FAIL"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{cmd.message}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-400">
                            {new Date(cmd.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
