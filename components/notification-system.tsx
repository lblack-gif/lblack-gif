"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, AlertTriangle, CheckCircle, Clock, Users, FileText, Settings, Eye, Archive } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  severity: "low" | "medium" | "high" | "critical"
  read: boolean
  archived: boolean
  action_required: boolean
  related_id?: string
  created_at: string
}

interface NotificationStats {
  total: number
  unread: number
  critical: number
  actionRequired: number
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    critical: 0,
    actionRequired: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchNotifications()
    // Set up real-time subscription
    const subscription = supabase
      .channel("notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => fetchNotifications())
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      // Fetch notifications (mock data for demo)
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "worker_verification",
          title: "Worker Verification Required",
          message: "Maria Rodriguez requires document verification for Section 3 compliance.",
          severity: "high",
          read: false,
          archived: false,
          action_required: true,
          related_id: "worker_1",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          type: "compliance_alert",
          title: "Compliance Rate Below Threshold",
          message: "Downtown Housing project compliance rate has dropped to 22%. Immediate action required.",
          severity: "critical",
          read: false,
          archived: false,
          action_required: true,
          related_id: "project_1",
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          type: "training_reminder",
          title: "Training Deadline Approaching",
          message: "5 workers have mandatory safety training due within 7 days.",
          severity: "medium",
          read: false,
          archived: false,
          action_required: true,
          related_id: "training_1",
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "4",
          type: "payroll_sync",
          title: "Payroll Sync Completed",
          message: "Successfully synchronized 45 worker records with ADP payroll system.",
          severity: "low",
          read: true,
          archived: false,
          action_required: false,
          related_id: "payroll_1",
          created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "5",
          type: "contract_analysis",
          title: "Contract Analysis Complete",
          message: "AI analysis identified 3 potential compliance risks in the new Community Center contract.",
          severity: "medium",
          read: false,
          archived: false,
          action_required: true,
          related_id: "contract_1",
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "6",
          type: "hud_sync",
          title: "HUD Reporting Submitted",
          message: "Monthly Section 3 compliance report successfully submitted to HUD SPEARS system.",
          severity: "low",
          read: true,
          archived: false,
          action_required: false,
          related_id: "hud_1",
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "7",
          type: "worker_registration",
          title: "New Worker Registration",
          message: "Kevin Lee has completed registration and is pending verification.",
          severity: "medium",
          read: false,
          archived: false,
          action_required: true,
          related_id: "worker_2",
          created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "8",
          type: "audit_reminder",
          title: "Quarterly Audit Due",
          message: "Q1 2024 compliance audit is scheduled for next week. Prepare documentation.",
          severity: "high",
          read: false,
          archived: false,
          action_required: true,
          related_id: "audit_1",
          created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        },
      ]

      setNotifications(mockNotifications)

      // Calculate stats
      const stats: NotificationStats = {
        total: mockNotifications.length,
        unread: mockNotifications.filter((n) => !n.read).length,
        critical: mockNotifications.filter((n) => n.severity === "critical").length,
        actionRequired: mockNotifications.filter((n) => n.action_required && !n.archived).length,
      }
      setStats(stats)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    setStats((prev) => ({ ...prev, unread: prev.unread - 1 }))
  }

  const markAsArchived = async (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, archived: true } : n)))
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return AlertTriangle
      case "high":
        return AlertTriangle
      case "medium":
        return Clock
      case "low":
        return CheckCircle
      default:
        return Bell
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "worker_verification":
        return Users
      case "worker_registration":
        return Users
      case "compliance_alert":
        return AlertTriangle
      case "training_reminder":
        return FileText
      case "contract_analysis":
        return FileText
      case "payroll_sync":
        return Settings
      case "hud_sync":
        return Settings
      case "audit_reminder":
        return FileText
      default:
        return Bell
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return !notification.archived
    if (activeTab === "unread") return !notification.read && !notification.archived
    if (activeTab === "critical") return notification.severity === "critical" && !notification.archived
    if (activeTab === "action") return notification.action_required && !notification.archived
    return true
  })

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading notifications...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notification Center</h2>
          <p className="text-muted-foreground">Stay updated on compliance activities and system alerts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Archive className="h-4 w-4 mr-2" />
            Archive All Read
          </Button>
          <Button variant="outline" size="sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Required</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.actionRequired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {stats.critical > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {stats.critical} critical notification{stats.critical > 1 ? "s" : ""} requiring immediate
            attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>System alerts, compliance updates, and action items</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({stats.unread})</TabsTrigger>
              <TabsTrigger value="critical">Critical ({stats.critical})</TabsTrigger>
              <TabsTrigger value="action">Action Required ({stats.actionRequired})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => {
                    const SeverityIcon = getSeverityIcon(notification.severity)
                    const TypeIcon = getTypeIcon(notification.type)

                    return (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-4 p-4 border rounded-lg transition-colors ${
                          !notification.read ? "bg-blue-50 border-blue-200" : "bg-white"
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              notification.severity === "critical"
                                ? "bg-red-100"
                                : notification.severity === "high"
                                  ? "bg-orange-100"
                                  : notification.severity === "medium"
                                    ? "bg-yellow-100"
                                    : "bg-green-100"
                            }`}
                          >
                            <TypeIcon
                              className={`h-5 w-5 ${
                                notification.severity === "critical"
                                  ? "text-red-600"
                                  : notification.severity === "high"
                                    ? "text-orange-600"
                                    : notification.severity === "medium"
                                      ? "text-yellow-600"
                                      : "text-green-600"
                              }`}
                            />
                          </div>
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{notification.title}</h4>
                                {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                              </div>
                              <p className="text-sm text-muted-foreground">{notification.message}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getSeverityColor(notification.severity) as any}>
                                <SeverityIcon className="h-3 w-3 mr-1" />
                                {notification.severity}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(notification.created_at)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {notification.action_required && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Action Required
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs capitalize">
                              {notification.type.replace("_", " ")}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            {!notification.read && (
                              <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                                <Eye className="h-4 w-4 mr-1" />
                                Mark Read
                              </Button>
                            )}
                            {notification.action_required && <Button size="sm">Take Action</Button>}
                            <Button variant="ghost" size="sm" onClick={() => markAsArchived(notification.id)}>
                              <Archive className="h-4 w-4 mr-1" />
                              Archive
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {filteredNotifications.length === 0 && (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No notifications found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
