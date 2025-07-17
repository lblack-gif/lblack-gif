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
import { Textarea } from "@/components/ui/textarea"
import {
  BookOpen,
  Play,
  MessageCircle,
  HelpCircle,
  CheckCircle,
  Clock,
  Users,
  Search,
  Star,
  Headphones,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface TrainingModule {
  id: string
  module_name: string
  module_type: string
  target_role: string
  duration_minutes: number
  is_interactive: boolean
  is_required: boolean
  prerequisites: string[]
}

interface UserTrainingProgress {
  id: string
  user_id: string
  module_id: string
  status: string
  progress_percentage: number
  score?: number
  completed_at?: string
}

interface SupportTicket {
  id: string
  ticket_number: string
  user_id: string
  category: string
  priority: string
  status: string
  subject: string
  description: string
  created_at: string
  resolved_at?: string
}

interface KnowledgeBaseArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  view_count: number
  is_published: boolean
}

export function TrainingSupport() {
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [userProgress, setUserProgress] = useState<UserTrainingProgress[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const [newTicket, setNewTicket] = useState({
    category: "",
    priority: "medium",
    subject: "",
    description: "",
  })

  useEffect(() => {
    fetchTrainingData()
  }, [])

  const fetchTrainingData = async () => {
    try {
      const [modulesData, progressData, ticketsData, articlesData] = await Promise.all([
        supabase.from("training_modules").select("*").order("module_name"),
        supabase.from("user_training_progress").select("*").order("created_at", { ascending: false }),
        supabase.from("support_tickets").select("*").order("created_at", { ascending: false }).limit(20),
        supabase
          .from("knowledge_base_articles")
          .select("*")
          .eq("is_published", true)
          .order("view_count", { ascending: false }),
      ])

      setModules(modulesData.data || [])
      setUserProgress(progressData.data || [])
      setTickets(ticketsData.data || [])
      setArticles(articlesData.data || [])
    } catch (error) {
      console.error("Error fetching training data:", error)
    } finally {
      setLoading(false)
    }
  }

  const startTraining = async (moduleId: string) => {
    try {
      const { error } = await supabase.from("user_training_progress").insert({
        user_id: "00000000-0000-0000-0000-000000000000", // This would be current user
        module_id: moduleId,
        status: "in_progress",
        progress_percentage: 0,
        started_at: new Date().toISOString(),
      })

      if (error) throw error
      fetchTrainingData()
    } catch (error) {
      console.error("Error starting training:", error)
    }
  }

  const submitTicket = async () => {
    try {
      const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`

      const { error } = await supabase.from("support_tickets").insert({
        ticket_number: ticketNumber,
        user_id: "00000000-0000-0000-0000-000000000000", // This would be current user
        category: newTicket.category,
        priority: newTicket.priority,
        subject: newTicket.subject,
        description: newTicket.description,
        status: "open",
      })

      if (error) throw error

      setShowTicketForm(false)
      setNewTicket({
        category: "",
        priority: "medium",
        subject: "",
        description: "",
      })
      fetchTrainingData()
    } catch (error) {
      console.error("Error submitting ticket:", error)
    }
  }

  const incrementArticleViews = async (articleId: string) => {
    try {
      const article = articles.find((a) => a.id === articleId)
      if (!article) return

      await supabase
        .from("knowledge_base_articles")
        .update({ view_count: article.view_count + 1 })
        .eq("id", articleId)

      fetchTrainingData()
    } catch (error) {
      console.error("Error updating article views:", error)
    }
  }

  const getModuleTypeIcon = (type: string) => {
    switch (type) {
      case "quick_start":
        return "🚀"
      case "advanced":
        return "🎓"
      case "train_trainer":
        return "👨‍🏫"
      default:
        return "📚"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "in_progress":
        return "secondary"
      case "not_started":
        return "outline"
      case "open":
        return "destructive"
      case "resolved":
        return "default"
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

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(articles.map((article) => article.category))]

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading training and support...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Training & Support</h2>
          <p className="text-muted-foreground">Access training materials and get help when you need it</p>
        </div>
        <Button onClick={() => setShowTicketForm(true)}>
          <HelpCircle className="h-4 w-4 mr-2" />
          Get Support
        </Button>
      </div>

      <Tabs defaultValue="training" className="space-y-4">
        <TabsList>
          <TabsTrigger value="training">Training Modules</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="support">Support Tickets</TabsTrigger>
          <TabsTrigger value="live-help">Live Help</TabsTrigger>
        </TabsList>

        <TabsContent value="training" className="space-y-4">
          {/* Training Progress Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{modules.length}</div>
                <p className="text-xs text-muted-foreground">Available for training</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userProgress.filter((p) => p.status === "completed").length}</div>
                <p className="text-xs text-muted-foreground">Modules finished</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userProgress.filter((p) => p.status === "in_progress").length}
                </div>
                <p className="text-xs text-muted-foreground">Currently learning</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userProgress.filter((p) => p.score).length > 0
                    ? Math.round(
                        userProgress.filter((p) => p.score).reduce((sum, p) => sum + (p.score || 0), 0) /
                          userProgress.filter((p) => p.score).length,
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Assessment average</p>
              </CardContent>
            </Card>
          </div>

          {/* Training Modules by Category */}
          <div className="space-y-6">
            {["quick_start", "advanced", "train_trainer"].map((type) => {
              const typeModules = modules.filter((m) => m.module_type === type)
              if (typeModules.length === 0) return null

              return (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-lg">{getModuleTypeIcon(type)}</span>
                      {type === "quick_start" && "Quick Start Guides"}
                      {type === "advanced" && "Advanced Training"}
                      {type === "train_trainer" && "Train-the-Trainer"}
                    </CardTitle>
                    <CardDescription>
                      {type === "quick_start" && "Get started quickly with essential features"}
                      {type === "advanced" && "Deep dive into advanced functionality"}
                      {type === "train_trainer" && "Resources for training others in your organization"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {typeModules.map((module) => {
                        const progress = userProgress.find((p) => p.module_id === module.id)

                        return (
                          <Card key={module.id} className="relative">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-semibold">{module.module_name}</h3>
                                    <p className="text-sm text-muted-foreground">{module.duration_minutes} minutes</p>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    {module.is_required && <Badge variant="destructive">Required</Badge>}
                                    {module.is_interactive && <Badge variant="outline">Interactive</Badge>}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="capitalize">
                                    {module.target_role}
                                  </Badge>
                                </div>

                                {progress && (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <span>Progress</span>
                                      <span>{progress.progress_percentage}%</span>
                                    </div>
                                    <Progress value={progress.progress_percentage} />
                                    <Badge variant={getStatusColor(progress.status)}>{progress.status}</Badge>
                                  </div>
                                )}

                                <Button
                                  onClick={() => startTraining(module.id)}
                                  className="w-full"
                                  variant={progress?.status === "completed" ? "outline" : "default"}
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  {progress?.status === "completed"
                                    ? "Review"
                                    : progress?.status === "in_progress"
                                      ? "Continue"
                                      : "Start"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search knowledge base..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Base Articles */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4" onClick={() => incrementArticleViews(article.id)}>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold line-clamp-2">{article.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                        {article.content.slice(0, 150)}...
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{article.category}</Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {article.view_count} views
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {article.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{article.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          {/* Support Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Track your support requests and their resolution status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{ticket.ticket_number}</h3>
                        <Badge variant={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                        <Badge variant={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                      </div>
                      <p className="font-medium">{ticket.subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Category: {ticket.category}</span>
                        <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                        {ticket.resolved_at && (
                          <span>Resolved: {new Date(ticket.resolved_at).toLocaleDateString()}</span>
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

          {/* Create Ticket Form */}
          {showTicketForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create Support Ticket</CardTitle>
                <CardDescription>Describe your issue and we'll help you resolve it</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newTicket.category}
                      onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="training">Training Question</SelectItem>
                        <SelectItem value="compliance">Compliance Help</SelectItem>
                        <SelectItem value="integration">Integration Support</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    placeholder="Provide detailed information about your issue, including steps to reproduce if applicable"
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={submitTicket}>Submit Ticket</Button>
                  <Button variant="outline" onClick={() => setShowTicketForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="live-help" className="space-y-4">
          {/* Live Support Options */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Live Chat Support
                </CardTitle>
                <CardDescription>Get instant help during business hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Available Now
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">Average response time: 2-3 minutes</p>
                <Button className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Live Chat
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="h-5 w-5" />
                  Phone Support
                </CardTitle>
                <CardDescription>Speak directly with our support team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <p className="font-semibold text-lg">1-800-HUD-HELP</p>
                  <p className="text-sm text-muted-foreground">Monday - Friday, 8 AM - 6 PM EST</p>
                </div>
                <Button variant="outline" className="w-full">
                  <Headphones className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Support Hours and Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Support Hours & Contact Information</CardTitle>
              <CardDescription>When and how to reach our support team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Business Hours Support</h4>
                  <div className="space-y-1 text-sm">
                    <p>Monday - Friday: 8:00 AM - 6:00 PM EST</p>
                    <p>Saturday: 9:00 AM - 2:00 PM EST</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Emergency Support</h4>
                  <div className="space-y-1 text-sm">
                    <p>Critical system issues: 24/7</p>
                    <p>Emergency hotline: 1-800-HUD-URGENT</p>
                    <p>Response time: Within 1 hour</p>
                  </div>
                </div>
              </div>

              <Alert>
                <HelpCircle className="h-4 w-4" />
                <AlertDescription>
                  For the fastest response, please check our knowledge base first. Many common questions are answered
                  there instantly.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
