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
import { Switch } from "@/components/ui/switch"
import { RefreshCw, Database, Link, CheckCircle, AlertTriangle, Clock, Settings } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface SpearsSyncLog {
  id: string
  sync_type: string
  local_record_id: string
  spears_record_id?: string
  sync_status: string
  error_message?: string
  synced_at?: string
  created_at: string
}

interface IdisMapping {
  id: string
  local_project_id: string
  idis_grant_number: string
  idis_activity_id?: string
  mapping_status: string
  last_sync?: string
}

interface HudSyncJob {
  id: string
  job_type: string
  schedule_cron: string
  last_run?: string
  next_run?: string
  status: string
  error_count: number
}

export function HudIntegration() {
  const [spearsSyncs, setSpearsSyncs] = useState<SpearsSyncLog[]>([])
  const [idisMappings, setIdisMappings] = useState<IdisMapping[]>([])
  const [syncJobs, setSyncJobs] = useState<HudSyncJob[]>([])
  const [connectionStatus, setConnectionStatus] = useState({
    spears: "connected",
    idis: "connected",
    last_health_check: new Date().toISOString(),
  })
  const [syncProgress, setSyncProgress] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [loading, setLoading] = useState(true)

  const [newMapping, setNewMapping] = useState({
    local_project_id: "",
    idis_grant_number: "",
    idis_activity_id: "",
  })

  const [apiConfig, setApiConfig] = useState({
    spears_endpoint: "https://api.hud.gov/spears/v1",
    idis_endpoint: "https://api.hud.gov/idis/v2",
    api_key: "••••••••••••••••",
    timeout_seconds: 30,
    retry_attempts: 3,
  })

  useEffect(() => {
    fetchIntegrationData()
  }, [])

  const fetchIntegrationData = async () => {
    try {
      const [spearsData, idisData, jobsData] = await Promise.all([
        supabase.from("spears_sync_logs").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("idis_mappings").select("*").order("created_at", { ascending: false }),
        supabase.from("hud_sync_jobs").select("*").order("job_type"),
      ])

      setSpearsSyncs(spearsData.data || [])
      setIdisMappings(idisData.data || [])
      setSyncJobs(jobsData.data || [])
    } catch (error) {
      console.error("Error fetching integration data:", error)
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async (system: "spears" | "idis") => {
    try {
      console.log(`Testing ${system.toUpperCase()} connection...`)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setConnectionStatus({
        ...connectionStatus,
        [system]: Math.random() > 0.2 ? "connected" : "error",
        last_health_check: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`Error testing ${system} connection:`, error)
      setConnectionStatus({
        ...connectionStatus,
        [system]: "error",
      })
    }
  }

  const syncToSpears = async (recordType: string) => {
    try {
      setIsSyncing(true)
      setSyncProgress(0)

      // Simulate sync process
      const steps = ["Preparing data", "Authenticating", "Uploading", "Validating", "Completing"]

      for (let i = 0; i < steps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setSyncProgress(((i + 1) / steps.length) * 100)
      }

      // Create sync log entry
      await supabase.from("spears_sync_logs").insert({
        sync_type: recordType,
        local_record_id: "mock-record-id",
        spears_record_id: `SPEARS-${Date.now()}`,
        sync_status: "success",
        synced_at: new Date().toISOString(),
      })

      fetchIntegrationData()
    } catch (error) {
      console.error("Error syncing to SPEARS:", error)
    } finally {
      setIsSyncing(false)
      setSyncProgress(0)
    }
  }

  const createIdisMapping = async () => {
    try {
      const { error } = await supabase.from("idis_mappings").insert({
        local_project_id: newMapping.local_project_id,
        idis_grant_number: newMapping.idis_grant_number,
        idis_activity_id: newMapping.idis_activity_id,
        mapping_status: "active",
      })

      if (error) throw error

      setNewMapping({
        local_project_id: "",
        idis_grant_number: "",
        idis_activity_id: "",
      })
      fetchIntegrationData()
    } catch (error) {
      console.error("Error creating IDIS mapping:", error)
    }
  }

  const runSyncJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from("hud_sync_jobs")
        .update({
          last_run: new Date().toISOString(),
          next_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Next day
          error_count: 0,
        })
        .eq("id", jobId)

      if (error) throw error
      fetchIntegrationData()
    } catch (error) {
      console.error("Error running sync job:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
      case "connected":
      case "active":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
      case "error":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
      case "connected":
        return CheckCircle
      case "pending":
        return Clock
      case "failed":
      case "error":
        return AlertTriangle
      default:
        return RefreshCw
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading HUD integrations...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">HUD System Integration</h2>
          <p className="text-muted-foreground">Manage SPEARS and IDIS system connections and data synchronization</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor(connectionStatus.spears)}>SPEARS</Badge>
          <Badge variant={getStatusColor(connectionStatus.idis)}>IDIS</Badge>
        </div>
      </div>

      {/* Connection Status Alert */}
      {(connectionStatus.spears === "error" || connectionStatus.idis === "error") && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            One or more HUD system connections are experiencing issues. Check configuration and network connectivity.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="spears" className="space-y-4">
        <TabsList>
          <TabsTrigger value="spears">SPEARS Integration</TabsTrigger>
          <TabsTrigger value="idis">IDIS Integration</TabsTrigger>
          <TabsTrigger value="sync-jobs">Scheduled Jobs</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="spears" className="space-y-4">
          {/* SPEARS Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                SPEARS Connection
              </CardTitle>
              <CardDescription>Section 3 Performance Evaluation and Registry System</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Connection Status</p>
                  <p className="text-sm text-muted-foreground">
                    Last checked: {new Date(connectionStatus.last_health_check).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(connectionStatus.spears)}>
                    {connectionStatus.spears === "connected" ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    )}
                    {connectionStatus.spears}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => testConnection("spears")}>
                    Test Connection
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Button onClick={() => syncToSpears("worker_data")} disabled={isSyncing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                  Sync Worker Data
                </Button>
                <Button onClick={() => syncToSpears("compliance_report")} disabled={isSyncing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                  Sync Compliance Reports
                </Button>
                <Button onClick={() => syncToSpears("project_data")} disabled={isSyncing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                  Sync Project Data
                </Button>
              </div>

              {isSyncing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Syncing to SPEARS...</span>
                    <span>{Math.round(syncProgress)}%</span>
                  </div>
                  <Progress value={syncProgress} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent SPEARS Syncs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent SPEARS Synchronizations</CardTitle>
              <CardDescription>Latest data transfers to SPEARS system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {spearsSyncs.map((sync) => {
                  const StatusIcon = getStatusIcon(sync.sync_status)

                  return (
                    <div key={sync.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <span className="font-medium capitalize">{sync.sync_type.replace("_", " ")}</span>
                          <Badge variant={getStatusColor(sync.sync_status)}>{sync.sync_status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {sync.spears_record_id && `SPEARS ID: ${sync.spears_record_id}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sync.synced_at
                            ? `Synced: ${new Date(sync.synced_at).toLocaleString()}`
                            : `Created: ${new Date(sync.created_at).toLocaleString()}`}
                        </p>
                        {sync.error_message && <p className="text-xs text-red-600">Error: {sync.error_message}</p>}
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

        <TabsContent value="idis" className="space-y-4">
          {/* IDIS Connection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                IDIS Integration
              </CardTitle>
              <CardDescription>Integrated Disbursement and Information System</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Connection Status</p>
                  <p className="text-sm text-muted-foreground">
                    Automatic nightly sync enabled for CPD data reconciliation
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(connectionStatus.idis)}>
                    {connectionStatus.idis === "connected" ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    )}
                    {connectionStatus.idis}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => testConnection("idis")}>
                    Test Connection
                  </Button>
                </div>
              </div>

              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  IDIS mappings ensure financial draws tied to Section 3 benchmarks flow seamlessly into IDIS without
                  manual re-entry.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Project Mappings */}
          <Card>
            <CardHeader>
              <CardTitle>Project-to-Grant Mappings</CardTitle>
              <CardDescription>Map local projects to IDIS grant numbers and activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {idisMappings.map((mapping) => (
                  <div key={mapping.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Project {mapping.local_project_id.slice(0, 8)}</span>
                        <Badge variant={getStatusColor(mapping.mapping_status)}>{mapping.mapping_status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Grant: {mapping.idis_grant_number}</p>
                      {mapping.idis_activity_id && (
                        <p className="text-sm text-muted-foreground">Activity: {mapping.idis_activity_id}</p>
                      )}
                      {mapping.last_sync && (
                        <p className="text-xs text-muted-foreground">
                          Last sync: {new Date(mapping.last_sync).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      Edit Mapping
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add New Mapping */}
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium">Add New Mapping</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Local Project</Label>
                    <Select
                      value={newMapping.local_project_id}
                      onValueChange={(value) => setNewMapping({ ...newMapping, local_project_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="project1">Downtown Housing Project</SelectItem>
                        <SelectItem value="project2">Community Center Renovation</SelectItem>
                        <SelectItem value="project3">School Infrastructure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>IDIS Grant Number</Label>
                    <Input
                      value={newMapping.idis_grant_number}
                      onChange={(e) => setNewMapping({ ...newMapping, idis_grant_number: e.target.value })}
                      placeholder="B-21-MC-XX-XXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Activity ID (Optional)</Label>
                    <Input
                      value={newMapping.idis_activity_id}
                      onChange={(e) => setNewMapping({ ...newMapping, idis_activity_id: e.target.value })}
                      placeholder="Activity ID"
                    />
                  </div>
                </div>
                <Button onClick={createIdisMapping}>Create Mapping</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync-jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Synchronization Jobs</CardTitle>
              <CardDescription>Automated jobs for keeping HUD systems current</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold capitalize">{job.job_type.replace("_", " ")}</h3>
                        <Badge variant={getStatusColor(job.status)}>{job.status}</Badge>
                        {job.error_count > 0 && <Badge variant="destructive">{job.error_count} errors</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">Schedule: {job.schedule_cron}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {job.last_run && <span>Last run: {new Date(job.last_run).toLocaleString()}</span>}
                        {job.next_run && <span>Next run: {new Date(job.next_run).toLocaleString()}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => runSyncJob(job.id)}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Run Now
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Configure HUD system API endpoints and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>SPEARS API Endpoint</Label>
                  <Input
                    value={apiConfig.spears_endpoint}
                    onChange={(e) => setApiConfig({ ...apiConfig, spears_endpoint: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>IDIS API Endpoint</Label>
                  <Input
                    value={apiConfig.idis_endpoint}
                    onChange={(e) => setApiConfig({ ...apiConfig, idis_endpoint: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={apiConfig.api_key}
                    onChange={(e) => setApiConfig({ ...apiConfig, api_key: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Timeout (seconds)</Label>
                  <Input
                    type="number"
                    value={apiConfig.timeout_seconds}
                    onChange={(e) => setApiConfig({ ...apiConfig, timeout_seconds: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Advanced Settings</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Enable automatic reconciliation</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Retry failed syncs</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Send notification on errors</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Button>Save Configuration</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
