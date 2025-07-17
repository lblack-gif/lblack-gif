"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, Copy, Download } from "lucide-react"

interface SetupStatus {
  timestamp: string
  environment: string
  services: {
    supabase: {
      configured: boolean
      url: string
      anonKey: string
      serviceKey: string
    }
    ai: {
      configured: boolean
      openai: string
    }
    security: {
      jwtSecret: string
      encryptionKey: string
    }
    email: {
      configured: boolean
      host: string
      user: string
    }
  }
  recommendations: string[]
}

export function SetupWizard() {
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [envTemplate, setEnvTemplate] = useState("")

  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      const response = await fetch("/api/setup")
      const data = await response.json()
      setSetupStatus(data)
    } catch (error) {
      console.error("Failed to check setup status:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateEnvTemplate = async () => {
    setGenerating(true)
    try {
      const response = await fetch("/api/setup", { method: "POST" })
      const data = await response.json()

      if (data.success) {
        setEnvTemplate(data.template)
      }
    } catch (error) {
      console.error("Failed to generate template:", error)
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envTemplate)
  }

  const downloadTemplate = () => {
    const blob = new Blob([envTemplate], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = ".env.local"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading setup status...</div>
        </CardContent>
      </Card>
    )
  }

  if (!setupStatus) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Failed to load setup status</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = (status: string) => {
    if (status.includes("✓")) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (configured: boolean) => {
    return configured ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Configured
      </Badge>
    ) : (
      <Badge variant="destructive">Not Configured</Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Section 3 Compliance System Setup</CardTitle>
          <CardDescription>Configure your environment variables to get started</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Supabase Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Database (Supabase)</h3>
              {getStatusBadge(setupStatus.services.supabase.configured)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(setupStatus.services.supabase.url)}
                <span className="text-sm">Supabase URL</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(setupStatus.services.supabase.anonKey)}
                <span className="text-sm">Anonymous Key</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(setupStatus.services.supabase.serviceKey)}
                <span className="text-sm">Service Role Key</span>
              </div>
            </div>
          </div>

          {/* AI Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">AI Integration</h3>
              {getStatusBadge(setupStatus.services.ai.configured)}
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(setupStatus.services.ai.openai)}
              <span className="text-sm">OpenAI API Key</span>
            </div>
          </div>

          {/* Security Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Security</h3>
              {getStatusBadge(
                !!(
                  setupStatus.services.security.jwtSecret.includes("✓") &&
                  setupStatus.services.security.encryptionKey.includes("✓")
                ),
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(setupStatus.services.security.jwtSecret)}
                <span className="text-sm">JWT Secret</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(setupStatus.services.security.encryptionKey)}
                <span className="text-sm">Encryption Key</span>
              </div>
            </div>
          </div>

          {/* Email Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Email (Optional)</h3>
              {getStatusBadge(setupStatus.services.email.configured)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(setupStatus.services.email.host)}
                <span className="text-sm">SMTP Host</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(setupStatus.services.email.user)}
                <span className="text-sm">SMTP User</span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {setupStatus.recommendations.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Setup Recommendations:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {setupStatus.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Generate Environment Template */}
          <div className="space-y-4">
            <Button onClick={generateEnvTemplate} disabled={generating} className="w-full">
              {generating ? "Generating..." : "Generate Environment Template"}
            </Button>

            {envTemplate && (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Button onClick={copyToClipboard} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadTemplate} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-x-auto">{envTemplate}</pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
