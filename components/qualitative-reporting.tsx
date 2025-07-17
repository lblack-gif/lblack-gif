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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Upload, Search, Tag, Users, Camera, FileText, Bell } from "lucide-react"
import { format } from "date-fns"
import { supabase } from "@/lib/supabase"

interface OutreachEvent {
  id: string
  event_type: string
  title: string
  description?: string
  event_date: string
  location?: string
  participant_count: number
  photos: string[]
  created_at: string
}

interface QualitativeReport {
  id: string
  reporting_period: string
  status: string
  due_date: string
  submitted_at?: string
  content: any
}

interface BestPracticeTemplate {
  id: string
  title: string
  category: string
  description?: string
  template_content: string
  tags: string[]
  is_active: boolean
}

export function QualitativeReporting() {
  const [events, setEvents] = useState<OutreachEvent[]>([])
  const [reports, setReports] = useState<QualitativeReport[]>([])
  const [templates, setTemplates] = useState<BestPracticeTemplate[]>([])
  const [showEventForm, setShowEventForm] = useState(false)
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [newEvent, setNewEvent] = useState({
    event_type: "",
    title: "",
    description: "",
    event_date: undefined as Date | undefined,
    location: "",
    participant_count: 0,
    photos: [] as string[],
  })

  const [newTemplate, setNewTemplate] = useState({
    title: "",
    category: "",
    description: "",
    template_content: "",
    tags: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [eventsData, reportsData, templatesData] = await Promise.all([
        supabase.from("outreach_events").select("*").order("event_date", { ascending: false }),
        supabase.from("qualitative_reports").select("*").order("due_date", { ascending: true }),
        supabase.from("best_practice_templates").select("*").eq("is_active", true).order("title"),
      ])

      setEvents(eventsData.data || [])
      setReports(reportsData.data || [])
      setTemplates(templatesData.data || [])
    } catch (error) {
      console.error("Error fetching qualitative data:", error)
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async () => {
    try {
      const { error } = await supabase.from("outreach_events").insert({
        event_type: newEvent.event_type,
        title: newEvent.title,
        description: newEvent.description,
        event_date: newEvent.event_date?.toISOString().split("T")[0],
        location: newEvent.location,
        participant_count: newEvent.participant_count,
        photos: newEvent.photos,
        contractor_id: "00000000-0000-0000-0000-000000000000", // This would be dynamic
        created_by: "00000000-0000-0000-0000-000000000000",
      })

      if (error) throw error

      setShowEventForm(false)
      setNewEvent({
        event_type: "",
        title: "",
        description: "",
        event_date: undefined,
        location: "",
        participant_count: 0,
        photos: [],
      })
      fetchData()
    } catch (error) {
      console.error("Error creating event:", error)
    }
  }

  const createTemplate = async () => {
    try {
      const { error } = await supabase.from("best_practice_templates").insert({
        title: newTemplate.title,
        category: newTemplate.category,
        description: newTemplate.description,
        template_content: newTemplate.template_content,
        tags: newTemplate.tags.split(",").map((tag) => tag.trim()),
        created_by: "00000000-0000-0000-0000-000000000000",
      })

      if (error) throw error

      setShowTemplateForm(false)
      setNewTemplate({
        title: "",
        category: "",
        description: "",
        template_content: "",
        tags: "",
      })
      fetchData()
    } catch (error) {
      console.error("Error creating template:", error)
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // In a real app, you'd upload to storage and get URLs
      const mockUrls = Array.from(files).map((file) => URL.createObjectURL(file))
      setNewEvent({ ...newEvent, photos: [...newEvent.photos, ...mockUrls] })
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "job_fair":
        return "🏢"
      case "training_session":
        return "📚"
      case "community_meeting":
        return "👥"
      default:
        return "📅"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "default"
      case "approved":
        return "default"
      case "overdue":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => template.tags.includes(tag))
    return matchesSearch && matchesTags
  })

  const allTags = [...new Set(templates.flatMap((template) => template.tags))]

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading qualitative reporting...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Qualitative Reporting</h2>
          <p className="text-muted-foreground">Track outreach efforts and manage best practices</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowEventForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Log Event
          </Button>
        </div>
      </div>

      {/* Upcoming Deadlines Alert */}
      {reports.filter(
        (r) => r.status === "draft" && new Date(r.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ).length > 0 && (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription>
            You have {reports.filter((r) => r.status === "draft").length} qualitative reports due within the next 7
            days.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Outreach Events</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="templates">Best Practices</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Outreach Events</CardTitle>
              <CardDescription>Track community engagement and training activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getEventTypeIcon(event.event_type)}</span>
                        <h3 className="font-semibold">{event.title}</h3>
                        <Badge variant="outline" className="capitalize">
                          {event.event_type.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {new Date(event.event_date).toLocaleDateString()}
                        </span>
                        {event.location && <span className="flex items-center gap-1">📍 {event.location}</span>}
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.participant_count} participants
                        </span>
                        {event.photos.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Camera className="h-3 w-3" />
                            {event.photos.length} photos
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add Event Form */}
          {showEventForm && (
            <Card>
              <CardHeader>
                <CardTitle>Log Outreach Event</CardTitle>
                <CardDescription>Record community engagement activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Event Type</Label>
                    <Select
                      value={newEvent.event_type}
                      onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="job_fair">Job Fair</SelectItem>
                        <SelectItem value="training_session">Training Session</SelectItem>
                        <SelectItem value="community_meeting">Community Meeting</SelectItem>
                        <SelectItem value="apprenticeship_program">Apprenticeship Program</SelectItem>
                        <SelectItem value="vendor_training">Vendor Training</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Event Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newEvent.event_date ? format(newEvent.event_date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newEvent.event_date}
                          onSelect={(date) => setNewEvent({ ...newEvent, event_date: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Event Title</Label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Enter event title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Describe the event and its outcomes"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      placeholder="Event location"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Number of Participants</Label>
                    <Input
                      type="number"
                      value={newEvent.participant_count}
                      onChange={(e) => setNewEvent({ ...newEvent, participant_count: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Photos</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Upload event photos</p>
                    <Input type="file" multiple accept="image/*" onChange={handlePhotoUpload} />
                  </div>
                  {newEvent.photos.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {newEvent.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo || "/placeholder.svg"}
                          alt={`Event photo ${index + 1}`}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={createEvent}>Save Event</Button>
                  <Button variant="outline" onClick={() => setShowEventForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Qualitative Reports</CardTitle>
              <CardDescription>Manage periodic qualitative reporting submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{report.reporting_period} Report</h3>
                        <Badge variant={getStatusColor(report.status)}>{report.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(report.due_date).toLocaleDateString()}
                      </p>
                      {report.submitted_at && (
                        <p className="text-xs text-muted-foreground">
                          Submitted: {new Date(report.submitted_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        {report.status === "draft" ? "Edit" : "View"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Button onClick={() => setShowTemplateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </div>

              {/* Tag Filter */}
              <div className="flex flex-wrap gap-2 mt-4">
                {allTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedTags(
                        selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag],
                      )
                    }}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Templates Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="outline" className="capitalize">
                      {template.category.replace("_", " ")}
                    </Badge>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Use Template
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Template Form */}
          {showTemplateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create Best Practice Template</CardTitle>
                <CardDescription>Add a new template to the library</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={newTemplate.title}
                      onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                      placeholder="Template title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newTemplate.category}
                      onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="outreach_plan">Outreach Plan</SelectItem>
                        <SelectItem value="job_fair_flyer">Job Fair Flyer</SelectItem>
                        <SelectItem value="trainee_evaluation">Trainee Evaluation</SelectItem>
                        <SelectItem value="community_engagement">Community Engagement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    placeholder="Brief description of the template"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    value={newTemplate.tags}
                    onChange={(e) => setNewTemplate({ ...newTemplate, tags: e.target.value })}
                    placeholder="apprenticeship, recruitment, training"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Template Content</Label>
                  <Textarea
                    value={newTemplate.template_content}
                    onChange={(e) => setNewTemplate({ ...newTemplate, template_content: e.target.value })}
                    placeholder="Enter the template content..."
                    rows={8}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={createTemplate}>Create Template</Button>
                  <Button variant="outline" onClick={() => setShowTemplateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
