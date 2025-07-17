"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Clock, Users, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { supabase, type LaborHours, type Project, type Worker } from "@/lib/supabase"

interface LaborHoursForm {
  project_id: string
  worker_id: string
  hours_worked: string
  work_date: Date | undefined
  job_category: string
  hourly_rate: string
}

export function LaborHoursTracker() {
  const [laborHours, setLaborHours] = useState<LaborHours[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<LaborHoursForm>({
    project_id: "",
    worker_id: "",
    hours_worked: "",
    work_date: undefined,
    job_category: "",
    hourly_rate: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch labor hours with related data
      const { data: hoursData } = await supabase
        .from("labor_hours")
        .select(`
          *,
          projects(name),
          workers(first_name, last_name, is_section3_worker, is_targeted_section3_worker)
        `)
        .order("work_date", { ascending: false })

      // Fetch projects
      const { data: projectsData } = await supabase.from("projects").select("*").eq("status", "active")

      // Fetch workers
      const { data: workersData } = await supabase.from("workers").select("*").order("last_name")

      setLaborHours(hoursData || [])
      setProjects(projectsData || [])
      setWorkers(workersData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { error } = await supabase.from("labor_hours").insert({
        project_id: form.project_id,
        worker_id: form.worker_id,
        hours_worked: Number.parseFloat(form.hours_worked),
        work_date: form.work_date?.toISOString().split("T")[0],
        job_category: form.job_category,
        hourly_rate: form.hourly_rate ? Number.parseFloat(form.hourly_rate) : null,
        contractor_id: "00000000-0000-0000-0000-000000000000", // This would be dynamic
      })

      if (error) throw error

      // Reset form and refresh data
      setForm({
        project_id: "",
        worker_id: "",
        hours_worked: "",
        work_date: undefined,
        job_category: "",
        hourly_rate: "",
      })
      setShowForm(false)
      fetchData()
    } catch (error) {
      console.error("Error submitting labor hours:", error)
    }
  }

  const verifyHours = async (id: string) => {
    try {
      const { error } = await supabase.from("labor_hours").update({ verified: true }).eq("id", id)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error("Error verifying hours:", error)
    }
  }

  const getWorkerBadge = (worker: any) => {
    if (worker.is_targeted_section3_worker) {
      return <Badge variant="default">Targeted Section 3</Badge>
    } else if (worker.is_section3_worker) {
      return <Badge variant="secondary">Section 3</Badge>
    }
    return <Badge variant="outline">Regular</Badge>
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading labor hours...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Labor Hours Tracking</h2>
          <p className="text-muted-foreground">Track and verify labor hours for Section 3 compliance</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Hours
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {laborHours.reduce((sum, record) => sum + Number(record.hours_worked), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Section 3 Hours</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {laborHours
                .filter((record) => record.workers?.is_section3_worker)
                .reduce((sum, record) => sum + Number(record.hours_worked), 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Targeted Section 3</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {laborHours
                .filter((record) => record.workers?.is_targeted_section3_worker)
                .reduce((sum, record) => sum + Number(record.hours_worked), 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Hours</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {laborHours
                .filter((record) => record.verified)
                .reduce((sum, record) => sum + Number(record.hours_worked), 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Labor Hours Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Labor Hours</CardTitle>
          <CardDescription>Latest labor hour entries and verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {laborHours.slice(0, 10).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {record.workers?.first_name} {record.workers?.last_name}
                    </p>
                    {getWorkerBadge(record.workers)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {record.projects?.name} • {record.hours_worked} hours • {record.work_date}
                  </p>
                  {record.job_category && (
                    <p className="text-xs text-muted-foreground">Category: {record.job_category}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {record.verified ? (
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => verifyHours(record.id)}>
                      Verify
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Hours Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Log Labor Hours</CardTitle>
              <CardDescription>Add new labor hour entry</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="project">Project</Label>
                  <Select value={form.project_id} onValueChange={(value) => setForm({ ...form, project_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="worker">Worker</Label>
                  <Select value={form.worker_id} onValueChange={(value) => setForm({ ...form, worker_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select worker" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.map((worker) => (
                        <SelectItem key={worker.id} value={worker.id}>
                          {worker.first_name} {worker.last_name}
                          {worker.is_section3_worker && " (Section 3)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="hours">Hours Worked</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.25"
                    value={form.hours_worked}
                    onChange={(e) => setForm({ ...form, hours_worked: e.target.value })}
                    placeholder="8.0"
                    required
                  />
                </div>

                <div>
                  <Label>Work Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.work_date ? format(form.work_date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.work_date}
                        onSelect={(date) => setForm({ ...form, work_date: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="category">Job Category</Label>
                  <Input
                    id="category"
                    value={form.job_category}
                    onChange={(e) => setForm({ ...form, job_category: e.target.value })}
                    placeholder="Construction, Maintenance, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="rate">Hourly Rate (Optional)</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={form.hourly_rate}
                    onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
                    placeholder="25.00"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Submit
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
