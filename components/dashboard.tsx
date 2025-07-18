"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Users, Building2, Clock, AlertTriangle, CheckCircle, TrendingUp, Mail, FileText, Calendar } from "lucide-react"
import { mockData } from "@/lib/supabase"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [totalHours, setTotalHours] = useState(12450)
  const [section3Hours, setSection3Hours] = useState(3890)

  // Calculate compliance percentage
  const compliancePercentage = Math.round((section3Hours / totalHours) * 100)

  // Mock data for charts
  const monthlyData = [
    { month: "Jan", total: 2100, section3: 650 },
    { month: "Feb", total: 2300, section3: 720 },
    { month: "Mar", total: 2200, section3: 690 },
    { month: "Apr", total: 2400, section3: 750 },
    { month: "May", total: 2150, section3: 670 },
    { month: "Jun", total: 2350, section3: 730 },
  ]

  const complianceData = [
    { name: "Section 3 Hours", value: section3Hours, color: "#00C49F" },
    { name: "Regular Hours", value: totalHours - section3Hours, color: "#0088FE" },
  ]

  const projectData = [
    { name: "Metro Housing", hours: 1200, compliance: 32 },
    { name: "Senior Complex", hours: 800, compliance: 28 },
    { name: "Community Center", hours: 950, compliance: 35 },
    { name: "Affordable Units", hours: 1340, compliance: 30 },
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Section 3 Compliance Dashboard</h2>
          <p className="text-muted-foreground">Real-time monitoring and compliance tracking</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Send Update
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Tracking</TabsTrigger>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="performance">Contractor Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Labor Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHours.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across all active projects</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Section 3 Hours</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{section3Hours.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{compliancePercentage}% of total hours</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">2 new this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Compliant</div>
                <p className="text-xs text-muted-foreground">Above 25% threshold</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Monthly Labor Hours Trend</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#0088FE" name="Total Hours" />
                    <Bar dataKey="section3" fill="#00C49F" name="Section 3 Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Compliance Breakdown</CardTitle>
                <CardDescription>Current labor hour distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={complianceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {complianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Important compliance notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>Metro Contractors project below 25% Section 3 threshold</span>
                      <Badge variant="destructive">5d overdue</Badge>
                    </div>
                  </AlertDescription>
                </Alert>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>Senior Housing Development compliance report submitted</span>
                      <Badge variant="secondary">2h ago</Badge>
                    </div>
                  </AlertDescription>
                </Alert>
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>Overall Section 3 compliance improved by 3% this month</span>
                      <Badge variant="secondary">1d ago</Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Monthly Report
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Users className="mr-2 h-4 w-4" />
                  Add New Worker
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Building2 className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Audit
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Performance</CardTitle>
              <CardDescription>Section 3 compliance by project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectData.map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">{project.hours} total hours</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">{project.compliance}%</p>
                        <p className="text-sm text-muted-foreground">Section 3</p>
                      </div>
                      <Progress value={project.compliance} className="w-20" />
                      <Badge variant={project.compliance >= 25 ? "default" : "destructive"}>
                        {project.compliance >= 25 ? "Compliant" : "Below Threshold"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Current Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{compliancePercentage}%</div>
                <Progress value={compliancePercentage} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-2">Target: 25% minimum</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Targeted Section 3</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">8.2%</div>
                <Progress value={82} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-2">Target: 5% minimum</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Compliance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">+3.2%</div>
                <p className="text-sm text-muted-foreground">vs. last month</p>
                <TrendingUp className="h-4 w-4 text-green-600 mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Worker Management</CardTitle>
              <CardDescription>Section 3 worker verification and tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.workers.map((worker) => (
                  <div key={worker.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {worker.first_name} {worker.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{worker.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={worker.is_section3_worker ? "default" : "secondary"}>
                        {worker.is_section3_worker ? "Section 3" : "Regular"}
                      </Badge>
                      {worker.is_targeted_section3_worker && <Badge variant="outline">Targeted</Badge>}
                      <Badge variant={worker.verification_status === "verified" ? "default" : "destructive"}>
                        {worker.verification_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contractor Performance</CardTitle>
              <CardDescription>Section 3 compliance by contractor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">ABC Construction</p>
                    <p className="text-sm text-muted-foreground">Metro Housing Development</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">28%</p>
                      <p className="text-sm text-muted-foreground">Section 3</p>
                    </div>
                    <Badge variant="default">Compliant</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Metro Contractors</p>
                    <p className="text-sm text-muted-foreground">Senior Housing Complex</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">22%</p>
                      <p className="text-sm text-muted-foreground">Section 3</p>
                    </div>
                    <Badge variant="destructive">Below Threshold</Badge>
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
