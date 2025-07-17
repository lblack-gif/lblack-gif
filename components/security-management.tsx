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
import { Switch } from "@/components/ui/switch"
import { Shield, Key, Lock, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface UserRole {
  id: string
  role_name: string
  description: string
  permissions: any
  hierarchy_level: number
}

interface UserSession {
  id: string
  user_id: string
  session_token: string
  ip_address: string
  user_agent: string
  mfa_verified: boolean
  expires_at: string
  created_at: string
}

interface MFAToken {
  id: string
  user_id: string
  token_type: string
  is_active: boolean
  created_at: string
}

export function SecurityManagement() {
  const [roles, setRoles] = useState<UserRole[]>([])
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [mfaTokens, setMfaTokens] = useState<MFAToken[]>([])
  const [encryptionStatus, setEncryptionStatus] = useState({
    at_rest: true,
    in_transit: true,
    key_rotation: "active",
    last_rotation: "2024-01-15",
  })
  const [showMfaSetup, setShowMfaSetup] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [loading, setLoading] = useState(true)

  const [newRole, setNewRole] = useState({
    role_name: "",
    description: "",
    hierarchy_level: 1,
    permissions: {
      read: [] as string[],
      write: [] as string[],
      delete: [] as string[],
      admin: false,
    },
  })

  useEffect(() => {
    fetchSecurityData()
  }, [])

  const fetchSecurityData = async () => {
    try {
      const [rolesData, sessionsData, mfaData] = await Promise.all([
        supabase.from("user_roles").select("*").order("hierarchy_level"),
        supabase.from("user_sessions").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("mfa_tokens").select("*").eq("is_active", true),
      ])

      setRoles(rolesData.data || [])
      setSessions(sessionsData.data || [])
      setMfaTokens(mfaData.data || [])
    } catch (error) {
      console.error("Error fetching security data:", error)
    } finally {
      setLoading(false)
    }
  }

  const createRole = async () => {
    try {
      const { error } = await supabase.from("user_roles").insert({
        role_name: newRole.role_name,
        description: newRole.description,
        hierarchy_level: newRole.hierarchy_level,
        permissions: newRole.permissions,
      })

      if (error) throw error

      setNewRole({
        role_name: "",
        description: "",
        hierarchy_level: 1,
        permissions: { read: [], write: [], delete: [], admin: false },
      })
      fetchSecurityData()
    } catch (error) {
      console.error("Error creating role:", error)
    }
  }

  const revokeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase.from("user_sessions").delete().eq("id", sessionId)

      if (error) throw error
      fetchSecurityData()
    } catch (error) {
      console.error("Error revoking session:", error)
    }
  }

  const enableMFA = async (userId: string, tokenType: string) => {
    try {
      const { error } = await supabase.from("mfa_tokens").insert({
        user_id: userId,
        token_type: tokenType,
        secret_key: "encrypted_secret_key", // This would be properly encrypted
        is_active: true,
      })

      if (error) throw error
      fetchSecurityData()
    } catch (error) {
      console.error("Error enabling MFA:", error)
    }
  }

  const rotateEncryptionKeys = async () => {
    try {
      // This would trigger key rotation process
      console.log("Initiating encryption key rotation...")

      setEncryptionStatus({
        ...encryptionStatus,
        key_rotation: "rotating",
      })

      // Simulate rotation process
      setTimeout(() => {
        setEncryptionStatus({
          ...encryptionStatus,
          key_rotation: "active",
          last_rotation: new Date().toISOString().split("T")[0],
        })
      }, 3000)
    } catch (error) {
      console.error("Error rotating keys:", error)
    }
  }

  const getHierarchyLabel = (level: number) => {
    switch (level) {
      case 0:
        return "System Level"
      case 1:
        return "Organization Level"
      case 2:
        return "Project Level"
      default:
        return "Custom Level"
    }
  }

  const getSessionStatus = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    return expires > now ? "active" : "expired"
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading security settings...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security Management</h2>
          <p className="text-muted-foreground">Manage data security, encryption, and access controls</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={encryptionStatus.at_rest ? "default" : "destructive"}>
            <Shield className="h-3 w-3 mr-1" />
            Encryption Active
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="encryption" className="space-y-4">
        <TabsList>
          <TabsTrigger value="encryption">Data Encryption</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="mfa">Multi-Factor Auth</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="encryption" className="space-y-4">
          {/* Encryption Status */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Data at Rest
                </CardTitle>
                <CardDescription>AES-256 encryption for stored data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Encryption Status</span>
                    <Badge variant={encryptionStatus.at_rest ? "default" : "destructive"}>
                      {encryptionStatus.at_rest ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>PII Protection</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Database Encryption</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>File Storage Encryption</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Data in Transit
                </CardTitle>
                <CardDescription>TLS 1.3 encryption for data transmission</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>TLS Encryption</span>
                    <Badge variant={encryptionStatus.in_transit ? "default" : "destructive"}>
                      {encryptionStatus.in_transit ? "TLS 1.3" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>API Security</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Certificate Validation</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>HSTS Enabled</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Management */}
          <Card>
            <CardHeader>
              <CardTitle>Encryption Key Management</CardTitle>
              <CardDescription>Manage encryption keys and rotation policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <Key className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-2xl font-bold">AES-256</div>
                  <p className="text-sm text-muted-foreground">Encryption Standard</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {encryptionStatus.key_rotation === "rotating" ? "Rotating..." : "Active"}
                  </div>
                  <p className="text-sm text-muted-foreground">Key Status</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{encryptionStatus.last_rotation}</div>
                  <p className="text-sm text-muted-foreground">Last Rotation</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Automatic Key Rotation</p>
                  <p className="text-sm text-muted-foreground">Rotate encryption keys every 90 days</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button onClick={rotateEncryptionKeys} disabled={encryptionStatus.key_rotation === "rotating"}>
                <Key className="h-4 w-4 mr-2" />
                {encryptionStatus.key_rotation === "rotating" ? "Rotating Keys..." : "Rotate Keys Now"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          {/* Role Hierarchy */}
          <Card>
            <CardHeader>
              <CardTitle>Role-Based Access Control</CardTitle>
              <CardDescription>Manage user roles and permissions hierarchy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{role.role_name.replace("_", " ").toUpperCase()}</h3>
                        <Badge variant="outline">{getHierarchyLabel(role.hierarchy_level)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions?.read?.map((perm: string) => (
                          <Badge key={perm} variant="secondary" className="text-xs">
                            Read: {perm}
                          </Badge>
                        ))}
                        {role.permissions?.write?.map((perm: string) => (
                          <Badge key={perm} variant="default" className="text-xs">
                            Write: {perm}
                          </Badge>
                        ))}
                        {role.permissions?.admin && (
                          <Badge variant="destructive" className="text-xs">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Create New Role */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Role</CardTitle>
              <CardDescription>Define custom roles with specific permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Role Name</Label>
                  <Input
                    value={newRole.role_name}
                    onChange={(e) => setNewRole({ ...newRole, role_name: e.target.value })}
                    placeholder="e.g., regional_manager"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hierarchy Level</Label>
                  <Select
                    value={newRole.hierarchy_level.toString()}
                    onValueChange={(value) => setNewRole({ ...newRole, hierarchy_level: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">System Level (HUD)</SelectItem>
                      <SelectItem value="1">Organization Level</SelectItem>
                      <SelectItem value="2">Project Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Role description and responsibilities"
                />
              </div>

              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Read Access</Label>
                    {["own_projects", "own_workers", "all_projects", "compliance_data"].map((perm) => (
                      <div key={perm} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`read_${perm}`}
                          checked={newRole.permissions.read.includes(perm)}
                          onChange={(e) => {
                            const read = e.target.checked
                              ? [...newRole.permissions.read, perm]
                              : newRole.permissions.read.filter((p) => p !== perm)
                            setNewRole({ ...newRole, permissions: { ...newRole.permissions, read } })
                          }}
                        />
                        <label htmlFor={`read_${perm}`} className="text-sm">
                          {perm.replace("_", " ")}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Write Access</Label>
                    {["own_data", "labor_hours", "reports", "worker_data"].map((perm) => (
                      <div key={perm} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`write_${perm}`}
                          checked={newRole.permissions.write.includes(perm)}
                          onChange={(e) => {
                            const write = e.target.checked
                              ? [...newRole.permissions.write, perm]
                              : newRole.permissions.write.filter((p) => p !== perm)
                            setNewRole({ ...newRole, permissions: { ...newRole.permissions, write } })
                          }}
                        />
                        <label htmlFor={`write_${perm}`} className="text-sm">
                          {perm.replace("_", " ")}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Administrative</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="admin"
                        checked={newRole.permissions.admin}
                        onChange={(e) =>
                          setNewRole({ ...newRole, permissions: { ...newRole.permissions, admin: e.target.checked } })
                        }
                      />
                      <label htmlFor="admin" className="text-sm">
                        Admin Access
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={createRole}>Create Role</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mfa" className="space-y-4">
          {/* MFA Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MFA Enabled Users</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mfaTokens.length}</div>
                <p className="text-xs text-muted-foreground">of {sessions.length} active users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">TOTP Tokens</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mfaTokens.filter((t) => t.token_type === "totp").length}</div>
                <p className="text-xs text-muted-foreground">Authenticator apps</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SMS Tokens</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mfaTokens.filter((t) => t.token_type === "sms").length}</div>
                <p className="text-xs text-muted-foreground">Phone verification</p>
              </CardContent>
            </Card>
          </div>

          {/* MFA Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Multi-Factor Authentication Requirements</CardTitle>
              <CardDescription>Configure MFA requirements for different user roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  MFA is required for all users accessing worker details and sensitive compliance data.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{role.role_name.replace("_", " ").toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked={role.hierarchy_level <= 1} />
                      <span className="text-sm">MFA Required</span>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={() => setShowMfaSetup(true)}>
                <Shield className="h-4 w-4 mr-2" />
                Setup MFA for User
              </Button>
            </CardContent>
          </Card>

          {/* MFA Setup Modal */}
          {showMfaSetup && (
            <Card>
              <CardHeader>
                <CardTitle>Setup Multi-Factor Authentication</CardTitle>
                <CardDescription>Configure MFA for enhanced security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="outline" className="h-24 flex-col" onClick={() => enableMFA("user-id", "totp")}>
                    <Key className="h-6 w-6 mb-2" />
                    Authenticator App
                  </Button>
                  <Button variant="outline" className="h-24 flex-col" onClick={() => enableMFA("user-id", "sms")}>
                    <Shield className="h-6 w-6 mb-2" />
                    SMS Verification
                  </Button>
                </div>
                <Button variant="outline" onClick={() => setShowMfaSetup(false)}>
                  Cancel
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active User Sessions</CardTitle>
              <CardDescription>Monitor and manage active user sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">User {session.user_id.slice(0, 8)}</h3>
                        <Badge variant={getSessionStatus(session.expires_at) === "active" ? "default" : "destructive"}>
                          {getSessionStatus(session.expires_at)}
                        </Badge>
                        {session.mfa_verified && (
                          <Badge variant="default">
                            <Shield className="h-3 w-3 mr-1" />
                            MFA Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">IP: {session.ip_address}</p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(session.created_at).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expires: {new Date(session.expires_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => revokeSession(session.id)}>
                        Revoke
                      </Button>
                    </div>
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
