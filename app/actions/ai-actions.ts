"use server"

import { generateText, streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { supabase } from "@/lib/supabase"

interface EmailClassificationRequest {
  subject: string
  body: string
  sender: string
  receivedAt: string
}

interface EmailClassificationResponse {
  classification: string
  priority: "low" | "medium" | "high"
  confidence: number
  suggestedResponse: string
  actionItems: string[]
  projectId?: string
}

interface ContractAnalysisRequest {
  contractText: string
  contractName: string
  projectType?: string
}

interface ContractAnalysisResponse {
  section3Requirements: {
    threshold: number
    laborHourRequirement: number
    targetedHiring: boolean
    trainingRequirements: string[]
  }
  riskFactors: string[]
  recommendations: string[]
  complianceScore: number
  keyProvisions: string[]
  deadlines: Array<{
    description: string
    date: string
    priority: string
  }>
}

export async function classifyEmail(request: EmailClassificationRequest): Promise<EmailClassificationResponse> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an expert Section 3 compliance assistant. Analyze emails and classify them according to HUD Section 3 requirements.

Classification categories:
- compliance_inquiry: Questions about Section 3 requirements
- deadline_alert: Urgent deadlines or time-sensitive matters
- training_request: Training or educational inquiries
- worker_verification: Worker eligibility or verification issues
- reporting_question: Questions about reporting requirements
- contract_review: Contract or project-related inquiries
- general_support: General support or administrative questions

Priority levels:
- high: Urgent deadlines, legal issues, compliance violations
- medium: Standard compliance questions, training requests
- low: General inquiries, administrative matters

Provide a professional, helpful response that addresses the inquiry while ensuring HUD Section 3 compliance.`,
      prompt: `Analyze this email and provide classification, priority, confidence score (0-1), and a suggested response.

Subject: ${request.subject}
From: ${request.sender}
Body: ${request.body}
Received: ${request.receivedAt}

Respond in JSON format with:
{
  "classification": "category",
  "priority": "low|medium|high",
  "confidence": 0.95,
  "suggestedResponse": "Professional response text",
  "actionItems": ["action1", "action2"],
  "projectId": "optional-project-id-if-identifiable"
}`,
    })

    const result = JSON.parse(text) as EmailClassificationResponse

    // Store the classification in the database
    const { error } = await supabase.from("emails").insert({
      sender_email: request.sender,
      subject: request.subject,
      body: request.body,
      received_at: request.receivedAt,
      classification: result.classification,
      priority: result.priority,
      status: "processed",
      ai_summary: result.suggestedResponse.substring(0, 500),
      project_id: result.projectId,
    })

    if (error) {
      console.error("Error storing email classification:", error)
    }

    return result
  } catch (error) {
    console.error("Error classifying email:", error)
    throw new Error("Failed to classify email")
  }
}

export async function analyzeContract(request: ContractAnalysisRequest): Promise<ContractAnalysisResponse> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an expert HUD Section 3 compliance analyst. Analyze contracts to identify Section 3 requirements, risks, and recommendations.

Section 3 Requirements:
- Projects over $200,000: 25% labor hour threshold OR 5% of total project labor hours
- Targeted Section 3 workers: Residents of public housing and Section 8 participants
- Training and employment opportunities for low-income residents
- Business opportunities for Section 3 business concerns

Key areas to analyze:
1. Project value and applicable thresholds
2. Labor hour requirements and calculations
3. Training and apprenticeship provisions
4. Targeted hiring requirements
5. Reporting and documentation requirements
6. Timeline and milestone constraints
7. Potential compliance risks
8. Recommended mitigation strategies

Provide specific, actionable recommendations for ensuring compliance.`,
      prompt: `Analyze this contract for Section 3 compliance requirements and provide detailed analysis.

Contract Name: ${request.contractName}
Project Type: ${request.projectType || "Not specified"}

Contract Text:
${request.contractText}

Respond in JSON format with:
{
  "section3Requirements": {
    "threshold": 25,
    "laborHourRequirement": 2500,
    "targetedHiring": true,
    "trainingRequirements": ["requirement1", "requirement2"]
  },
  "riskFactors": ["risk1", "risk2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "complianceScore": 85,
  "keyProvisions": ["provision1", "provision2"],
  "deadlines": [
    {
      "description": "Section 3 plan submission",
      "date": "2024-03-01",
      "priority": "high"
    }
  ]
}`,
    })

    const result = JSON.parse(text) as ContractAnalysisResponse

    // Store the analysis in the database
    const { error } = await supabase.from("contract_analyses").insert({
      contract_name: request.contractName,
      analysis_status: "completed",
      section3_requirements: result.section3Requirements,
      risk_factors: result.riskFactors,
      recommendations: result.recommendations,
      compliance_score: result.complianceScore,
      key_provisions: result.keyProvisions,
      deadlines: result.deadlines,
    })

    if (error) {
      console.error("Error storing contract analysis:", error)
    }

    return result
  } catch (error) {
    console.error("Error analyzing contract:", error)
    throw new Error("Failed to analyze contract")
  }
}

export async function generateComplianceReport(projectId: string, reportType: string) {
  try {
    // Fetch project data
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select(`
        *,
        contractors(*),
        labor_hours(*),
        workers(*)
      `)
      .eq("id", projectId)
      .single()

    if (projectError || !project) {
      throw new Error("Project not found")
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an expert HUD Section 3 compliance report generator. Create comprehensive, professional reports that meet HUD requirements.

Report should include:
1. Executive Summary
2. Project Overview
3. Section 3 Performance Metrics
4. Worker Demographics and Hiring
5. Training and Development Activities
6. Business Opportunities Created
7. Challenges and Mitigation Strategies
8. Compliance Status and Recommendations
9. Supporting Documentation References

Use professional language and ensure all HUD reporting requirements are met.`,
      prompt: `Generate a ${reportType} compliance report for this project:

Project: ${project.name}
HUD Project ID: ${project.hud_project_id}
Contractor: ${project.contractors?.name}
Total Budget: $${project.total_budget?.toLocaleString()}
Project Period: ${project.start_date} to ${project.end_date}

Labor Hours Data: ${JSON.stringify(project.labor_hours)}
Worker Data: ${JSON.stringify(project.workers)}

Create a comprehensive report that demonstrates Section 3 compliance and performance.`,
    })

    return {
      reportContent: text,
      generatedAt: new Date().toISOString(),
      projectId,
      reportType,
    }
  } catch (error) {
    console.error("Error generating compliance report:", error)
    throw new Error("Failed to generate compliance report")
  }
}

export async function streamComplianceChat(messages: Array<{ role: string; content: string }>) {
  const result = streamText({
    model: openai("gpt-4o"),
    system: `You are a helpful Section 3 compliance assistant. You help users understand HUD Section 3 requirements, navigate compliance processes, and solve compliance challenges.

Key areas of expertise:
- Section 3 worker eligibility and verification
- Labor hour tracking and threshold calculations
- Reporting requirements and deadlines
- Training and employment opportunities
- Business development for Section 3 enterprises
- Geographic eligibility and service areas
- Good faith compliance strategies

Always provide accurate, helpful information based on current HUD guidelines and regulations.`,
    messages,
  })

  return result.toDataStreamResponse()
}
