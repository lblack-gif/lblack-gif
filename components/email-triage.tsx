"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Mail,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Calendar,
  Tag,
  Archive,
  Reply,
  Forward,
  Star,
  StarOff,
} from "lucide-react"

interface Email {
  id: string
  subject: string
  sender: string
  content: string
  received_at: string
  priority: "high" | "medium" | "low"
  status: "unread" | "read" | "classified" | "assigned"
  classification?: "section3_inquiry" | "compliance_issue" | "general" | "urgent"
  assigned_to?: string
  starred: boolean
}

export function EmailTriage() {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration
  const mockEmails: Email[] = [
    {
      id: "1",
      subject: "Section 3 Worker Certification Question",
      sender: "contractor@abcconstruction.com",
      content:
        "Hi, I need clarification on the Section 3 worker certification process for our upcoming project. Can you provide guidance on the required documentation?",
      received_at: "2024-01-15T10:30:00Z",
      priority: "high",
      status: "unread",
      classification: "section3_inquiry",
      starred: false,
    },
    {
      id: "2",
      subject: "Compliance Report Submission Deadline",
      sender: "admin@hudoffice.gov",
      content:
        "This is a reminder that the quarterly Section 3 compliance report is due by the end of this month. Please ensure all documentation is complete.",
      received_at: "2024-01-15T09:15:00Z",
      priority: "medium",
      status: "read",
      classification: "compliance_issue",
      assigned_to: "compliance_team",
      starred: true,
    },
    {
      id: "3",
      subject: "New Project Labor Hour Tracking",
      sender: "pm@citydev.com",
      content:
        "We're starting a new affordable housing project and need to set up Section 3 labor hour tracking. What's the best way to proceed?",
      received_at: "2024-01-14T16:45:00Z",
      priority: "medium",
      status: "classified",
      classification: "section3_inquiry",
      starred: false,
    },
    {
      id: "4",
      subject: "Urgent: Section 3 Compliance Issue",
      sender: "legal@metrocontractors.com",
      content:
        "We've identified a potential compliance issue with our current project. We may not meet the 25% Section 3 threshold. Need immediate assistance.",
      received_at: "2024-01-14T14:20:00Z",
      priority: "high",
      status: "assigned",
      classification: "urgent",
      assigned_to: "legal_team",
      starred: true,
    },
    {
      id: "5",
      subject: "Worker Training Program Inquiry",
      sender: "hr@xyzbuilders.com",
      content:
        "We're interested in setting up a Section 3 worker training program. Can you provide information about available resources and funding?",
      received_at: "2024-01-14T11:30:00Z",
      priority: "low",
      status: "read",
      classification: "general",
      starred: false,
    },
  ]

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setEmails(mockEmails)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.content.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || email.status === filterStatus
    const matchesPriority = filterPriority === "all" || email.priority === filterPriority

    return matchesSearch && matchesStatus && matchesPriority
  })

  const classifyEmail = (emailId: string, classification: string) => {
    setEmails(
      emails.map((email) =>
        email.id === emailId
          ? { ...email, classification: classification as Email["classification"], status: "classified" }
          : email,
      ),
    )
  }

  const assignEmail = (emailId: string, assignee: string) => {
    setEmails(
      emails.map((email) => (email.id === emailId ? { ...email, assigned_to: assignee, status: "assigned" } : email)),
    )
  }

  const toggleStar = (emailId: string) => {
    setEmails(emails.map((email) => (email.id === emailId ? { ...email, starred: !email.starred } : email)))
  }

  const markAsRead = (emailId: string) => {
    setEmails(
      emails.map((email) => (email.id === emailId && email.status === "unread" ? { ...email, status: "read" } : email)),
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50"
      case "medium":
        return "text-yellow-600 bg-yellow-50"
      case "low":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unread":
        return "text-blue-600 bg-blue-50"
      case "read":
        return "text-gray-600 bg-gray-50"
      case "classified":
        return "text-purple-600 bg-purple-50"
      case "assigned":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getClassificationColor = (classification?: string) => {
    switch (classification) {
      case "section3_inquiry":
        return "text-blue-600 bg-blue-50"
      case "compliance_issue":
        return "text-orange-600 bg-orange-50"
      case "urgent":
        return "text-red-600 bg-red-50"
      case "general":
        return "text-gray-600 bg-gray-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading emails...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Triage</h2>
          <p className="text-gray-600 mt-1">AI-powered email classification and routing</p>
        </div>
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">
            {emails.filter((e) => e.status === "unread").length} unread
          </span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="classified">Classified</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inbox ({filteredEmails.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {filteredEmails.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No emails found matching your criteria</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedEmail?.id === email.id ? "bg-blue-50 border-blue-200" : ""
                      } ${email.status === "unread" ? "font-semibold" : ""}`}
                      onClick={() => {
                        setSelectedEmail(email)
                        markAsRead(email.id)
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleStar(email.id)
                              }}
                              className="text-gray-400 hover:text-yellow-500"
                            >
                              {email.starred ? (
                                <Star className="h-4 w-4 fill-current text-yellow-500" />
                              ) : (
                                <StarOff className="h-4 w-4" />
                              )}
                            </button>
                            <p className="text-sm font-medium text-gray-900 truncate">{email.subject}</p>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{email.sender}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">{email.content}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 ml-4">
                          <Badge className={`text-xs ${getPriorityColor(email.priority)}`}>{email.priority}</Badge>
                          <Badge className={`text-xs ${getStatusColor(email.status)}`}>{email.status}</Badge>
                          <span className="text-xs text-gray-400">
                            {new Date(email.received_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Email Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Email Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEmail ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{selectedEmail.subject}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {selectedEmail.sender}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedEmail.received_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <Badge className={`${getPriorityColor(selectedEmail.priority)}`}>
                      {selectedEmail.priority} priority
                    </Badge>
                    <Badge className={`${getStatusColor(selectedEmail.status)}`}>{selectedEmail.status}</Badge>
                    {selectedEmail.classification && (
                      <Badge className={`${getClassificationColor(selectedEmail.classification)}`}>
                        {selectedEmail.classification.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-gray-700 leading-relaxed">{selectedEmail.content}</p>
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Classify Email</h4>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => classifyEmail(selectedEmail.id, "section3_inquiry")}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        Section 3 Inquiry
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => classifyEmail(selectedEmail.id, "compliance_issue")}
                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Compliance Issue
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => classifyEmail(selectedEmail.id, "urgent")}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Urgent
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => classifyEmail(selectedEmail.id, "general")}
                        className="text-gray-600 border-gray-200 hover:bg-gray-50"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        General
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Assign To</h4>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => assignEmail(selectedEmail.id, "compliance_team")}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <User className="h-3 w-3 mr-1" />
                        Compliance Team
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => assignEmail(selectedEmail.id, "legal_team")}
                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                      >
                        <User className="h-3 w-3 mr-1" />
                        Legal Team
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => assignEmail(selectedEmail.id, "project_manager")}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <User className="h-3 w-3 mr-1" />
                        Project Manager
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                    <Button size="sm" variant="outline">
                      <Forward className="h-3 w-3 mr-1" />
                      Forward
                    </Button>
                    <Button size="sm" variant="outline">
                      <Archive className="h-3 w-3 mr-1" />
                      Archive
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select an email to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Emails</p>
                <p className="text-2xl font-bold text-blue-600">{emails.length}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-orange-600">
                  {emails.filter((e) => e.status === "unread").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Classified</p>
                <p className="text-2xl font-bold text-purple-600">
                  {emails.filter((e) => e.status === "classified").length}
                </p>
              </div>
              <Tag className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assigned</p>
                <p className="text-2xl font-bold text-green-600">
                  {emails.filter((e) => e.status === "assigned").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
