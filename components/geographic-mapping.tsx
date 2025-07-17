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
import { MapPin, Search, AlertTriangle, CheckCircle, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ProjectLocation {
  id: string
  project_id: string
  latitude: number
  longitude: number
  address: string
  service_radius_miles: number
  census_tract?: string
  poverty_rate?: number
  median_income?: number
  project_name?: string
  projects?: {
    name: string
  }
}

interface WorkerAddress {
  id: string
  worker_id: string
  address: string
  latitude?: number
  longitude?: number
  census_tract?: string
  verification_status: string
  distance_to_project?: number
  eligibility_confirmed: boolean
  worker_name?: string
  workers?: {
    first_name: string
    last_name: string
  }
}

interface LocationData {
  id: string
  project_id: string
  latitude: number
  longitude: number
  address: string
  service_radius_miles: number
  census_tract?: string
  poverty_rate?: number
  median_income?: number
  projects?: {
    name: string
  }
}

interface AddressData {
  id: string
  worker_id: string
  address: string
  latitude?: number
  longitude?: number
  census_tract?: string
  verification_status: string
  distance_to_project?: number
  eligibility_confirmed: boolean
  workers?: {
    first_name: string
    last_name: string
  }
}

export function GeographicMapping() {
  const [projectLocations, setProjectLocations] = useState<ProjectLocation[]>([])
  const [workerAddresses, setWorkerAddresses] = useState<WorkerAddress[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [radiusFilter, setRadiusFilter] = useState<number>(5)
  const [flaggedAddresses, setFlaggedAddresses] = useState<WorkerAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [newLocation, setNewLocation] = useState({
    project_id: "",
    address: "",
    service_radius: 5,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch project locations with project names
      const { data: locationsData } = await supabase
        .from("project_locations")
        .select(`
          *,
          projects!inner(name)
        `)
        .order("created_at", { ascending: false })

      // Fetch worker addresses with worker names
      const { data: addressesData } = await supabase
        .from("worker_addresses")
        .select(`
          *,
          workers!inner(first_name, last_name)
        `)
        .order("created_at", { ascending: false })

      // Process the data to include names with proper typing
      const processedLocations: ProjectLocation[] =
        locationsData?.map((location: LocationData) => ({
          ...location,
          project_name: location.projects?.name,
        })) || []

      const processedAddresses: WorkerAddress[] =
        addressesData?.map((address: AddressData) => ({
          ...address,
          worker_name: `${address.workers?.first_name} ${address.workers?.last_name}`,
        })) || []

      setProjectLocations(processedLocations)
      setWorkerAddresses(processedAddresses)
      setFlaggedAddresses(processedAddresses.filter((addr) => addr.verification_status === "flagged"))
    } catch (error) {
      console.error("Error fetching geographic data:", error)
    } finally {
      setLoading(false)
    }
  }

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // This would integrate with a geocoding service like Google Maps API
      // For demo purposes, returning mock coordinates
      const mockCoordinates = {
        lat: 38.9072 + (Math.random() - 0.5) * 0.1, // Washington DC area
        lng: -77.0369 + (Math.random() - 0.5) * 0.1,
      }
      return mockCoordinates
    } catch (error) {
      console.error("Error geocoding address:", error)
      return null
    }
  }

  const addProjectLocation = async () => {
    try {
      const coordinates = await geocodeAddress(newLocation.address)
      if (!coordinates) {
        throw new Error("Could not geocode address")
      }

      // Mock census data lookup
      const mockCensusData = {
        census_tract: "11001006202",
        poverty_rate: 15.2,
        median_income: 45000,
      }

      const { error } = await supabase.from("project_locations").insert({
        project_id: newLocation.project_id,
        address: newLocation.address,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        service_radius_miles: newLocation.service_radius,
        ...mockCensusData,
      })

      if (error) throw error

      setNewLocation({ project_id: "", address: "", service_radius: 5 })
      fetchData()
    } catch (error) {
      console.error("Error adding project location:", error)
    }
  }

  const verifyWorkerAddress = async (addressId: string, eligible: boolean) => {
    try {
      const { error } = await supabase
        .from("worker_addresses")
        .update({
          verification_status: eligible ? "verified" : "flagged",
          eligibility_confirmed: eligible,
          verified_by: "00000000-0000-0000-0000-000000000000", // This would be current user
          verified_at: new Date().toISOString(),
        })
        .eq("id", addressId)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error("Error verifying address:", error)
    }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959 // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const getEligibilityStatus = (address: WorkerAddress) => {
    if (address.verification_status === "verified" && address.eligibility_confirmed) {
      return { status: "Eligible", color: "default" as const, icon: CheckCircle }
    } else if (address.verification_status === "flagged") {
      return { status: "Flagged", color: "destructive" as const, icon: AlertTriangle }
    } else {
      return { status: "Pending", color: "secondary" as const, icon: Eye }
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading geographic data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Geographic Mapping</h2>
          <p className="text-muted-foreground">Manage project locations and verify worker eligibility</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <MapPin className="h-4 w-4 mr-2" />
            View Map
          </Button>
        </div>
      </div>

      {/* Flagged Addresses Alert */}
      {flaggedAddresses.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {flaggedAddresses.length} worker addresses require review for eligibility verification.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Project Locations</TabsTrigger>
          <TabsTrigger value="workers">Worker Verification</TabsTrigger>
          <TabsTrigger value="census">Census Data</TabsTrigger>
          <TabsTrigger value="analysis">Geographic Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          {/* Project Locations */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Locations</CardTitle>
                <CardDescription>Manage project sites and service areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {projectLocations.map((location) => (
                  <div key={location.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{location.project_name}</p>
                      <p className="text-sm text-muted-foreground">{location.address}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Radius: {location.service_radius_miles} miles</span>
                        {location.census_tract && <span>• Tract: {location.census_tract}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {location.poverty_rate && <Badge variant="outline">{location.poverty_rate}% poverty</Badge>}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Project Location</CardTitle>
                <CardDescription>Register a new project site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select
                    value={newLocation.project_id}
                    onValueChange={(value) => setNewLocation({ ...newLocation, project_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectLocations.map((location: ProjectLocation) => (
                        <SelectItem key={location.project_id} value={location.project_id}>
                          {location.project_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={newLocation.address}
                    onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                    placeholder="Enter project address"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Service Radius (miles)</Label>
                  <Select
                    value={newLocation.service_radius.toString()}
                    onValueChange={(value) =>
                      setNewLocation({ ...newLocation, service_radius: Number.parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 mile</SelectItem>
                      <SelectItem value="3">3 miles</SelectItem>
                      <SelectItem value="5">5 miles</SelectItem>
                      <SelectItem value="10">10 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={addProjectLocation} className="w-full">
                  <MapPin className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workers" className="space-y-4">
          {/* Worker Address Verification */}
          <Card>
            <CardHeader>
              <CardTitle>Worker Address Verification</CardTitle>
              <CardDescription>Review and verify worker eligibility based on address</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search worker addresses..." className="pl-8" />
                    </div>
                  </div>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projectLocations.map((location: ProjectLocation) => (
                        <SelectItem key={location.project_id} value={location.project_id}>
                          {location.project_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {workerAddresses.map((address) => {
                    const eligibility = getEligibilityStatus(address)
                    const Icon = eligibility.icon

                    return (
                      <div key={address.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{address.worker_name}</p>
                            <Badge variant={eligibility.color}>
                              <Icon className="h-3 w-3 mr-1" />
                              {eligibility.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{address.address}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {address.census_tract && <span>Tract: {address.census_tract}</span>}
                            {address.distance_to_project && (
                              <span>Distance: {address.distance_to_project.toFixed(1)} miles</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {address.verification_status === "pending" && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => verifyWorkerAddress(address.id, true)}>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => verifyWorkerAddress(address.id, false)}
                              >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Flag
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="census" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Census Data Integration</CardTitle>
              <CardDescription>View census tract data and poverty statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">127</div>
                  <p className="text-sm text-muted-foreground">Census Tracts Covered</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">18.5%</div>
                  <p className="text-sm text-muted-foreground">Avg Poverty Rate</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">$42,500</div>
                  <p className="text-sm text-muted-foreground">Median Income</p>
                </div>
              </div>
              <div className="mt-6 text-center py-8">
                <p className="text-muted-foreground">Census tract visualization would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Analysis</CardTitle>
              <CardDescription>Analyze worker distribution and project coverage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Coverage Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Workers within 1 mile</span>
                      <span className="font-medium">45</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Workers within 3 miles</span>
                      <span className="font-medium">128</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Workers within 5 miles</span>
                      <span className="font-medium">267</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Eligibility Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Verified Eligible</span>
                      <span className="font-medium text-green-600">189</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pending Review</span>
                      <span className="font-medium text-orange-600">34</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Flagged</span>
                      <span className="font-medium text-red-600">12</span>
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
