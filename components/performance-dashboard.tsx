"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Zap, TrendingUp, Users, CheckCircle, Activity, Server, Cpu, HardDrive, Network, RefreshCw } from "lucide-react"

interface PerformanceMetrics {
  systemHealth: {
    uptime: number
    responseTime: number
    throughput: number
    errorRate: number
    availability: number
  }
  userMetrics: {
    activeUsers: number
    totalSessions: number
    averageSessionDuration: number
    bounceRate: number
    userSatisfaction: number
  }
  businessMetrics: {
    complianceRate: number
    automationRate: number
    timeSaved: number
    errorReduction: number
    costSavings: number
  }
  technicalMetrics: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    networkLatency: number
    databaseConnections: number
  }
}

interface PerformanceTrend {
  timestamp: string
  responseTime: number
  throughput: number
  activeUsers: number
  errorRate: number
  complianceRate: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    systemHealth: {
      uptime: 99.98,
      responseTime: 145,
      throughput: 2847,
      errorRate: 0.02,
      availability: 99.95,
    },
    userMetrics: {
      activeUsers: 342,
      totalSessions: 1247,
      averageSessionDuration: 18.5,
      bounceRate: 12.3,
      userSatisfaction: 4.7,
    },
    businessMetrics: {
      complianceRate: 96.8,
      automationRate: 78.2,
      timeSaved: 52.3,
      errorReduction: 85.7,
      costSavings: 234500,
    },
    technicalMetrics: {
      cpuUsage: 23.7,
      memoryUsage: 68.5,
      diskUsage: 42.1,
      networkLatency: 12,
      databaseConnections: 45,
    },
  })

  const [trends, setTrends] = useState<PerformanceTrend[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    fetchPerformanceData()
    const interval = setInterval(fetchPerformanceData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchPerformanceData = async () => {
    try {
      // Generate realistic trend data for the last 24 hours
      const now = new Date()
      const trendData: PerformanceTrend[] = []

      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
        trendData.push({
          timestamp: timestamp.toISOString(),
          responseTime: 120 + Math.random() * 60 + (i < 8 ? 20 : 0),
          throughput: 2000 + Math.random() * 1000 + (i < 8 ? 500 : 0),
          activeUsers: 200 + Math.random() * 200 + (i < 8 ? 100 : 0),
          errorRate: Math.random() * 0.1,
          complianceRate: 95 + Math.random() * 4,
        })
      }

      setTrends(trendData)

      // Update metrics with realistic variations
      setMetrics((prev) => ({
        systemHealth: {
          ...prev.systemHealth,
          responseTime: 120 + Math.random() * 60,
          throughput: 2500 + Math.random() * 700,
          errorRate: Math.random() * 0.05,
        },
        userMetrics: {
          ...prev.userMetrics,
          activeUsers: 300 + Math.random() * 100,
          totalSessions: 1200 + Math.random() * 100,
        },
        businessMetrics: {
          ...prev.businessMetrics,
          complianceRate: 95 + Math.random() * 4,
          automationRate: 75 + Math.random() * 8,
        },
        technicalMetrics: {
          ...prev.technicalMetrics,
          cpuUsage: 20 + Math.random() * 15,
          memoryUsage: 60 + Math.random() * 20,
          diskUsage: 40 + Math.random() * 10,
          networkLatency: 10 + Math.random() * 10,
          databaseConnections: 40 + Math.random() * 20,
        },
      }))

      setLastUpdate(new Date())
    } catch (error) {
      console.error("Error fetching performance data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getHealthStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return { status: "healthy", color: "text-green-600" }
    if (value >= thresholds.warning) return { status: "warning", color: "text-yellow-600" }
    return { status: "critical", color: "text-red-600" }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const formatTime = (value: number) => {
    return `${Math.round(value)}ms`
  }

  const formatNumber = (value: number) => {
    return Math.round(value).toLocaleString()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading performance dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Dashboard</h2>
          <p className="text-muted-foreground">Real-time system performance and business metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Last updated: {lastUpdate.toLocaleTimeString()}</span>
          <Button variant="outline" size="sm" onClick={fetchPerformanceData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatPercentage(metrics.systemHealth.uptime)}</div>
            <Progress value={metrics.systemHealth.uptime} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">99.95% SLA target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(metrics.systemHealth.responseTime)}</div>
            <p className="text-xs text-muted-foreground mt-1">Average response time</p>
            <div className="mt-2">
              <Badge variant={metrics.systemHealth.responseTime < 200 ? "default" : "secondary"}>
                {metrics.systemHealth.responseTime < 200 ? "Excellent" : "Good"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.userMetrics.activeUsers)}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently online</p>
            <div className="mt-2">
              <span className="text-xs text-green-600">+12% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(metrics.businessMetrics.complianceRate)}
            </div>
            <Progress value={metrics.businessMetrics.complianceRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Section 3 compliance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics.businessMetrics.costSavings)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Monthly savings</p>
            <div className="mt-2">
              <span className="text-xs text-green-600">+18% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="business">Business Metrics</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="technical">Technical Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trend (24h)</CardTitle>
                <CardDescription>Average response time over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends}>
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
                  <AreaChart data={trends}>
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
              <CardTitle>System Health Overview</CardTitle>
              <CardDescription>Current system health metrics and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Uptime</span>
                    <span className="text-sm text-green-600">{formatPercentage(metrics.systemHealth.uptime)}</span>
                  </div>
                  <Progress value={metrics.systemHealth.uptime} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Availability</span>
                    <span className="text-sm text-green-600">
                      {formatPercentage(metrics.systemHealth.availability)}
                    </span>
                  </div>
                  <Progress value={metrics.systemHealth.availability} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Error Rate</span>
                    <span className="text-sm text-green-600">{formatPercentage(metrics.systemHealth.errorRate)}</span>
                  </div>
                  <Progress value={100 - metrics.systemHealth.errorRate * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Performance</span>
                    <span className="text-sm text-green-600">Excellent</span>
                  </div>
                  <Progress value={95} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Automation Impact</CardTitle>
                <CardDescription>Business process automation metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Automation Rate</span>
                      <span className="text-sm font-bold">
                        {formatPercentage(metrics.businessMetrics.automationRate)}
                      </span>
                    </div>
                    <Progress value={metrics.businessMetrics.automationRate} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Time Saved (Hours/Month)</span>
                      <span className="text-sm font-bold">{metrics.businessMetrics.timeSaved.toFixed(1)}</span>
                    </div>
                    <Progress value={(metrics.businessMetrics.timeSaved / 100) * 100} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Error Reduction</span>
                      <span className="text-sm font-bold">
                        {formatPercentage(metrics.businessMetrics.errorReduction)}
                      </span>
                    </div>
                    <Progress value={metrics.businessMetrics.errorReduction} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Trend (24h)</CardTitle>
                <CardDescription>Section 3 compliance rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      }
                    />
                    <YAxis domain={[90, 100]} />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value) => [`${(value as number).toFixed(1)}%`, "Compliance Rate"]}
                    />
                    <Line type="monotone" dataKey="complianceRate" stroke={COLORS[2]} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ROI Analysis</CardTitle>
              <CardDescription>Return on investment and cost savings breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(metrics.businessMetrics.costSavings)}
                  </div>
                  <p className="text-sm text-muted-foreground">Monthly Savings</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(metrics.businessMetrics.costSavings * 12)}
                  </div>
                  <p className="text-sm text-muted-foreground">Annual Savings</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {metrics.businessMetrics.timeSaved.toFixed(0)}h
                  </div>
                  <p className="text-sm text-muted-foreground">Time Saved/Month</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">320%</div>
                  <p className="text-sm text-muted-foreground">ROI</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Activity (24h)</CardTitle>
                <CardDescription>Active users over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trends}>
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
                    <Area type="monotone" dataKey="activeUsers" stroke={COLORS[3]} fill={COLORS[3]} fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>User behavior and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Session Duration</span>
                    <span className="text-sm font-bold">{metrics.userMetrics.averageSessionDuration} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Bounce Rate</span>
                    <span className="text-sm font-bold">{formatPercentage(metrics.userMetrics.bounceRate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">User Satisfaction</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold">{metrics.userMetrics.userSatisfaction}/5.0</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-xs ${star <= metrics.userMetrics.userSatisfaction ? "text-yellow-400" : "text-gray-300"}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Sessions Today</span>
                    <span className="text-sm font-bold">{formatNumber(metrics.userMetrics.totalSessions)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(metrics.technicalMetrics.cpuUsage)}</div>
                <Progress value={metrics.technicalMetrics.cpuUsage} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.technicalMetrics.cpuUsage < 50
                    ? "Normal"
                    : metrics.technicalMetrics.cpuUsage < 80
                      ? "High"
                      : "Critical"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(metrics.technicalMetrics.memoryUsage)}</div>
                <Progress value={metrics.technicalMetrics.memoryUsage} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.technicalMetrics.memoryUsage < 70
                    ? "Normal"
                    : metrics.technicalMetrics.memoryUsage < 85
                      ? "High"
                      : "Critical"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(metrics.technicalMetrics.diskUsage)}</div>
                <Progress value={metrics.technicalMetrics.diskUsage} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.technicalMetrics.diskUsage < 60
                    ? "Normal"
                    : metrics.technicalMetrics.diskUsage < 80
                      ? "High"
                      : "Critical"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network Latency</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(metrics.technicalMetrics.networkLatency)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.technicalMetrics.networkLatency < 20
                    ? "Excellent"
                    : metrics.technicalMetrics.networkLatency < 50
                      ? "Good"
                      : "Poor"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Database Performance</CardTitle>
              <CardDescription>Database connections and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Active Connections</span>
                  <span className="font-bold">{Math.round(metrics.technicalMetrics.databaseConnections)}/100</span>
                </div>
                <Progress value={(metrics.technicalMetrics.databaseConnections / 100) * 100} />
                <div className="grid gap-4 md:grid-cols-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Pool Size</p>
                    <p className="font-medium">100</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Available</p>
                    <p className="font-medium">{100 - Math.round(metrics.technicalMetrics.databaseConnections)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Utilization</p>
                    <p className="font-medium">
                      {((metrics.technicalMetrics.databaseConnections / 100) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Query Time</p>
                    <p className="font-medium">12ms avg</p>
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
