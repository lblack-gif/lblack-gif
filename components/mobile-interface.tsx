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
import {
  Smartphone,
  Wifi,
  WifiOff,
  Bell,
  Camera,
  FolderSyncIcon as Sync,
  AlertTriangle,
  CheckCircle,
  Plus,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface MobileSession {
  id: string
  user_id: string
  device_id: string
  device_type: string
  app_version: string
  last_sync?: string
  push_token?: string
  created_at: string
}

interface OfflineEntry {
  id: string
  user_id: string
  entry_type: string
  entry_data: any
  sync_status: string
  created_offline_at: string
  synced_at?: string
}

export function MobileInterface() {
  const [sessions, setSessions] = useState<MobileSession[]>([])
  const [offlineEntries, setOfflineEntries] = useState<OfflineEntry[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true)
  const [syncProgress, setSyncProgress] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [loading, setLoading] = useState(true)

  const [quickEntry, setQuickEntry] = useState({
    worker_id: "",
    hours: "",
    date: new Date().toISOString().split("T")[0],
    project_id: "",
  })

  useEffect(() => {
    fetchData()
    // Simulate network status changes
    const interval = setInterval(() => {
      setIsOnline(Math.random() > 0.1) // 90% online
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [sessionsData, entriesData] = await Promise.all([
        supabase.from("mobile_sessions").select("*").order("last_sync", { ascending: false }),
        supabase.from("offline_entries").select("*").order("created_offline_at", { ascending: false }),
      ])

      setSessions(sessionsData.data || [])
      setOfflineEntries(entriesData.data || [])
    } catch (error) {
      console.error("Error fetching mobile data:", error)
    } finally {
      setLoading(false)
    }
  }

  const syncOfflineData = async () => {
    setIsSyncing(true)
    setSyncProgress(0)

    try {
      const pendingEntries = offlineEntries.filter((entry) => entry.sync_status === "pending")

      for (let i = 0; i < pendingEntries.length; i++) {
        const entry = pendingEntries[i]

        // Simulate processing each entry
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Update sync status
        await supabase
          .from("offline_entries")
          .update({
            sync_status: "synced",
            synced_at: new Date().toISOString(),
          })
          .eq("id", entry.id)

        setSyncProgress(((i + 1) / pendingEntries.length) * 100)
      }

      fetchData()
    } catch (error) {
      console.error("Error syncing offline data:", error)
    } finally {
      setIsSyncing(false)
      setSyncProgress(0)
    }
  }

  const submitQuickEntry = async () => {
    const entryData = {
      worker_id: quickEntry.worker_id,
      hours_worked: Number.parseFloat(quickEntry.hours),
      work_date: quickEntry.date,
      project_id: quickEntry.project_id,
      created_via: "mobile_quick_entry",
    }

    try {
      if (isOnline) {
        // Direct submission when online
        await supabase.from("labor_hours").insert({
          ...entryData,
          contractor_id: "00000000-0000-0000-0000-000000000000",
        })
      } else {
        // Store offline when no connection
        await supabase.from("offline_entries").insert({
          user_id: "00000000-0000-0000-0000-000000000000",
          entry_type: "labor_hours",
          entry_data: entryData,
          sync_status: "pending",
          created_offline_at: new Date().toISOString(),
        })
      }

      setQuickEntry({
        worker_id: "",
        hours: "",
        date: new Date().toISOString().split("T")[0],
        project_id: "",
      })

      fetchData()
    } catch (error) {
      console.error("Error submitting quick entry:", error)
    }
  }

  const sendPushNotification = async (sessionId: string, message: string) => {
    try {
      // This would integrate with a push notification service
      console.log(`Sending push notification to session ${sessionId}: ${message}`)

      // Mock notification sent
      alert(`Push notification sent: ${message}`)
    } catch (error) {
      console.error("Error sending push notification:", error)
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "ios":
        return "📱"
      case "android":
        return "🤖"
      default:
        return "📱"
    }
  }

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case "synced":
        return "default"
      case "pending":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading mobile interface...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mobile Interface</h2>
          <p className="text-muted-foreground">Manage mobile app access and offline capabilities</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
      </div>

      {/* Connection Status Alert */}
      {!isOnline && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You are currently offline. Data will be stored locally and synced when connection is restored.
          </AlertDescription>
        </Alert>
      )}

      {/* Pending Sync Alert */}
      {offlineEntries.filter((e) => e.sync_status === "pending").length > 0 && (
        <Alert>
          <Sync className="h-4 w-4" />
          <AlertDescription>
            You have {offlineEntries.filter((e) => e.sync_status === "pending").length} entries waiting to sync.
            <Button variant="link" className="p-0 ml-2" onClick={syncOfflineData}>
              Sync Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="quick-entry" className="space-y-4">
        <TabsList>
          <TabsTrigger value="quick-entry">Quick Entry</TabsTrigger>
          <TabsTrigger value="offline-data">Offline Data</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="notifications">Push Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-entry" className="space-y-4">
          {/* Mobile-Optimized Quick Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Mobile Quick Entry
              </CardTitle>
              <CardDescription>Streamlined interface for on-site data entry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Worker</Label>
                  <Select
                    value={quickEntry.worker_id}
                    onValueChange={(value) => setQuickEntry({ ...quickEntry, worker_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select worker" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="worker1">John Smith</SelectItem>
                      <SelectItem value="worker2">Jane Doe</SelectItem>
                      <SelectItem value="worker3">Mike Johnson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select
                    value={quickEntry.project_id}
                    onValueChange={(value) => setQuickEntry({ ...quickEntry, project_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project1">Downtown Housing</SelectItem>
                      <SelectItem value="project2">Community Center</SelectItem>
                      <SelectItem value="project3">School Renovation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Hours Worked</Label>
                  <Input
                    type="number"
                    step="0.25"
                    value={quickEntry.hours}
                    onChange={(e) => setQuickEntry({ ...quickEntry, hours: e.target.value })}
                    placeholder="8.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={quickEntry.date}
                    onChange={(e) => setQuickEntry({ ...quickEntry, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={submitQuickEntry} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  {isOnline ? "Submit Entry" : "Save Offline"}
                </Button>
                <Button variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Photo
                </Button>
              </div>

              {!isOnline && (
                <p className="text-sm text-muted-foreground">
                  Entry will be saved locally and synced when connection is restored.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
              <CardDescription>Latest mobile submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Worker {i} - 8.0 hours</p>
                      <p className="text-sm text-muted-foreground">Project Alpha • Today</p>
                    </div>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Synced
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offline-data" className="space-y-4">
          {/* Sync Status */}
          <Card>
            <CardHeader>
              <CardTitle>Offline Data Management</CardTitle>
              <CardDescription>Manage data stored locally when offline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sync Status</p>
                  <p className="text-sm text-muted-foreground">
                    {offlineEntries.filter((e) => e.sync_status === "pending").length} entries pending sync
                  </p>
                </div>
                <Button onClick={syncOfflineData} disabled={isSyncing || !isOnline}>
                  <Sync className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Syncing..." : "Sync Now"}
                </Button>
              </div>

              {isSyncing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Syncing offline data...</span>
                    <span>{Math.round(syncProgress)}%</span>
                  </div>
                  <Progress value={syncProgress} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Offline Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Offline Entries</CardTitle>
              <CardDescription>Data stored locally awaiting sync</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {offlineEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium capitalize">{entry.entry_type.replace("_", " ")}</p>
                        <Badge variant={getSyncStatusColor(entry.sync_status)}>{entry.sync_status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(entry.created_offline_at).toLocaleString()}
                      </p>
                      {entry.synced_at && (
                        <p className="text-xs text-muted-foreground">
                          Synced: {new Date(entry.synced_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.sync_status === "error" && (
                        <Button variant="outline" size="sm">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {offlineEntries.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">All data is synced</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Mobile Sessions</CardTitle>
              <CardDescription>Currently connected mobile devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getDeviceIcon(session.device_type)}</span>
                        <h3 className="font-semibold">{session.device_type.toUpperCase()} Device</h3>
                        <Badge variant="outline">v{session.app_version}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Device ID: {session.device_id.slice(0, 12)}...</p>
                      <p className="text-xs text-muted-foreground">
                        Last sync: {session.last_sync ? new Date(session.last_sync).toLocaleString() : "Never"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendPushNotification(session.id, "Test notification")}
                      >
                        <Bell className="h-4 w-4 mr-1" />
                        Test Push
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Push Notification Settings</CardTitle>
              <CardDescription>Configure mobile notifications for compliance alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Send alerts for compliance deadlines and worker eligibility
                  </p>
                </div>
                <Switch checked={pushNotificationsEnabled} onCheckedChange={setPushNotificationsEnabled} />
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Notification Types</h4>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Deadline Reminders</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Worker Eligibility Alerts</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compliance Warnings</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sync Completion</span>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => sendPushNotification("all", "Test notification to all devices")}
                  className="w-full"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Send Test Notification
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Recently sent push notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { message: "Monthly report due in 3 days", time: "2 hours ago", type: "deadline" },
                  { message: "Worker eligibility needs verification", time: "1 day ago", type: "alert" },
                  { message: "Compliance rate below threshold", time: "2 days ago", type: "warning" },
                ].map((notification, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Bell className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{notification.message}</p>
                      <p className="text-sm text-muted-foreground">{notification.time}</p>
                    </div>
                    <Badge variant="outline">{notification.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
