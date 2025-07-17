"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { History, Download, Camera, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Eye } from "lucide-react"
import { format, subDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import { supabase } from "@/lib/supabase"

interface AuditLog {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  details: any
  ip_address?: string
  created_at: string
}

interface AuditSnapshot {
  id: string
  snapshot_name: string
  snapshot_date: string
  data_summary: any
  created_by: string
  created_at: string
}

interface PerformanceScorecard {
  id: string
  contractor_id: string
  project_id: string
  scorecard_date: string
  total_hours: number
  section3_hours: number
  compliance_percentage: number
  threshold_met: boolean
  threshold_type: string
  flags: string[]
}

export function AuditAccountability() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [snapshots, setSnapshots] = useState<AuditSnapshot[]>([])
  const [scorecards, setScoreCards] = useState<PerformanceScorecard[]>([])
  const [selectedSnapshot1, setSelectedSnapshot1] = useState<string>("")
  const [selectedSnapshot2, setSelectedSnapshot2] = useState<string>("")
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [filterDateRange, setFilterDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [filterAction, setFilterAction] = useState<string>("all")
  const [filterUser, setFilterUser] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [newSnapshotName, setNewSnapshotName] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [logsData, snapshotsData, scorecardsData] = await Promise.all([
        supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("audit_snapshots").select("*").order("created_at", { ascending: false }),
        supabase.from("performance_scorecards").select("*").order("scorecard_date", { ascending: false }),
      ])

      setAuditLogs(logsData.data || [])
      setSnapshots(snapshotsData.data || [])
      setScoreCards(scorecardsData.data || [])
    } catch (error) {
      console.error("Error fetching audit data:", error)
    } finally {
      setLoading(false)
    }
  }

  const createSnapshot = async () => {
    try {
      // Generate current data summary
      const dataSummary = {
        total_contractors: 25,
        total_projects: 12,
        total_labor_hours: 45230,
        section3_hours: 15678,
        compliance_rate: 34.7,
        timestamp: new Date().toISOString(),
      }

      const { error } = await supabase.from("audit_snapshots").insert({
        snapshot_name: newSnapshotName,
        snapshot_date: new Date().toISOString(),
        data_summary: dataSummary,
        created_by: "00000000-0000-0000-0000-000000000000", // This would be current user
      })

      if (error) throw error

      setNewSnapshotName("")
      fetchData()
    } catch (error) {
      console.error("Error creating snapshot:", error)
    }
  }

  const compareSnapshots = () => {
    if (!selectedSnapshot1 || !selectedSnapshot2) return

    const snapshot1 = snapshots.find((s) => s.id === selectedSnapshot1)
    const snapshot2 = snapshots.find((s) => s.id === selectedSnapshot2)

    if (!snapshot1 || !snapshot2) return

    const comparison = {
      snapshot1: {
        name: snapshot1.snapshot_name,
        date: snapshot1.snapshot_date,
        data: snapshot1.data_summary,
      },
      snapshot2: {
        name: snapshot2.snapshot_name,
        date: snapshot2.snapshot_date,
        data: snapshot2.data_summary,
      },
      differences: {
        contractors: snapshot2.data_summary.total_contractors - snapshot1.data_summary.total_contractors,
        projects: snapshot2.data_summary.total_projects - snapshot1.data_summary.total_projects,
        labor_hours: snapshot2.data_summary.total_labor_hours - snapshot1.data_summary.total_labor_hours,
        section3_hours: snapshot2.data_summary.section3_hours - snapshot1.data_summary.section3_hours,
        compliance_rate: snapshot2.data_summary.compliance_rate - snapshot1.data_summary.compliance_rate,
      },
    }

    setComparisonData(comparison)
  }

  const exportAuditTrail = () => {
    // This would generate and download a CSV/PDF of the audit trail
    console.log("Exporting audit trail with filters:", { filterDateRange, filterAction, filterUser })
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return "➕"
      case "update":
        return "✏️"
      case "delete":
        return "🗑️"
      case "login":
        return "🔐"
      case "export":
        return "📤"
      default:
        return "📝"
    }
  }

  const getComplianceStatusColor = (percentage: number) => {
    if (percentage >= 25) return "default"
    if (percentage >= 20) return "secondary"
    return "destructive"
  }

  const getComplianceIcon = (percentage: number) => {
    if (percentage >= 25) return CheckCircle
    return AlertTriangle
  }

  const filteredLogs = auditLogs.filter((log) => {
    const matchesDateRange =
      !filterDateRange?.from ||
      (new Date(log.created_at) >= filterDateRange.from &&
        (!filterDateRange.to || new Date(log.created_at) <= filterDateRange.to))
    const matchesAction = filterAction === "all" || log.action === filterAction
    const matchesUser = filterUser === "all" || log.user_id === filterUser
    return matchesDateRange && matchesAction && matchesUser
  })

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading audit data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audit & Accountability</h2>
          <p className="text-muted-foreground">Track changes, compare performance, and maintain compliance records</p>
        </div>
        <Button onClick={exportAuditTrail}>
          <Download className="h-4 w-4 mr-2" />
          Export Audit Trail
        </Button>
      </div>

      <Tabs defaultValue="audit-trail" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit-trail">Audit Trail</TabsTrigger>
          <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
          <TabsTrigger value="scorecards">Performance Scorecards</TabsTrigger>
          <TabsTrigger value="comparison">Comparison Tool</TabsTrigger>
        </TabsList>

        <TabsContent value="audit-trail" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <DatePickerWithRange date={filterDateRange} onDateChange={setFilterDateRange} />
                </div>
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="export">Export</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>User</Label>
                  <Select value={filterUser} onValueChange={setFilterUser}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="user1">John Doe</SelectItem>
                      <SelectItem value="user2">Jane Smith</SelectItem>
                      <SelectItem value="user3">Admin User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={fetchData} className="w-full">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Chronological history of all system changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="text-lg">{getActionIcon(log.action)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{log.action}</Badge>
                        <span className="text-sm font-medium">{log.resource_type}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), "MMM dd, yyyy HH:mm")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        User {log.user_id.slice(0, 8)} {log.action}d {log.resource_type} {log.resource_id.slice(0, 8)}
                      </p>
                      {log.details && (
                        <p className="text-xs text-muted-foreground">
                          Details: {JSON.stringify(log.details).slice(0, 100)}...
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="snapshots" className="space-y-4">
          {/* Create Snapshot */}
          <Card>
            <CardHeader>
              <CardTitle>Create Snapshot</CardTitle>
              <CardDescription>Capture current system state for future comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    value={newSnapshotName}
                    onChange={(e) => setNewSnapshotName(e.target.value)}
                    placeholder="Enter snapshot name (e.g., 'End of Q1 2024')"
                  />
                </div>
                <Button onClick={createSnapshot} disabled={!newSnapshotName}>
                  <Camera className="h-4 w-4 mr-2" />
                  Create Snapshot
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Snapshots */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Snapshots</CardTitle>
              <CardDescription>Historical system state captures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {snapshots.map((snapshot) => (
                  <div key={snapshot.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{snapshot.snapshot_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created: {format(new Date(snapshot.snapshot_date), "MMM dd, yyyy HH:mm")}
                      </p>
                      <div className="grid grid-cols-4 gap-4 text-xs text-muted-foreground">
                        <div>
                          <span>Contractors: {snapshot.data_summary.total_contractors}</span>
                        </div>
                        <div>
                          <span>Projects: {snapshot.data_summary.total_projects}</span>
                        </div>
                        <div>
                          <span>Labor Hours: {snapshot.data_summary.total_labor_hours?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span>Compliance: {snapshot.data_summary.compliance_rate}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scorecards" className="space-y-4">
          {/* Performance Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliant Contractors</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {scorecards.filter((s) => s.compliance_percentage >= 25).length}
                </div>
                <p className="text-xs text-muted-foreground">of {scorecards.length} total contractors</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">At Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {scorecards.filter((s) => s.compliance_percentage >= 20 && s.compliance_percentage < 25).length}
                </div>
                <p className="text-xs text-muted-foreground">20-24% compliance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Non-Compliant</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {scorecards.filter((s) => s.compliance_percentage < 20).length}
                </div>
                <p className="text-xs text-muted-foreground">Below 20% threshold</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Flagged Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scorecards.reduce((sum, s) => sum + s.flags.length, 0)}</div>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Individual Scorecards */}
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Performance Scorecards</CardTitle>
              <CardDescription>Current compliance status for all contractors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scorecards.map((scorecard) => {
                  const ComplianceIcon = getComplianceIcon(scorecard.compliance_percentage)

                  return (
                    <div key={scorecard.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">Contractor {scorecard.contractor_id.slice(0, 8)}</h3>
                          <Badge variant={getComplianceStatusColor(scorecard.compliance_percentage)}>
                            <ComplianceIcon className="h-3 w-3 mr-1" />
                            {scorecard.compliance_percentage}%
                          </Badge>
                          <Badge variant="outline">
                            {scorecard.threshold_type === "25_percent" ? "25% Threshold" : "5% Threshold"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(scorecard.scorecard_date), "MMM dd, yyyy")}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Hours</p>
                          <p className="font-medium">{scorecard.total_hours.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Section 3 Hours</p>
                          <p className="font-medium">{scorecard.section3_hours.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Threshold Met</p>
                          <p className="font-medium">
                            {scorecard.threshold_met ? (
                              <span className="text-green-600">✓ Yes</span>
                            ) : (
                              <span className="text-red-600">✗ No</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <Progress value={scorecard.compliance_percentage} className="mb-3" />

                      {scorecard.flags.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-red-600">Compliance Issues:</p>
                          {scorecard.flags.map((flag, index) => (
                            <p key={index} className="text-xs text-red-600">
                              • {flag}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          {/* Snapshot Comparison Tool */}
          <Card>
            <CardHeader>
              <CardTitle>Snapshot Comparison</CardTitle>
              <CardDescription>Compare two points in time to track progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>First Snapshot</Label>
                  <Select value={selectedSnapshot1} onValueChange={setSelectedSnapshot1}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select first snapshot" />
                    </SelectTrigger>
                    <SelectContent>
                      {snapshots.map((snapshot) => (
                        <SelectItem key={snapshot.id} value={snapshot.id}>
                          {snapshot.snapshot_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Second Snapshot</Label>
                  <Select value={selectedSnapshot2} onValueChange={setSelectedSnapshot2}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select second snapshot" />
                    </SelectTrigger>
                    <SelectContent>
                      {snapshots.map((snapshot) => (
                        <SelectItem key={snapshot.id} value={snapshot.id}>
                          {snapshot.snapshot_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={compareSnapshots}
                    disabled={!selectedSnapshot1 || !selectedSnapshot2}
                    className="w-full"
                  >
                    Compare
                  </Button>
                </div>
              </div>

              {comparisonData && (
                <div className="mt-6 space-y-4">
                  <Alert>
                    <History className="h-4 w-4" />
                    <AlertDescription>
                      Comparing "{comparisonData.snapshot1.name}" vs "{comparisonData.snapshot2.name}"
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-2xl font-bold">
                            {comparisonData.differences.contractors > 0 ? "+" : ""}
                            {comparisonData.differences.contractors}
                          </span>
                          {comparisonData.differences.contractors > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : comparisonData.differences.contractors < 0 ? (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">Contractors</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-2xl font-bold">
                            {comparisonData.differences.projects > 0 ? "+" : ""}
                            {comparisonData.differences.projects}
                          </span>
                          {comparisonData.differences.projects > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : comparisonData.differences.projects < 0 ? (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">Projects</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-2xl font-bold">
                            {comparisonData.differences.labor_hours > 0 ? "+" : ""}
                            {comparisonData.differences.labor_hours.toLocaleString()}
                          </span>
                          {comparisonData.differences.labor_hours > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : comparisonData.differences.labor_hours < 0 ? (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">Labor Hours</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-2xl font-bold">
                            {comparisonData.differences.section3_hours > 0 ? "+" : ""}
                            {comparisonData.differences.section3_hours.toLocaleString()}
                          </span>
                          {comparisonData.differences.section3_hours > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : comparisonData.differences.section3_hours < 0 ? (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">Section 3 Hours</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-2xl font-bold">
                            {comparisonData.differences.compliance_rate > 0 ? "+" : ""}
                            {comparisonData.differences.compliance_rate.toFixed(1)}%
                          </span>
                          {comparisonData.differences.compliance_rate > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : comparisonData.differences.compliance_rate < 0 ? (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">Compliance Rate</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
