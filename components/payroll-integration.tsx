"use client"

import type React from "react"

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
import { Upload, AlertTriangle, CheckCircle, RefreshCw, FileSpreadsheet, Link, Settings } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface PayrollIntegration {
  id: string
  platform: string
  sync_status: string
  last_sync?: string
  error_log?: string
  created_at: string
}

interface PayrollError {
  id: string
  error_type: string
  description: string
  resolved: boolean
  created_at: string
}

interface CSVUpload {
  id: string
  filename: string
  rows_processed: number
  rows_successful: number
  rows_failed: number
  status: string
  created_at: string
}

export function PayrollIntegration() {
  const [integrations, setIntegrations] = useState<PayrollIntegration[]>([])
  const [errors, setErrors] = useState<PayrollError[]>([])
  const [uploads, setUploads] = useState<CSVUpload[]>([])
  const [showSetupForm, setShowSetupForm] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [newIntegration, setNewIntegration] = useState({
    platform: "",
    api_key: "",
    api_secret: "",
    company_id: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [integrationsData, errorsData, uploadsData] = await Promise.all([
        supabase.from("payroll_integrations").select("*").order("created_at", { ascending: false }),
        supabase.from("payroll_errors").select("*").eq("resolved", false).order("created_at", { ascending: false }),
        supabase.from("csv_uploads").select("*").order("created_at", { ascending: false }).limit(10),
      ])

      setIntegrations(integrationsData.data || [])
      setErrors(errorsData.data || [])
      setUploads(uploadsData.data || [])
    } catch (error) {
      console.error("Error fetching payroll data:", error)
    } finally {
      setLoading(false)
    }
  }

  const setupIntegration = async () => {
    try {
      const { error } = await supabase.from("payroll_integrations").insert({
        platform: newIntegration.platform,
        api_credentials: {
          api_key: newIntegration.api_key,
          api_secret: newIntegration.api_secret,
          company_id: newIntegration.company_id,
        },
        sync_status: "pending",
        contractor_id: "00000000-0000-0000-0000-000000000000", // This would be dynamic
      })

      if (error) throw error

      setShowSetupForm(false)
      setNewIntegration({ platform: "", api_key: "", api_secret: "", company_id: "" })
      fetchData()
    } catch (error) {
      console.error("Error setting up integration:", error)
    }
  }

  const syncPayroll = async (integrationId: string) => {
    try {
      // This would trigger the actual payroll sync
      const { error } = await supabase
        .from("payroll_integrations")
        .update({
          sync_status: "syncing",
          last_sync: new Date().toISOString(),
        })
        .eq("id", integrationId)

      if (error) throw error

      // Simulate sync process
      setTimeout(() => {
        supabase
          .from("payroll_integrations")
          .update({ sync_status: "completed" })
          .eq("id", integrationId)
          .then(() => fetchData())
      }, 3000)

      fetchData()
    } catch (error) {
      console.error("Error syncing payroll:", error)
    }
  }

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploadProgress(0)

      // Create upload record
      const { data: uploadRecord, error } = await supabase
        .from("csv_uploads")
        .insert({
          filename: file.name,
          file_size: file.size,
          status: "processing",
          contractor_id: "00000000-0000-0000-0000-000000000000",
          uploaded_by: "00000000-0000-0000-0000-000000000000",
        })
        .select()
        .single()

      if (error) throw error

      // Simulate file processing
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            // Update upload record as completed
            supabase
              .from("csv_uploads")
              .update({
                status: "completed",
                rows_processed: 150,
                rows_successful: 145,
                rows_failed: 5,
                completed_at: new Date().toISOString(),
              })
              .eq("id", uploadRecord.id)
              .then(() => fetchData())
            return 100
          }
          return prev + 10
        })
      }, 200)

      fetchData()
    } catch (error) {
      console.error("Error uploading CSV:", error)
    }
  }

  const resolveError = async (errorId: string) => {
    try {
      const { error } = await supabase
        .from("payroll_errors")
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: "00000000-0000-0000-0000-000000000000",
        })
        .eq("id", errorId)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error("Error resolving error:", error)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "adp":
        return "🏢"
      case "paychex":
        return "💼"
      case "quickbooks":
        return "📊"
      default:
        return "⚙️"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "syncing":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading payroll integrations...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payroll Integration</h2>
          <p className="text-muted-foreground">Connect with payroll systems and manage labor hour imports</p>
        </div>
        <Button onClick={() => setShowSetupForm(true)}>
          <Link className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Error Alerts */}
      {errors.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {errors.length} unresolved payroll sync errors that need attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrations">Active Integrations</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="csv">CSV Upload</TabsTrigger>
          <TabsTrigger value="errors">Error Management</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          {/* Active Integrations */}
          <div className="grid gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getPlatformIcon(integration.platform)}</div>
                      <div>
                        <h3 className="font-semibold capitalize">{integration.platform} Integration</h3>
                        <p className="text-sm text-muted-foreground">
                          Last sync:{" "}
                          {integration.last_sync ? new Date(integration.last_sync).toLocaleString() : "Never"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(integration.sync_status)}>
                        {integration.sync_status === "syncing" && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                        {integration.sync_status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncPayroll(integration.id)}
                        disabled={integration.sync_status === "syncing"}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Sync Now
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {integration.error_log && (
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{integration.error_log}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Setup New Integration Form */}
          {showSetupForm && (
            <Card>
              <CardHeader>
                <CardTitle>Setup Payroll Integration</CardTitle>
                <CardDescription>Connect your payroll system for automatic labor hour sync</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Payroll Platform</Label>
                  <Select
                    value={newIntegration.platform}
                    onValueChange={(value) => setNewIntegration({ ...newIntegration, platform: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adp">ADP</SelectItem>
                      <SelectItem value="paychex">Paychex</SelectItem>
                      <SelectItem value="quickbooks">QuickBooks</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      value={newIntegration.api_key}
                      onChange={(e) => setNewIntegration({ ...newIntegration, api_key: e.target.value })}
                      placeholder="Enter API key"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API Secret</Label>
                    <Input
                      type="password"
                      value={newIntegration.api_secret}
                      onChange={(e) => setNewIntegration({ ...newIntegration, api_secret: e.target.value })}
                      placeholder="Enter API secret"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Company ID</Label>
                  <Input
                    value={newIntegration.company_id}
                    onChange={(e) => setNewIntegration({ ...newIntegration, company_id: e.target.value })}
                    placeholder="Enter company identifier"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={setupIntegration}>Setup Integration</Button>
                  <Button variant="outline" onClick={() => setShowSetupForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Good Faith Assessment Tool</CardTitle>
              <CardDescription>Manual entry for contractors without payroll system integration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Manual entry form will be available here</p>
                <Button>Start Manual Entry</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="csv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CSV Upload</CardTitle>
              <CardDescription>Upload payroll data via CSV spreadsheet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Drop your CSV file here or click to browse</p>
                <Input type="file" accept=".csv" onChange={handleCSVUpload} className="max-w-xs mx-auto" />
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Recent Uploads */}
              <div className="space-y-2">
                <h4 className="font-medium">Recent Uploads</h4>
                {uploads.map((upload) => (
                  <div key={upload.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{upload.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {upload.rows_successful}/{upload.rows_processed} rows processed successfully
                      </p>
                    </div>
                    <Badge variant={upload.status === "completed" ? "default" : "secondary"}>{upload.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Management</CardTitle>
              <CardDescription>Review and resolve payroll sync errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {errors.map((error) => (
                  <div key={error.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <p className="font-medium">{error.error_type.replace("_", " ").toUpperCase()}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{error.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(error.created_at).toLocaleString()}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => resolveError(error.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolve
                    </Button>
                  </div>
                ))}
                {errors.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">No unresolved errors</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
