"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { Building, FileCheck, TrendingUp, AlertTriangle, CheckCircle, Upload, Bell, Users, Clock } from "lucide-react"
import { format, addDays } from "date-fns"
import { supabase } from "@/lib/supabase"

interface ContractorRegistration {
  id: string
  company_name: string
  contact_email: string
  contact_phone?: string
  business_address?: string
  section3_certified: boolean
  certification_documents: string[]
  registration_status: string
  created_at: string
}

interface ContractorKPI {
  id: string
  contractor_id: string
  reporting_period: string
  total_labor_hours: number
  section3_labor_hours: number
  compliance_rate: number
  section3_hires: number
  total_hires: number
  projects_count: number
}

interface ComplianceAlert {
  id: string
  contractor_id: string
  alert_type: string
  title: string
  message?: string
  due_date?: string
  priority: string
  status: string
  created_at: string
}

export function ContractorManagement() {
  const [registrations, setRegistrations] = useState<ContractorRegistration[]>([])
  const [kpis, setKpis] = useState<ContractorKPI[]>([])
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([])
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [selectedContractor, setSelectedContractor] = useState<string>("all")
  const [calendarView, setCalendarView] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)

  const [newRegistration, setNewRegistration] = useState({
    company_name: "",
    contact_email: "",
    contact_phone: "",
    business_address: "",
    section3_certified: false,
    certification_documents: [] as string[],
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [registrationsData, kpisData, alertsData] = await Promise.all([
        supabase.from("contractor_registrations").select("*").order("created_at", { ascending: false }),
        supabase.from("contractor_kpis").select("*").order("reporting_period", { ascending: false }),
        supabase.from("compliance_alerts").select("*").eq("status", "active").order("due_date", { ascending: true }),
      ])

      setRegistrations(registrationsData.data || [])
      setKpis(kpisData.data || [])
      setAlerts(alertsData.data || [])
    } catch (error) {
      console.error("Error fetching contractor data:", error)
    } finally {
      setLoading(false)
    }
  }

  const submitRegistration = async () => {
    try {
      const { error } = await supabase.from("contractor_registrations").insert({
        company_name: newRegistration.company_name,
        contact_email: newRegistration.contact_email,
        contact_phone: newRegistration.contact_phone,
        business_address: newRegistration.business_address,
        section3_certified: newRegistration.section3_certified,
        certification_documents: newRegistration.certification_documents,
        registration_status: "pending",
      })

      if (error) throw error

      setShowRegistrationForm(false)
      setNewRegistration({
        company_name: "",
        contact_email: "",
        contact_phone: "",
        business_address: "",
        section3_certified: false,
        certification_documents: [],
      })
      fetchData()
    } catch (error) {
      console.error("Error submitting registration:", error)
    }
  }

  const approveRegistration = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contractor_registrations")
        .update({
          registration_status: "approved",
          approved_by: "00000000-0000-0000-0000-000000000000", // This would be current user
          approved_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error("Error approving registration:", error)
    }
  }

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("compliance_alerts")
        .update({
          status: "acknowledged",
          acknowledged_at: new Date().toISOString(),
        })
        .eq("id", alertId)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error("Error acknowledging alert:", error)
    }
  }

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // In a real app, you'd upload to storage and get URLs
      const mockUrls = Array.from(files).map((file) => `doc_${Date.now()}_${file.name}`)
      setNewRegistration({
        ...newRegistration,
        certification_documents: [...newRegistration.certification_documents, ...mockUrls],
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default"
      case "pending":
        return "secondary"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getComplianceStatus = (rate: number) => {
    if (rate >= 25) return { status: "Compliant", color: "default", icon: CheckCircle }
    if (rate >= 20) return { status: "At Risk", color: "secondary", icon: AlertTriangle }
    return { status: "Non-Compliant", color: "destructive", icon: AlertTriangle }
  }

  // Mock calendar events for demonstration
  const getCalendarEvents = (date: Date) => {
    const events = [
      { date: addDays(date, 2), title: "Monthly Report Due", type: "deadline" },
      { date: addDays(date, 5), title: "Quarterly Review", type: "meeting" },
      { date: addDays(date, 10), title: "Training Session", type: "training" },
    ]
    return events.filter(
      (event) => event.date.getMonth() === date.getMonth() && event.date.getFullYear() === date.getFullYear(),
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading contractor management...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Contractor Management</h2>
          <p className="text-muted-foreground">Manage contractor registrations and track performance</p>
        </div>
        <Button onClick={() => setShowRegistrationForm(true)}>
          <Building className="h-4 w-4 mr-2" />
          Register Contractor
        </Button>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription>You have {alerts.length} active compliance alerts requiring attention.</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="registry" className="space-y-4">
        <TabsList>
          <TabsTrigger value="registry">Contractor Registry</TabsTrigger>
          <TabsTrigger value="performance">Performance KPIs</TabsTrigger>
          <TabsTrigger value="alerts">Compliance Alerts</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="registry" className="space-y-4">
          {/* Contractor Registry */}
          <Card>
            <CardHeader>
              <CardTitle>Contractor Registry</CardTitle>
              <CardDescription>Manage contractor registrations and certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {registrations.map((registration) => (
                  <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <h3 className="font-semibold">{registration.company_name}</h3>
                        <Badge variant={getStatusColor(registration.registration_status)}>
                          {registration.registration_status}
                        </Badge>
                        {registration.section3_certified && (
                          <Badge variant="default">
                            <FileCheck className="h-3 w-3 mr-1" />
                            Section 3 Certified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{registration.contact_email}</p>
                      <p className="text-xs text-muted-foreground">
                        Registered: {new Date(registration.created_at).toLocaleDateString()}
                      </p>
                      {registration.certification_documents.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {registration.certification_documents.length} documents uploaded
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {registration.registration_status === "pending" && (
                        <Button variant="outline" size="sm" onClick={() => approveRegistration(registration.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Registration Form */}
          {showRegistrationForm && (
            <Card>
              <CardHeader>
                <CardTitle>Contractor Registration</CardTitle>
                <CardDescription>Register a new contractor for Section 3 compliance tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      value={newRegistration.company_name}
                      onChange={(e) => setNewRegistration({ ...newRegistration, company_name: e.target.value })}
                      placeholder="Enter company name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input
                      type="email"
                      value={newRegistration.contact_email}
                      onChange={(e) => setNewRegistration({ ...newRegistration, contact_email: e.target.value })}
                      placeholder="contact@company.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input
                      value={newRegistration.contact_phone}
                      onChange={(e) => setNewRegistration({ ...newRegistration, contact_phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Section 3 Certified</Label>
                    <Select
                      value={newRegistration.section3_certified.toString()}
                      onValueChange={(value) =>
                        setNewRegistration({ ...newRegistration, section3_certified: value === "true" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Business Address</Label>
                  <Textarea
                    value={newRegistration.business_address}
                    onChange={(e) => setNewRegistration({ ...newRegistration, business_address: e.target.value })}
                    placeholder="Enter complete business address"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Certification Documents</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Upload Section 3 certification documents</p>
                    <Input type="file" multiple accept=".pdf,.doc,.docx" onChange={handleDocumentUpload} />
                  </div>
                  {newRegistration.certification_documents.length > 0 && (
                    <div className="space-y-1">
                      {newRegistration.certification_documents.map((doc, index) => (
                        <p key={index} className="text-xs text-muted-foreground">
                          📄 {doc}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={submitRegistration}>Submit Registration</Button>
                  <Button variant="outline" onClick={() => setShowRegistrationForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Performance KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contractors</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{registrations.length}</div>
                <p className="text-xs text-muted-foreground">
                  {registrations.filter((r) => r.registration_status === "approved").length} approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Compliance Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpis.length > 0
                    ? Math.round(kpis.reduce((sum, kpi) => sum + kpi.compliance_rate, 0) / kpis.length)
                    : 0}
                  %
                </div>
                <Progress
                  value={kpis.length > 0 ? kpis.reduce((sum, kpi) => sum + kpi.compliance_rate, 0) / kpis.length : 0}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Section 3 Hires</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.reduce((sum, kpi) => sum + kpi.section3_hires, 0)}</div>
                <p className="text-xs text-muted-foreground">
                  of {kpis.reduce((sum, kpi) => sum + kpi.total_hires, 0)} total hires
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alerts.length}</div>
                <p className="text-xs text-muted-foreground">
                  {alerts.filter((a) => a.priority === "high" || a.priority === "critical").length} high priority
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Individual Contractor Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Contractor Performance</CardTitle>
              <CardDescription>Individual contractor compliance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kpis.map((kpi) => {
                  const complianceStatus = getComplianceStatus(kpi.compliance_rate)
                  const Icon = complianceStatus.icon

                  return (
                    <div key={kpi.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">Contractor {kpi.contractor_id.slice(0, 8)}</h3>
                          <Badge variant={complianceStatus.color as any}>
                            <Icon className="h-3 w-3 mr-1" />
                            {complianceStatus.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Compliance Rate</p>
                            <p className="font-medium">{kpi.compliance_rate}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Labor Hours</p>
                            <p className="font-medium">{kpi.section3_labor_hours.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Section 3 Hires</p>
                            <p className="font-medium">{kpi.section3_hires}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Projects</p>
                            <p className="font-medium">{kpi.projects_count}</p>
                          </div>
                        </div>
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

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Alerts</CardTitle>
              <CardDescription>Active alerts and deadline reminders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(alert.priority)}>{alert.priority}</Badge>
                        <h3 className="font-semibold">{alert.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Type: {alert.alert_type.replace("_", " ")}</span>
                        {alert.due_date && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due: {new Date(alert.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => acknowledgeAlert(alert.id)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">No active alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Calendar</CardTitle>
              <CardDescription>View upcoming deadlines and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Calendar
                    mode="single"
                    selected={calendarView}
                    onSelect={(date) => date && setCalendarView(date)}
                    className="rounded-md border"
                  />
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Upcoming Events</h4>
                  {getCalendarEvents(calendarView).map((event, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{format(event.date, "MMM dd, yyyy")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
