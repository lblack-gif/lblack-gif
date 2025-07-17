"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
  Activity,
  Server,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Network,
  Zap,
  TrendingUp,
  RefreshCw,
} from "lucide-react"

interface SystemMetrics {
  uptime: number
  responseTime: number
  throughput: number
  errorRate: number
  activeUsers: number
  databaseConnections: number
  memoryUsage: number
  cpuUsage: number
  diskUsage: number
  networkLatency: number
}

interface PerformanceData {
  timestamp: string
  responseTime: number
  throughput: number
  errorRate: number
  activeUsers: number
}

interface ServiceStatus {
  name: string
  status: "healthy" | "warning" | "critical" | "down"
  responseTime: number
  uptime: number
  lastCheck: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function SystemMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    uptime: 99.98,
    responseTime: 145,
    throughput: 2847,
    errorRate: 0.02,
    activeUsers: 342,
    databaseConnections: 45,
    memoryUsage: 68.5,
    cpuUsage: 23.7,
    diskUsage: 42.1,
    networkLatency: 12,
  })

  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    fetchSystemMetrics()
    const interval = setInterval(fetchSystemMetrics, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSystemMetrics = async () => {
    try {
      // Generate realistic performance data for the last 24 hours
      const now = new Date()
      const performanceData: PerformanceData[] = []

      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
        performanceData.push({
          timestamp: timestamp.toISOString(),
          responseTime: 120 + Math.random() * 60 + (i < 8 ? 20 : 0), // Higher during business hours
          throughput: 2000 + Math.random() * 1000 + (i < 8 ? 500 : 0),
          errorRate: Math.random() * 0.1,
          activeUsers: 200 + Math.random() * 200 + (i < 8 ? 100 : 0),
        })
      }

      setPerformanceData(performanceData)

      // Mock service status data
      const serviceStatuses: ServiceStatus[] = [
        {
          name: "Web Application",
          status: "healthy",
          responseTime: 145,
          uptime: 99.98,
          lastCheck: new Date().toISOString(),
        },
        {
          name: "Database (Supabase)",
          status: "healthy",
          responseTime: 23,
          uptime: 99.99,
          lastCheck: new Date().toISOString(),
        },
        {
          name: "AI Services (OpenAI)",
          status: "healthy",
          responseTime: 892,
          uptime: 99.95,
          lastCheck: new Date().toISOString(),
        },
        {
          name: "Email Service",
          status: "healthy",
          responseTime: 234,
          uptime: 99.97,
          lastCheck: new Date().toISOString(),
        },
        {
          name: "HUD SPEARS API",
          status: "warning",
          responseTime: 1245,
          uptime: 98.5,
          lastCheck: new Date().toISOString(),
        },
        {
          name: "HUD IDIS API",
          status: "healthy",
          responseTime: 567,
          uptime: 99.2,
          lastCheck: new Date().toISOString(),
        },
        {
          name: "Payroll Integration",
          status: "healthy",
          responseTime: 445,
          uptime: 99.8,
          lastCheck: new Date().toISOString(),
        },
        {
          name: "Mobile API",
          status: "healthy",
          responseTime: 178,
          uptime: 99.95,
          lastCheck: new Date().toISOString(),
        },
      ]

      setServices(serviceStatuses)

      // Update metrics with some realistic variations
      setMetrics((prev) => ({
        ...prev,
        responseTime: 120 + Math.random() * 60,
        throughput: 2500 + Math.random() * 700,
        errorRate: Math.random() * 0.05,
        activeUsers: 300 + Math.random() * 100,
        databaseConnections: 40 + Math.random() * 20,
        memoryUsage: 60 + Math.random() * 20,
        cpuUsage: 20 + Math.random() * 15,
        diskUsage: 40 + Math.random() * 10,
        networkLatency: 10 + Math.random() * 10,
      }))

      setLastUpdate(new Date())
    } catch (error) {
      console.error("Error fetching system metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "critical":
        return "text-orange-600"
      case "down":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return CheckCircle
      case "warning":
        return AlertTriangle
      case "critical":
        return AlertTriangle
      case "down":
        return AlertTriangle
      default:
        return Clock
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return "default"
      case "warning":
        return "secondary"
      case "critical":
        return "destructive"
      case "down":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`
  }

  const formatResponseTime = (time: number) => {
    return `${Math.round(time)}ms`
  }

  const formatThroughput = (throughput: number) => {
    return `${Math.round(throughput)}/min`
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading system monitoring...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Monitoring</h2>
          <p className="text-muted-foreground">Real-time system health and performance monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Last updated: {lastUpdate.toLocaleTimeString()}</span>
          <Button variant="outline" size="sm" onClick={fetchSystemMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Alert */}
      {services.some((s) => s.status === "critical" || s.status === "down") && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            One or more critical services are experiencing issues. Please review the service status below.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatUptime(metrics.uptime)}</div>
            <Progress value={metrics.uptime} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatResponseTime(metrics.responseTime)}</div>
            <p className="text-xs text-muted-foreground mt-1">Average response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatThroughput(metrics.throughput)}</div>
            <p className="text-xs text-muted-foreground mt-1">Requests per minute</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${metrics.errorRate < 0.01 ? "text-green-600" : metrics.errorRate < 0.05 ? "text-yellow-600" : "text-red-600"}`}
            >
              {(metrics.errorRate * 100).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Error percentage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.activeUsers)}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently online</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          {/* Performance Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Response Time (24h)</CardTitle>
                <CardDescription>Average response time over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value) => [`${Math.round(value as number)}ms`, "Response Time"]}
                    />
                    <Line type="monotone" dataKey="responseTime" stroke={COLORS[0]} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Throughput (24h)</CardTitle>
                <CardDescription>Requests per minute over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value) => [`${Math.round(value as number)}`, "Requests/min"]}
                    />
                    <Area type="monotone" dataKey="throughput" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Users (24h)</CardTitle>
              <CardDescription>Number of active users over the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value) => [`${Math.round(value as number)}`, "Active Users"]}
                  />
                  <Area type="monotone" dataKey="activeUsers" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Current status of all system services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, index) => {
                  const StatusIcon = getStatusIcon(service.status)

                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(service.status)}`} />
                        <div>
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Last checked: {new Date(service.lastCheck).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatResponseTime(service.responseTime)}</p>
                          <p className="text-xs text-muted-foreground">Response time</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatUptime(service.uptime)}</p>
                          <p className="text-xs text-muted-foreground">Uptime</p>
                        </div>
                        <Badge variant={getStatusBadge(service.status) as any}>{service.status}</Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.cpuUsage.toFixed(1)}%</div>
                <Progress value={metrics.cpuUsage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.memoryUsage.toFixed(1)}%</div>
                <Progress value={metrics.memoryUsage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.diskUsage.toFixed(1)}%</div>
                <Progress value={metrics.diskUsage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network Latency</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(metrics.networkLatency)}ms</div>
                <p className="text-xs text-muted-foreground mt-1">Average latency</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Database Connections</CardTitle>
              <CardDescription>Active database connections and pool status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Active Connections</span>
                  <span className="font-bold">{Math.round(metrics.databaseConnections)}/100</span>
                </div>
                <Progress value={(metrics.databaseConnections / 100) * 100} />
                <div className="grid gap-4 md:grid-cols-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Pool Size</p>
                    <p className="font-medium">100</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Available</p>
                    <p className="font-medium">{100 - Math.round(metrics.databaseConnections)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Utilization</p>
                    <p className="font-medium">{((metrics.databaseConnections / 100) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Recent system alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-800">HUD SPEARS API Slow Response</h4>
                    <p className="text-sm text-yellow-700">
                      HUD SPEARS API is responding slower than usual (1.2s average). This may affect report generation.
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">2 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50 border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-800">Database Backup Completed</h4>
                    <p className="text-sm text-green-700">
                      Scheduled database backup completed successfully. All data is secure.
                    </p>
                    <p className="text-xs text-green-600 mt-1">15 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50 border-blue-200">
                  <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-800">High Traffic Detected</h4>
                    <p className="text-sm text-blue-700">
                      System is experiencing higher than normal traffic. All services are operating normally.
                    </p>
                    <p className="text-xs text-blue-600 mt-1">1 hour ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
