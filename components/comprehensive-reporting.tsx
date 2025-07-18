"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  FileText,
  Users,
  Clock,
  Building,
  AlertTriangle,
  CheckCircle,
  Download,
  Calendar,
  Target,
  Award,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ComplianceMetrics {
  totalProjects: number
  activeProjects: number
  totalLaborHours: number
  section3LaborHours: number
  complianceRate: number
  totalWorkers: number
  section3Workers: number
  targetedWorkers: number
  contractorsCount: number
  averageWage: number
}

interface MonthlyData {
  month: string
  totalHours: number
  section3Hours: number
  complianceRate: number
  newHires: number
}

interface ProjectCompliance {
  projectName: string
  totalHours: number
  section3Hours: number
  complianceRate: number
  status: string
  riskLevel: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function ComprehensiveReporting() {
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    totalProjects: 0,
    activeProjects: 0,
    totalLaborHours: 0,
    section3LaborHours: 0,
    complianceRate: 0,
    totalWorkers: 0,
    section3Workers: 0,
    targetedWorkers: 0,
    contractorsCount: 0,
    averageWage: 0,
  })

  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [projectCompliance, setProjectCompliance] = useState<ProjectCompliance[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState("12months")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportingData()
  }, [selectedPeriod])

  const fetchReportingData = async () => {
    try {
      // Fetch comprehensive metrics
      const [projectsData, laborHoursData, workersData, contractorsData] = await Promise.all([
        supabase.from("projects").select("*"),
        supabase.from("labor_hours").select("*"),
        supabase.from("workers").select("*"),
        supabase.from("contractor_registrations").select("*"),
      ])

      const projects = projectsData.data || []
      const laborHours = laborHoursData.data || []
      const workers = workersData.data || []
      const contractors = contractorsData.data || []

      // Calculate metrics
      const totalLaborHours = laborHours.reduce((sum, record) => sum + Number(record.hours_worked), 0)
      const section3LaborHours = laborHours
        .filter((record) => record.workers?.is_section3_worker)
        .reduce((sum, record) => sum + Number(record.hours_worked), 0)

      const complianceRate = totalLaborHours > 0 ? (section3LaborHours / totalLaborHours) * 100 : 0

      setMetrics({
        totalProjects: projects.length,
        activeProjects: projects.filter((p) => p.status === "active").length,
        totalLaborHours,
        section3LaborHours,
        complianceRate,
        totalWorkers: workers.length,
        section3Workers: workers.filter((w) => w.is_section3_worker).length,
        targetedWorkers: workers.filter((w) => w.is_targeted_section3_worker).length,
        contractorsCount: contractors.filter((c) => c.registration_status === "approved").length,
        averageWage:
          laborHours.length > 0
            ? laborHours.reduce((sum, record) => sum + (record.hourly_rate || 0), 0) / laborHours.length
            : 0,
      })

      // Generate mock monthly data for demonstration
      const mockMonthlyData: MonthlyData[] = [
        { month: "Jan", totalHours: 2400, section3Hours: 720, complianceRate: 30, newHires: 12 },
        { month: "Feb", totalHours: 2800, section3Hours: 840, complianceRate: 30, newHires: 15 },
        { month: "Mar", totalHours: 3200, section3Hours: 1120, complianceRate: 35, newHires: 18 },
        { month: "Apr", totalHours: 2900, section3Hours: 1015, complianceRate: 35, newHires: 14 },
        { month: "May", totalHours: 3400, section3Hours: 1190, complianceRate: 35, newHires: 20 },
        { month: "Jun", totalHours: 3600, section3Hours: 1440, complianceRate: 40, newHires: 22 },
        { month: "Jul", totalHours: 3800, section3Hours: 1520, complianceRate: 40, newHires: 25 },
        { month: "Aug", totalHours: 3500, section3Hours: 1400, complianceRate: 40, newHires: 19 },
        { month: "Sep", totalHours: 3300, section3Hours: 1320, complianceRate: 40, newHires: 17 },
        { month: "Oct", totalHours: 3700, section3Hours: 1665, complianceRate: 45, newHires: 23 },
        { month: "Nov", totalHours: 3900, section3Hours: 1755, complianceRate: 45, newHires: 26 },
        { month: "Dec", totalHours: 3200, section3Hours: 1600, complianceRate: 50, newHires: 21 },
      ]

      setMonthlyData(mockMonthlyData)

      // Generate mock project compliance data
      const mockProjectCompliance: ProjectCompliance[] = [
        {
          projectName: "Downtown Housing",
          totalHours: 8500,
          section3Hours: 4250,
          complianceRate: 50,
          status: "active",
          riskLevel: "low",
        },
        {
          projectName: "Community Center",
          totalHours: 6200,
          section3Hours: 2170,
          complianceRate: 35,
          status: "active",
          riskLevel: "medium",
        },
        {
          projectName: "School Renovation",
          totalHours: 4800,
          section3Hours: 1200,
          complianceRate: 25,
          status: "active",
          riskLevel: "high",
        },
        {
          projectName: "Park Development",
          totalHours: 3400,
          section3Hours: 1360,
          complianceRate: 40,
          status: "completed",
          riskLevel: "low",
        },
        {
          projectName: "Bridge Repair",
          totalHours: 5600,
          section3Hours: 1680,
          complianceRate: 30,
          status: "active",
          riskLevel: "medium",
        },
      ]

      setProjectCompliance(mockProjectCompliance)
    } catch (error) {
      console.error("Error fetching reporting data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getComplianceStatus = (rate: number) => {
    if (rate >= 25) return { status: "Compliant", color: "default", icon: CheckCircle }
    if (rate >= 20) return { status: "At Risk", color: "secondary", icon: AlertTriangle }
    return { status: "Non-Compliant", color: "destructive", icon: AlertTriangle }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "default"
      case "medium":
        return "secondary"
      case "high":
        return "destructive"
      default:
        return "outline"
    }
  }

  const pieData = [
    { name: "Section 3 Hours", value: metrics.section3LaborHours, color: COLORS[0] },
    { name: "Regular Hours", value: metrics.totalLaborHours - metrics.section3LaborHours, color: COLORS[1] },
  ]

  const workerDistribution = [
    { name: "Targeted Section 3", value: metrics.targetedWorkers, color: COLORS[0] },
    { name: "Section 3", value: metrics.section3Workers - metrics.targetedWorkers, color: COLORS[1] },
    { name: "Regular Workers", value: metrics.totalWorkers - metrics.section3Workers, color: COLORS[2] },
  ]

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading comprehensive reports...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Comprehensive Reporting</h2>
          <p className="text-muted-foreground">Complete Section 3 compliance analytics and insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.complianceRate.toFixed(1)}%</div>
            <Progress value={metrics.complianceRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Target: 25% minimum</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Labor Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLaborHours.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.section3LaborHours.toLocaleString()} Section 3 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeProjects}</div>
            <p className="text-xs text-muted-foreground">of {metrics.totalProjects} total projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Section 3 Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.section3Workers}</div>
            <p className="text-xs text-muted-foreground">{metrics.targetedWorkers} targeted hires</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Wage</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.averageWage.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">per hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Status Alert */}
      {metrics.complianceRate < 25 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Current compliance rate ({metrics.complianceRate.toFixed(1)}%) is below the 25% Section 3 requirement.
            Immediate action required to meet HUD standards.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="projects">Project Analysis</TabsTrigger>
          <TabsTrigger value="workforce">Workforce</TabsTrigger>
          <TabsTrigger value="hud">HUD Reporting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Labor Hours Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Labor Hours Distribution</CardTitle>
                <CardDescription>Section 3 vs Regular Labor Hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value.toLocaleString(), "Hours"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Worker Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Worker Distribution</CardTitle>
                <CardDescription>Breakdown by Section 3 status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={workerDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {workerDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Workers"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
              <CardDescription>Labor hours and compliance rate trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="totalHours" fill={COLORS[0]} name="Total Hours" />
                  <Bar yAxisId="left" dataKey="section3Hours" fill={COLORS[1]} name="Section 3 Hours" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="complianceRate"
                    stroke={COLORS[2]}
                    name="Compliance %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Trends</CardTitle>
              <CardDescription>Historical compliance rate and hiring trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="complianceRate"
                    stroke={COLORS[0]}
                    name="Compliance Rate %"
                    strokeWidth={3}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="newHires"
                    stroke={COLORS[1]}
                    name="New Hires"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Compliance Analysis</CardTitle>
              <CardDescription>Individual project performance and risk assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectCompliance.map((project, index) => {
                  const complianceStatus = getComplianceStatus(project.complianceRate)
                  const Icon = complianceStatus.icon

                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{project.projectName}</h3>
                          <Badge variant={complianceStatus.color as any}>
                            <Icon className="h-3 w-3 mr-1" />
                            {complianceStatus.status}
                          </Badge>
                          <Badge variant={getRiskColor(project.riskLevel) as any}>{project.riskLevel} risk</Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Hours</p>
                            <p className="font-medium">{project.totalHours.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Section 3 Hours</p>
                            <p className="font-medium">{project.section3Hours.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Compliance Rate</p>
                            <p className="font-medium">{project.complianceRate}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Status</p>
                            <p className="font-medium capitalize">{project.status}</p>
                          </div>
                        </div>
                        <Progress value={project.complianceRate} className="mt-2" />
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workforce" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Workforce Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Workers</span>
                  <span className="font-bold">{metrics.totalWorkers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Section 3 Workers</span>
                  <span className="font-bold text-blue-600">{metrics.section3Workers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Targeted Section 3</span>
                  <span className="font-bold text-green-600">{metrics.targetedWorkers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Contractors</span>
                  <span className="font-bold">{metrics.contractorsCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hiring Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Section 3 Hire Rate</span>
                  <span className="font-bold">
                    {((metrics.section3Workers / metrics.totalWorkers) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Targeted Hire Rate</span>
                  <span className="font-bold">
                    {((metrics.targetedWorkers / metrics.totalWorkers) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average Wage</span>
                  <span className="font-bold">${metrics.averageWage.toFixed(2)}/hr</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Labor Hour Goal</span>
                    <span>25%</span>
                  </div>
                  <Progress value={metrics.complianceRate} />
                  <p className="text-xs text-muted-foreground">Current: {metrics.complianceRate.toFixed(1)}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>HUD Compliance Report</CardTitle>
              <CardDescription>Ready-to-submit Section 3 compliance documentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Section 3 Labor Hour Benchmarks</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Required Minimum (25%)</span>
                      <span className="font-medium">{(metrics.totalLaborHours * 0.25).toLocaleString()} hours</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Actual Section 3 Hours</span>
                      <span className="font-medium text-blue-600">
                        {metrics.section3LaborHours.toLocaleString()} hours
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Compliance Status</span>
                      <span
                        className={`font-medium ${metrics.complianceRate >= 25 ? "text-green-600" : "text-red-600"}`}
                      >
                        {metrics.complianceRate >= 25 ? "COMPLIANT" : "NON-COMPLIANT"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Reporting Period Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Reporting Period</span>
                      <span className="font-medium">January - December 2024</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Projects</span>
                      <span className="font-medium">{metrics.totalProjects}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Participating Contractors</span>
                      <span className="font-medium">{metrics.contractorsCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Generate HUD Report
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline">Submit to HUD</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
