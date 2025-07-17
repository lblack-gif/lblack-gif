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
import { Switch } from "@/components/ui/switch"
import {
  Users,
  UserPlus,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  Building,
  Clock,
  TrendingUp,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface WorkerRegistration {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  address: string
  is_section3_worker: boolean
  is_targeted_section3_worker: boolean
  verification_status: string
  verification_documents: string[]
  skills: string[]
  certifications: string[]
  availability_status: string
  hourly_rate?: number
  created_at: string
}

interface WorkerVerification {
  id: string
  worker_id: string
  verification_type: string
  document_type: string
  document_url: string
  verification_status: string
  verified_by?: string
  verified_at?: string
  notes?: string
}

interface WorkerSkill {
  id: string
  worker_id: string
  skill_name: string
  proficiency_level: string
  certified: boolean
  certification_date?: string
  certification_body?: string
}

export function WorkerManagement() {
  const [workers, setWorkers] = useState<WorkerRegistration[]>([])
  const [verifications, setVerifications] = useState<WorkerVerification[]>([])
  const [skills, setSkills] = useState<WorkerSkill[]>([])
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)

  const [newWorker, setNewWorker] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    is_section3_worker: false,
    is_targeted_section3_worker: false,
    skills: [] as string[],
    certifications: [] as string[],
    hourly_rate: "",
  })

  const [verificationDate, setVerificationDate] = useState<Date>()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [workersData, verificationsData, skillsData] = await Promise.all([
        supabase.from("workers").select("*").order("created_at", { ascending: false }),
        supabase.from("worker_verifications").select("*").order("created_at", { ascending: false }),
        supabase.from("worker_skills").select("*").order("skill_name"),
      ])

      setWorkers(workersData.data || [])
      setVerifications(verificationsData.data || [])
      setSkills(skillsData.data || [])
    } catch (error) {
      console.error("Error fetching worker data:", error)
    } finally {
      setLoading(false)
    }
  }

  const registerWorker = async () => {
    try {
      const { data: workerData, error: workerError } = await supabase
        .from("workers")
        .insert({
          first_name: newWorker.first_name,
          last_name: newWorker.last_name,
          email: newWorker.email,
          phone: newWorker.phone,
          address: newWorker.address,
          is_section3_worker: newWorker.is_section3_worker,
          is_targeted_section3_worker: newWorker.is_targeted_section3_worker,
          verification_status: "pending",
          skills: newWorker.skills,
          certifications: newWorker.certifications,
          hourly_rate: newWorker.hourly_rate ? Number.parseFloat(newWorker.hourly_rate) : null,
          availability_status: "available",
        })
        .select()
        .single()

      if (workerError) throw workerError

      // Add skills as separate records
      if (newWorker.skills.length > 0 && workerData) {
        const skillRecords = newWorker.skills.map((skill) => ({
          worker_id: workerData.id,
          skill_name: skill,
          proficiency_level: "intermediate",
          certified: false,
        }))

        await supabase.from("worker_skills").insert(skillRecords)
      }

      setShowRegistrationForm(false)
      setNewWorker({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        is_section3_worker: false,
        is_targeted_section3_worker: false,
        skills: [],
        certifications: [],
        hourly_rate: "",
      })
      fetchData()
    } catch (error) {
      console.error("Error registering worker:", error)
    }
  }

  const verifyWorker = async (workerId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("workers")
        .update({
          verification_status: status,
          verified_by: "00000000-0000-0000-0000-000000000000", // Current user
          verified_at: new Date().toISOString(),
        })
        .eq("id", workerId)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error("Error verifying worker:", error)
    }
  }

  const addSkill = async (workerId: string, skillName: string) => {
    try {
      const { error } = await supabase.from("worker_skills").insert({
        worker_id: workerId,
        skill_name: skillName,
        proficiency_level: "beginner",
        certified: false,
      })

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error("Error adding skill:", error)
    }
  }

  const getWorkerBadge = (worker: WorkerRegistration) => {
    if (worker.is_targeted_section3_worker) {
      return <Badge variant="default">Targeted Section 3</Badge>
    } else if (worker.is_section3_worker) {
      return <Badge variant="secondary">Section 3</Badge>
    }
    return <Badge variant="outline">Regular Worker</Badge>
  }

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "flagged":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Flagged
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getAvailabilityBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge variant="default">Available</Badge>
      case "busy":
        return <Badge variant="secondary">Busy</Badge>
      case "unavailable":
        return <Badge variant="outline">Unavailable</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "section3" && worker.is_section3_worker) ||
      (filterStatus === "targeted" && worker.is_targeted_section3_worker) ||
      (filterStatus === "pending" && worker.verification_status === "pending") ||
      (filterStatus === "verified" && worker.verification_status === "verified")

    return matchesSearch && matchesFilter
  })

  const workerStats = {
    total: workers.length,
    section3: workers.filter((w) => w.is_section3_worker).length,
    targeted: workers.filter((w) => w.is_targeted_section3_worker).length,
    verified: workers.filter((w) => w.verification_status === "verified").length,
    pending: workers.filter((w) => w.verification_status === "pending").length,
    available: workers.filter((w) => w.availability_status === "available").length,
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading worker management...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Worker Management</h2>
          <p className="text-muted-foreground">Comprehensive worker registration and verification system</p>
        </div>
        <Button onClick={() => setShowRegistrationForm(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Register Worker
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workerStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Section 3</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workerStats.section3}</div>
            <Progress value={(workerStats.section3 / workerStats.total) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Targeted</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workerStats.targeted}</div>
            <Progress value={(workerStats.targeted / workerStats.total) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workerStats.verified}</div>
            <Progress value={(workerStats.verified / workerStats.total) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workerStats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workerStats.available}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Verifications Alert */}
      {workerStats.pending > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {workerStats.pending} workers are pending verification and require document review.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="registry" className="space-y-4">
        <TabsList>
          <TabsTrigger value="registry">Worker Registry</TabsTrigger>
          <TabsTrigger value="verification">Verification Queue</TabsTrigger>
          <TabsTrigger value="skills">Skills Database</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="registry" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search workers by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Workers</SelectItem>
                    <SelectItem value="section3">Section 3 Only</SelectItem>
                    <SelectItem value="targeted">Targeted Section 3</SelectItem>
                    <SelectItem value="verified">Verified Only</SelectItem>
                    <SelectItem value="pending">Pending Verification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Worker List */}
          <div className="grid gap-4">
            {filteredWorkers.map((worker) => (
              <Card key={worker.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {worker.first_name} {worker.last_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getWorkerBadge(worker)}
                            {getVerificationBadge(worker.verification_status)}
                            {getAvailabilityBadge(worker.availability_status)}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm">
                        {worker.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{worker.email}</span>
                          </div>
                        )}
                        {worker.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{worker.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{worker.address}</span>
                        </div>
                        {worker.hourly_rate && (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>${worker.hourly_rate}/hr</span>
                          </div>
                        )}
                      </div>

                      {worker.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {worker.skills.slice(0, 5).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {worker.skills.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{worker.skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {worker.verification_status === "pending" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => verifyWorker(worker.id, "verified")}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => verifyWorker(worker.id, "flagged")}>
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Flag
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setSelectedWorker(worker.id)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Registration Form */}
          {showRegistrationForm && (
            <Card>
              <CardHeader>
                <CardTitle>Register New Worker</CardTitle>
                <CardDescription>Add a new worker to the Section 3 database</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input
                      value={newWorker.first_name}
                      onChange={(e) => setNewWorker({ ...newWorker, first_name: e.target.value })}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      value={newWorker.last_name}
                      onChange={(e) => setNewWorker({ ...newWorker, last_name: e.target.value })}
                      placeholder="Enter last name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newWorker.email}
                      onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                      placeholder="worker@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={newWorker.phone}
                      onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea
                    value={newWorker.address}
                    onChange={(e) => setNewWorker({ ...newWorker, address: e.target.value })}
                    placeholder="Enter complete address"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Section 3 Worker</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newWorker.is_section3_worker}
                        onCheckedChange={(checked) => setNewWorker({ ...newWorker, is_section3_worker: checked })}
                      />
                      <span className="text-sm">Qualifies as Section 3</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Targeted Section 3</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newWorker.is_targeted_section3_worker}
                        onCheckedChange={(checked) =>
                          setNewWorker({ ...newWorker, is_targeted_section3_worker: checked })
                        }
                      />
                      <span className="text-sm">Targeted hire</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Hourly Rate</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newWorker.hourly_rate}
                      onChange={(e) => setNewWorker({ ...newWorker, hourly_rate: e.target.value })}
                      placeholder="25.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Skills (comma-separated)</Label>
                  <Input
                    value={newWorker.skills.join(", ")}
                    onChange={(e) =>
                      setNewWorker({
                        ...newWorker,
                        skills: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter((s) => s),
                      })
                    }
                    placeholder="Construction, Electrical, Plumbing, HVAC"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={registerWorker}>Register Worker</Button>
                  <Button variant="outline" onClick={() => setShowRegistrationForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Queue</CardTitle>
              <CardDescription>Review and verify worker documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workers
                  .filter((w) => w.verification_status === "pending")
                  .map((worker) => (
                    <div key={worker.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {worker.first_name} {worker.last_name}
                          </h3>
                          {getWorkerBadge(worker)}
                        </div>
                        <p className="text-sm text-muted-foreground">{worker.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Registered: {new Date(worker.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => verifyWorker(worker.id, "verified")}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => verifyWorker(worker.id, "flagged")}>
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Flag
                        </Button>
                      </div>
                    </div>
                  ))}
                {workers.filter((w) => w.verification_status === "pending").length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">No workers pending verification</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills Database</CardTitle>
              <CardDescription>Manage worker skills and certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Skills management interface will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Worker Analytics</CardTitle>
              <CardDescription>Analyze worker demographics and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Section 3 Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Regular Workers</span>
                      <span className="font-medium">{workerStats.total - workerStats.section3}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Section 3 Workers</span>
                      <span className="font-medium text-blue-600">{workerStats.section3}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Targeted Section 3</span>
                      <span className="font-medium text-green-600">{workerStats.targeted}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Verification Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Verified</span>
                      <span className="font-medium text-green-600">{workerStats.verified}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pending</span>
                      <span className="font-medium text-orange-600">{workerStats.pending}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Available</span>
                      <span className="font-medium text-blue-600">{workerStats.available}</span>
                    </div>
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
