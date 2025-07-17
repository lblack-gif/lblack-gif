"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  LineChart,
  Line,
} from "recharts"
import {
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  Target,
  Award,
  Building2,
  AlertTriangle,
  FileBarChart,
  UserCheck,
  Calendar,
} from "lucide-react"

export function Dashboard() {
  const [complianceData, setComplianceData] = useState({
    totalHours: 12450,
    section3Hours: 3890,
    targetedSection3Hours: 2340,
    section3Percentage: 31.2,
    targetedSection3Percentage: 18.8,
    requiredPercentage: 25,
    targetedRequiredPercentage: 15,
    totalWorkers: 156,
    section3Workers: 48,
    targetedSection3Workers: 29,
    activeProjects: 8,
    complianceStatus: "compliant",
  })

  const [projectData] = useState([
    {
      name: "Affordable Housing Phase 1",
      section3: 35,
      targeted: 22,
      total: 100,
      status: "compliant",
      contractor: "ABC Construction",
    },
    {
      name: "Community Center Renovation",
      section3: 28,
      targeted: 18,
      total: 85,
      status: "compliant",
      contractor: "XYZ Builders",
    },
    {
      name: "Senior Housing Development",
      section3: 22,
      targeted: 12,
      total: 95,
      status: "at-risk",
      contractor: "Metro Contractors",
    },
    {
      name: "Mixed-Use Development",
      section3: 40,
      targeted: 25,
      total: 120,
      status: "compliant",
      contractor: "City Development",
    },
    {
      name: "Public Housing Modernization",
      section3: 33,
      targeted: 20,
      total: 110,
      status: "compliant",
      contractor: "ABC Construction",
    },
  ])

  const [monthlyTrends] = useState([
    { month: "Jan", section3: 28, targeted: 16, required: 25, targetedRequired: 15 },
    { month: "Feb", section3: 29, targeted: 17, required: 25, targetedRequired: 15 },
    { month: "Mar", section3: 31, targeted: 18, required: 25, targetedRequired: 15 },
    { month: "Apr", section3: 30, targeted: 19, required: 25, targetedRequired: 15 },
    { month: "May", section3: 32, targeted: 20, required: 25, targetedRequired: 15 },
    { month: "Jun", section3: 31, targeted: 19, required: 25, targetedRequired: 15 },
  ])

  const [contractorPerformance] = useState([
    {
      name: "ABC Construction",
      overallScore: 92,
      section3Rate: 35,
      targetedRate: 22,
      projects: 2,
      totalHours: 4200,
      complianceHistory: [
        { month: "Jan", score: 88 },
        { month: "Feb", score: 90 },
        { month: "Mar", score: 91 },
        { month: "Apr", score: 89 },
        { month: "May", score: 93 },
        { month: "Jun", score: 92 },
      ],
      status: "excellent",
    },
    {
      name: "XYZ Builders",
      overallScore: 78,
      section3Rate: 28,
      targetedRate: 18,
      projects: 1,
      totalHours: 2100,
      complianceHistory: [
        { month: "Jan", score: 75 },
        { month: "Feb", score: 76 },
        { month: "Mar", score: 79 },
        { month: "Apr", score: 77 },
        { month: "May", score: 80 },
        { month: "Jun", score: 78 },
      ],
      status: "good",
    },
    {
      name: "Metro Contractors",
      overallScore: 65,
      section3Rate: 22,
      targetedRate: 12,
      projects: 1,
      totalHours: 1800,
      complianceHistory: [
        { month: "Jan", score: 70 },
        { month: "Feb", score: 68 },
        { month: "Mar", score: 62 },
        { month: "Apr", score: 64 },
        { month: "May", score: 67 },
        { month: "Jun", score: 65 },
      ],
      status: "needs-improvement",
    },
    {
      name: "City Development",
      overallScore: 88,
      section3Rate: 40,
      targetedRate: 25,
      projects: 1,
      totalHours: 2800,
      complianceHistory: [
        { month: "Jan", score: 85 },
        { month: "Feb", score: 87 },
        { month: "Mar", score: 89 },
        { month: "Apr", score: 86 },
        { month: "May", score: 90 },
        { month: "Jun", score: 88 },
      ],
      status: "excellent",
    },
  ])

  const [complianceAlerts] = useState([
    {
      type: "warning",
      message: "Metro Contractors project below 25% Section 3 threshold",
      project: "Senior Housing Development",
      severity: "medium",
      daysOverdue: 5,
    },
    {
      type: "info",
      message: "Quarterly HUD report due in 7 days",
      project: "All Projects",
      severity: "low",
      daysOverdue: 0,
    },
    {
      type: "success",
      message: "ABC Construction exceeded targeted Section 3 goals",
      project: "Affordable Housing Phase 1",
      severity: "low",
      daysOverdue: 0,
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
      case "excellent":
        return "text-green-600"
      case "at-risk":
      case "good":
        return "text-yellow-600"
      case "non-compliant":
      case "needs-improvement":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
      case "excellent":
        return (
          <Badge className="bg-green-100 text-green-800">
            {status === "compliant" ? "Compliant" : "Excellent"}
          </Badge>
        )
      case "at-risk":
      case "good":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            {status === "at-risk" ? "At Risk" : "Good"}
          </Badge>
        )
      case "non-compliant":
      case "needs-improvement":
        return (
          <Badge className="bg-red-100 text-red-800">
            {status === "non-compliant" ? "Non-Compliant" : "Needs Improvement"}
          </Badge>
        )
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "info":
        return <Calendar className="h-4 w-4 text-blue-600" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]
  const pieData = [
    { name: "Targeted Section 3", value: complianceData.targetedSection3Hours, fill: "#0d9488" },
    {
      name: "Section 3 (Non-Targeted)",
      value: complianceData.section3Hours - complianceData.targetedSection3Hours,
      fill: "#10b981",
    },
    {
      name: "Non-Section 3",
      value: complianceData.totalHours - complianceData.section3Hours,
      fill: "#6b7280",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Section 3 Compliance Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time monitoring and compliance tracking</p>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-600">System Operational</span>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Labor Hours */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Labor Hours</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {complianceData.totalHours.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">Across all active projects</p>
          </CardContent>
        </Card>

        {/* Section 3 Hours */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Section 3 Hours</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {complianceData.section3Hours.toLocaleString()}
            </div>
            <div className="flex items-center mt-1">
              <span className="text-sm font-medium text-green-600">
                {complianceData.section3Percentage}%
              </span>
              <span className="text-xs text-gray-600 ml-1">of total hours</span>
            </div>
            <Progress value={complianceData.section3Percentage} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {/* Targeted Section 3 Hours */}
        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Targeted Section 3 Hours</CardTitle>
            <Target className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              {complianceData.targetedSection3Hours.toLocaleString()}
            </div>
            <div className="flex items-center mt-1">
              <span className="text-sm font-medium text-teal-600">
                {complianceData.targetedSection3Percentage}%
              </span>
              <span className="text-xs text-gray-600 ml-1">of total hours</span>
            </div>
            <Progress value={complianceData.targetedSection3Percentage} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {/* Compliance Status */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getStatusBadge(complianceData.complianceStatus)}
              <div className="text-xs text-gray-600">
                <div>
                  Section 3: {complianceData.section3Percentage}% (req:{" "}
                  {complianceData.requiredPercentage}%)
                </div>
                <div>
                  Targeted: {complianceData.targetedSection3Percentage}% (req:{" "}
                  {complianceData.targetedRequiredPercentage}%)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="compliance-tracking">Compliance Tracking</TabsTrigger>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="contractor-performance">Contractor Performance</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Breakdown Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Breakdown</CardTitle>
                <CardDescription>Current labor hour distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    />
                    <Tooltip formatter={(value) => [value.toLocaleString(), "Hours"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Important compliance notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceAlerts.map((alert, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 border rounded-lg">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                        <p className="text-xs text-gray-500">{alert.project}</p>
                      </div>
                      {alert.daysOverdue > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {alert.daysOverdue}d overdue
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Worker Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Worker Statistics</CardTitle>
              <CardDescription>Current workforce composition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Workers</span>
                    <span className="text-2xl font-bold">{complianceData.totalWorkers}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Section 3 Workers</span>
                    <span className="text-sm font-medium text-green-600">
                      {complianceData.section3Workers}
                    </span>
                  </div>
                  <Progress
                    value={(complianceData.section3Workers / complianceData.totalWorkers) * 100}
                    className="h-2"
                  />
                  <div className="text-xs text-gray-500">
                    {((complianceData.section3Workers / complianceData.totalWorkers) * 100).toFixed(1)}% of workforce
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Targeted Section 3 Workers</span>
                    <span className="text-sm font-medium text-teal-600">
                      {complianceData.targetedSection3Workers}
                    </span>
                  </div>
                  <Progress
                    value={(complianceData.targetedSection3Workers / complianceData.totalWorkers) * 100}
                    className="h-2"
                  />
                  <div className="text-xs text-gray-500">
                    {((complianceData.targetedSection3Workers / complianceData.totalWorkers) * 100).toFixed(1)}% of workforce
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Compliance Status</CardTitle>
              <CardDescription>Section 3 and Targeted Section 3 performance by project</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={projectData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="targeted" fill="#0d9488" name="Targeted Section 3 %" />
                  <Bar dataKey="section3" fill="#10b981" name="Section 3 %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Project Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Detailed project information and contractor assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectData.map((project, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-gray-600">
                        Contractor: {project.contractor}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Section 3: {project.section3}%
                        </div>
                        <div className="text-sm text-gray-600">
                          Targeted: {project.targeted}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{project.total}</div>
                        <div className="text-xs text-gray-600">Total Hours</div>
                      </div>
                      {getStatusBadge(project.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tracking */}
        <TabsContent value="compliance-tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Trends</CardTitle>
              <CardDescription>
                Monthly Section 3 and Targeted Section 3 performance tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="section3"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Section 3 %"
                  />
                  <Line
                    type="monotone"
                    dataKey="targeted"
                    stroke="#0d9488"
                    strokeWidth={3}
                    name="Targeted Section 3 %"
                  />
                  <Line
                    type="monotone"
                    dataKey="required"
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                    name="Required %"
                  />
                  <Line
                    type="monotone"
                    dataKey="targetedRequired"
                    stroke="#f97316"
                    strokeDasharray="5 5"
                    name="Targeted Required %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {complianceData.section3Percentage}%
                    </div>
                    <p className="text-sm text-muted-foreground">Section 3 Rate</p>
                    <Progress value={complianceData.section3Percentage} className="h-2 mt-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Targeted Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-teal-600">
                      {complianceData.targetedSection3Percentage}%
                    </div>
                    <p className="text-sm text-muted-foreground">Targeted Section 3 Rate</p>
                    <Progress
                      value={complianceData.targetedSection3Percentage}
                      className="h-2 mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hours Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {(complianceData.totalHours * 0.15).toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Verification Needed</p>
                    <Progress value={15} className="h-2 mt-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </Card>
        </TabsContent>

        {/* Workers */}
        <TabsContent value="workers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Workers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {complianceData.totalWorkers}
                </div>
                <p className="text-sm text-gray-600">Currently employed</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Full-time</span>
                    <span className="font-medium">124</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Part-time</span>
                    <span className="font-medium">32</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Section 3 Workers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {complianceData.section3Workers}
                </div>
                <p className="text-sm text-gray-600">Verified Section 3 status</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Newly hired</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Existing</span>
                    <span className="font-medium">36</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Targeted Section 3</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-teal-600">
                  {complianceData.targetedSection3Workers}
                </div>
                <p className="text-sm text-gray-600">High-priority category</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Public housing residents</span>
                    <span className="font-medium">18</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Voucher holders</span>
                    <span className="font-medium">11</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Worker Skills and Training */}
          <Card>
            <CardHeader>
              <CardTitle>Worker Skills & Training</CardTitle>
              <CardDescription>Section 3 worker development and capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <UserCheck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-lg font-bold">32</div>
                  <div className="text-sm text-gray-600">Skilled Trades</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Building2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-bold">16</div>
                  <div className="text-sm text-gray-600">Construction</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <FileBarChart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-lg font-bold">8</div>
                  <div className="text-sm text-gray-600">Administrative</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                  <div className="text-lg font-bold">24</div>
                  <div className="text-sm text-gray-600">In Training</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contractor Performance */}
        <TabsContent value="contractor-performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contractor Performance Overview</CardTitle>
              <CardDescription>
                Section 3 compliance rates and performance metrics by contractor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contractorPerformance.map((contractor, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-5 w-5 text-gray-500" />
                        <div>
                          <h3 className="font-medium">{contractor.name}</h3>
                          <p className="text-sm text-gray-600">
                            {contractor.projects} active projects •{" "}
                            {contractor.totalHours.toLocaleString()} total hours
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-bold">{contractor.overallScore}%</div>
                          <div className="text-xs text-gray-600">Overall Score</div>
                        </div>
                        {getStatusBadge(contractor.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">
                          {contractor.section3Rate}%
                        </div>
                        <div className="text-sm text-gray-600">Section 3 Rate</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-teal-600">
                          {contractor.targetedRate}%
                        </div>
                        <div className="text-sm text-gray-600">Targeted Section 3</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">
                          {contractor.projects}
                        </div>
                        <div className="text-sm text-gray-600">Active Projects</div>
                      </div>
                    </div>

                    {/* Performance Trend */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">6-Month Performance Trend</h4>
                      <ResponsiveContainer width="100%" height={100}>
                        <LineChart data={contractor.complianceHistory}>
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke={
                              contractor.status === "excellent"
                                ? "#10b981"
                                : contractor.status === "good"
                                ? "#f59e0b"
                                : "#ef4444"
                            }
                            strokeWidth={2}
                            dot={false}
                          />
                          <Tooltip />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contractor Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Contractor Comparison</CardTitle>
              <CardDescription>Side-by-side performance comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={contractorPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="section3Rate" fill="#10b981" name="Section 3 Rate %" />
                  <Bar dataKey="targetedRate" fill="#0d9488" name="Targeted Section 3 Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common compliance management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="h-6 w-6 text-blue-600 mb-2" />
              <div className="font-medium">Register Worker</div>
              <div className="text-sm text-gray-600">Add new Section 3 worker</div>
            </button>

            <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <Clock className="h-6 w-6 text-green-600 mb-2" />
              <div className="font-medium">Log Hours</div>
              <div className="text-sm text-gray-600">Record labor hours</div>
            </button>

            <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <TrendingUp className="h-6 w-6 text-purple-600 mb-2" />
              <div className="font-medium">Generate Report</div>
              <div className="text-sm text-gray-600">Create compliance report</div>
            </button>

            <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <Target className="h-6 w-6 text-teal-600 mb-2" />
              <div className="font-medium">Verify Status</div>
              <div className="text-sm text-gray-600">Check targeted eligibility</div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
