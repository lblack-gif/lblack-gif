"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Brain,
  Mail,
  FileText,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  Download,
  Settings,
  BarChart3,
} from "lucide-react"

interface EmailClassification {
  id: string
  subject: string
  sender: string
  classification: string
  confidence: number
  priority: string
  suggestedResponse: string
  status: "pending" | "processed" | "reviewed"
  createdAt: string
}

interface ContractAnalysis {
  id: string
  contractName: string
  analysisStatus: "analyzing" | "completed" | "error"
  section3Requirements: {
    threshold: number
    laborHourRequirement: number
    targetedHiring: boolean
    trainingRequirements: string[]
  }
  riskFactors: string[]
  recommendations: string[]
  complianceScore: number
  createdAt: string
}

interface AIMetrics {
  emailsProcessed: number
  contractsAnalyzed: number
  averageConfidence: number
  automationRate: number
  timesSaved: number
}

export function AIIntegration() {
  const [activeTab, setActiveTab] = useState("email-classification")
  const [emailClassifications, setEmailClassifications] = useState<EmailClassification[]>([])
  const [contractAnalyses, setContractAnalyses] = useState<ContractAnalysis[]>([])
  const [aiMetrics, setAIMetrics] = useState<AIMetrics>({
    emailsProcessed: 0,
    contractsAnalyzed: 0,
    averageConfidence: 0,
    automationRate: 0,
    timesSaved: 0,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<EmailClassification | null>(null)
  const [selectedContract, setSelectedContract] = useState<ContractAnalysis | null>(null)

  // Sample data for demonstration
  useEffect(() => {
    const sampleEmails: EmailClassification[] = [
      {
        id: "1",
        subject: "Section 3 Worker Verification Question",
        sender: "contractor@acme.com",
        classification: "compliance_inquiry",
        confidence: 0.92,
        priority: "medium",
        suggestedResponse:
          "Thank you for your inquiry about Section 3 worker verification. Based on HUD guidelines, you'll need to collect documentation including proof of residence and income verification...",
        status: "pending",
        createdAt: "2024-01-20T10:30:00Z",
      },
      {
        id: "2",
        subject: "Urgent: Compliance Deadline Approaching",
        sender: "legal@buildco.com",
        classification: "deadline_alert",
        confidence: 0.98,
        priority: "high",
        suggestedResponse:
          "We understand the urgency of your compliance deadline. To ensure timely submission, please review the following checklist...",
        status: "processed",
        createdAt: "2024-01-20T09:15:00Z",
      },
      {
        id: "3",
        subject: "Training Session Request",
        sender: "hr@construction.com",
        classification: "training_request",
        confidence: 0.85,
        priority: "low",
        suggestedResponse: "Thank you for your interest in Section 3 training. Our next scheduled session is on...",
        status: "reviewed",
        createdAt: "2024-01-20T08:45:00Z",
      },
    ]

    const sampleContracts: ContractAnalysis[] = [
      {
        id: "1",
        contractName: "Downtown Housing Development Contract",
        analysisStatus: "completed",
        section3Requirements: {
          threshold: 25,
          laborHourRequirement: 2500,
          targetedHiring: true,
          trainingRequirements: ["OSHA Safety Training", "Section 3 Orientation"],
        },
        riskFactors: [
          "Tight timeline may impact Section 3 hiring goals",
          "Limited local workforce in specialized trades",
        ],
        recommendations: [
          "Begin Section 3 outreach 60 days before construction start",
          "Partner with local training organizations",
          "Consider apprenticeship programs for specialized trades",
        ],
        complianceScore: 85,
        createdAt: "2024-01-19T14:20:00Z",
      },
      {
        id: "2",
        contractName: "Community Center Renovation",
        analysisStatus: "completed",
        section3Requirements: {
          threshold: 25,
          laborHourRequirement: 1200,
          targetedHiring: false,
          trainingRequirements: ["Basic Construction Safety"],
        },
        riskFactors: [
          "Renovation work requires specialized skills",
          "Limited Section 3 workers with renovation experience",
        ],
        recommendations: [
          "Provide on-the-job training for Section 3 workers",
          "Partner with experienced contractors for mentorship",
          "Document all training activities for compliance",
        ],
        complianceScore: 78,
        createdAt: "2024-01-18T11:30:00Z",
      },
    ]

    setEmailClassifications(sampleEmails)
    setContractAnalyses(sampleContracts)
    setAIMetrics({
      emailsProcessed: 156,
      contractsAnalyzed: 23,
      averageConfidence: 0.89,
      automationRate: 0.73,
      timesSaved: 42,
    })
  }, [])

  const handleEmailClassification = async (emailId: string) => {
    setIsProcessing(true)
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setEmailClassifications((prev) =>
      prev.map((email) => (email.id === emailId ? { ...email, status: "processed" as const } : email)),
    )
    setIsProcessing(false)
  }

  const handleContractAnalysis = async (file: File) => {
    setIsProcessing(true)

    const newAnalysis: ContractAnalysis = {
      id: Date.now().toString(),
      contractName: file.name,
      analysisStatus: "analyzing",
      section3Requirements: {
        threshold: 0,
        laborHourRequirement: 0,
        targetedHiring: false,
        trainingRequirements: [],
      },
      riskFactors: [],
      recommendations: [],
      complianceScore: 0,
      createdAt: new Date().toISOString(),
    }

    setContractAnalyses((prev) => [newAnalysis, ...prev])

    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 5000))

    const completedAnalysis: ContractAnalysis = {
      ...newAnalysis,
      analysisStatus: "completed",
      section3Requirements: {
        threshold: 25,
        laborHourRequirement: Math.floor(Math.random() * 3000) + 1000,
        targetedHiring: Math.random() > 0.5,
        trainingRequirements: ["OSHA Safety Training", "Section 3 Orientation"],
      },
      riskFactors: ["Timeline constraints may impact hiring goals", "Specialized skill requirements"],
      recommendations: ["Early Section 3 outreach recommended", "Consider partnership with training organizations"],
      complianceScore: Math.floor(Math.random() * 30) + 70,
    }

    setContractAnalyses((prev) =>
      prev.map((analysis) => (analysis.id === newAnalysis.id ? completedAnalysis : analysis)),
    )
    setIsProcessing(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "reviewed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Integration</h2>
          <p className="text-muted-foreground">Intelligent email classification and contract analysis powered by AI</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            AI Settings
          </Button>
        </div>
      </div>

      {/* AI Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Processed</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiMetrics.emailsProcessed}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contracts Analyzed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiMetrics.contractsAnalyzed}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(aiMetrics.averageConfidence * 100)}%</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(aiMetrics.automationRate * 100)}%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Saved</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiMetrics.timesSaved}h</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="email-classification">Email Classification</TabsTrigger>
          <TabsTrigger value="contract-analysis">Contract Analysis</TabsTrigger>
          <TabsTrigger value="ai-settings">AI Configuration</TabsTrigger>
        </TabsList>

        {/* Email Classification Tab */}
        <TabsContent value="email-classification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Classification & Response Generation</CardTitle>
              <CardDescription>
                AI-powered email triage with automatic classification and suggested responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailClassifications.map((email) => (
                  <div key={email.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(email.status)}
                        <h4 className="font-medium">{email.subject}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(email.priority)}>{email.priority}</Badge>
                        <Badge variant="outline">{Math.round(email.confidence * 100)}% confidence</Badge>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      From: {email.sender} • Classification: {email.classification}
                    </div>

                    {email.status === "pending" && (
                      <div className="space-y-3">
                        <div className="bg-muted p-3 rounded">
                          <Label className="text-sm font-medium">Suggested Response:</Label>
                          <p className="text-sm mt-1">{email.suggestedResponse}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEmailClassification(email.id)} disabled={isProcessing}>
                            {isProcessing ? "Processing..." : "Approve & Send"}
                          </Button>
                          <Button size="sm" variant="outline">
                            Edit Response
                          </Button>
                          <Button size="sm" variant="ghost">
                            Manual Review
                          </Button>
                        </div>
                      </div>
                    )}

                    {email.status === "processed" && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Response sent successfully. Email classified and processed automatically.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contract Analysis Tab */}
        <TabsContent value="contract-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract Analysis & Section 3 Requirements</CardTitle>
              <CardDescription>
                AI-powered contract analysis to identify Section 3 requirements and compliance risks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Upload Section */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Upload Contract for Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload PDF contracts to automatically extract Section 3 requirements
                    </p>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleContractAnalysis(file)
                      }}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                </div>

                {/* Analysis Results */}
                <div className="space-y-4">
                  {contractAnalyses.map((analysis) => (
                    <div key={analysis.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{analysis.contractName}</h4>
                        <div className="flex items-center gap-2">
                          {analysis.analysisStatus === "analyzing" && (
                            <Badge variant="outline">
                              <Clock className="mr-1 h-3 w-3" />
                              Analyzing...
                            </Badge>
                          )}
                          {analysis.analysisStatus === "completed" && (
                            <Badge variant="default">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>

                      {analysis.analysisStatus === "analyzing" && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Analyzing contract...</span>
                            <span>75%</span>
                          </div>
                          <Progress value={75} className="w-full" />
                        </div>
                      )}

                      {analysis.analysisStatus === "completed" && (
                        <div className="space-y-4">
                          {/* Compliance Score */}
                          <div className="flex items-center justify-between p-3 bg-muted rounded">
                            <span className="font-medium">Compliance Score</span>
                            <div className="flex items-center gap-2">
                              <Progress value={analysis.complianceScore} className="w-20" />
                              <span className="font-bold">{analysis.complianceScore}%</span>
                            </div>
                          </div>

                          {/* Section 3 Requirements */}
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h5 className="font-medium">Section 3 Requirements</h5>
                              <div className="text-sm space-y-1">
                                <div>Threshold: {analysis.section3Requirements.threshold}%</div>
                                <div>
                                  Labor Hours: {analysis.section3Requirements.laborHourRequirement.toLocaleString()}
                                </div>
                                <div>
                                  Targeted Hiring:{" "}
                                  {analysis.section3Requirements.targetedHiring ? "Required" : "Not Required"}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h5 className="font-medium">Training Requirements</h5>
                              <div className="text-sm space-y-1">
                                {analysis.section3Requirements.trainingRequirements.map((req, idx) => (
                                  <div key={idx}>• {req}</div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Risk Factors */}
                          {analysis.riskFactors.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="font-medium text-orange-600">Risk Factors</h5>
                              <div className="text-sm space-y-1">
                                {analysis.riskFactors.map((risk, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                    {risk}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recommendations */}
                          {analysis.recommendations.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="font-medium text-green-600">Recommendations</h5>
                              <div className="text-sm space-y-1">
                                {analysis.recommendations.map((rec, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    {rec}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <Button size="sm">
                              <Download className="mr-2 h-4 w-4" />
                              Export Analysis
                            </Button>
                            <Button size="sm" variant="outline">
                              Create Project
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Configuration Tab */}
        <TabsContent value="ai-settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Email Classification Settings</CardTitle>
                <CardDescription>Configure AI models and thresholds for email processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
                  <Input id="confidence-threshold" type="number" min="0" max="1" step="0.01" defaultValue="0.85" />
                  <p className="text-xs text-muted-foreground">Minimum confidence required for automatic processing</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auto-response">Auto-Response</Label>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="auto-response" defaultChecked />
                    <Label htmlFor="auto-response" className="text-sm">
                      Enable automatic response generation
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="escalation-keywords">Escalation Keywords</Label>
                  <Textarea
                    id="escalation-keywords"
                    placeholder="urgent, deadline, legal, complaint"
                    defaultValue="urgent, deadline, legal, complaint, violation"
                  />
                  <p className="text-xs text-muted-foreground">Keywords that trigger manual review (comma-separated)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contract Analysis Settings</CardTitle>
                <CardDescription>Configure AI models for contract analysis and risk assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="analysis-depth">Analysis Depth</Label>
                  <select id="analysis-depth" className="w-full p-2 border rounded">
                    <option value="basic">Basic (Fast)</option>
                    <option value="standard" selected>
                      Standard (Recommended)
                    </option>
                    <option value="comprehensive">Comprehensive (Thorough)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk-sensitivity">Risk Sensitivity</Label>
                  <Input id="risk-sensitivity" type="range" min="1" max="10" defaultValue="7" />
                  <p className="text-xs text-muted-foreground">Higher values detect more potential risks</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auto-project-creation">Auto Project Creation</Label>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="auto-project-creation" />
                    <Label htmlFor="auto-project-creation" className="text-sm">
                      Automatically create projects from analyzed contracts
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI Model Configuration</CardTitle>
              <CardDescription>Advanced settings for AI model selection and performance tuning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email-model">Email Classification Model</Label>
                  <select id="email-model" className="w-full p-2 border rounded">
                    <option value="gpt-4o">GPT-4o (Recommended)</option>
                    <option value="gpt-4o-mini">GPT-4o Mini (Fast)</option>
                    <option value="claude-3">Claude 3 Sonnet</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract-model">Contract Analysis Model</Label>
                  <select id="contract-model" className="w-full p-2 border rounded">
                    <option value="gpt-4o">GPT-4o (Recommended)</option>
                    <option value="claude-3">Claude 3 Sonnet</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="response-model">Response Generation Model</Label>
                  <select id="response-model" className="w-full p-2 border rounded">
                    <option value="gpt-4o-mini">GPT-4o Mini (Fast)</option>
                    <option value="gpt-4o">GPT-4o (Quality)</option>
                    <option value="claude-3-haiku">Claude 3 Haiku</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button>Save Configuration</Button>
                <Button variant="outline">Test Models</Button>
                <Button variant="ghost">Reset to Defaults</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
