import { type NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"
import { supabase } from "@/lib/supabase"
import { config } from "@/lib/config"

const openai = new OpenAI({
  apiKey: config.ai.openaiApiKey,
})

export async function POST(request: NextRequest) {
  try {
    const { emailContent, sender, subject } = await request.json()

    if (!emailContent) {
      return NextResponse.json({ error: "Email content is required" }, { status: 400 })
    }

    // AI Classification Prompt
    const classificationPrompt = `
You are an AI assistant specialized in Section 3 compliance for HUD housing projects. 
Analyze the following email and classify it according to these categories:

CATEGORIES:
1. worker_inquiry - Questions about Section 3 worker opportunities
2. contractor_registration - Contractor wanting to register for Section 3 compliance
3. compliance_question - Questions about Section 3 requirements and compliance
4. document_submission - Submitting documents for verification or compliance
5. training_request - Requesting training on Section 3 requirements
6. audit_inquiry - Questions about audits or compliance reviews
7. general_inquiry - General questions not fitting other categories
8. complaint - Complaints about Section 3 compliance or discrimination

EMAIL DETAILS:
Subject: ${subject}
Sender: ${sender}
Content: ${emailContent}

Respond with a JSON object containing:
{
  "category": "category_name",
  "confidence": 0.95,
  "priority": "high|medium|low",
  "section3_related": true|false,
  "requires_human_review": true|false,
  "suggested_response": "Brief suggested response",
  "key_topics": ["topic1", "topic2"],
  "action_items": ["action1", "action2"]
}
`

    const classificationResponse = await openai.chat.completions.create({
      model: config.ai.model,
      messages: [{ role: "user", content: classificationPrompt }],
      temperature: config.ai.temperature,
      max_tokens: 1000,
    })

    const classificationResult = JSON.parse(classificationResponse.choices[0].message.content || "{}")

    // Generate detailed response if needed
    let detailedResponse = ""
    if (classificationResult.section3_related && !classificationResult.requires_human_review) {
      const responsePrompt = `
Generate a professional, helpful response to this Section 3 compliance email:

Subject: ${subject}
Sender: ${sender}
Content: ${emailContent}
Category: ${classificationResult.category}

The response should:
- Be professional and helpful
- Provide accurate Section 3 information
- Include relevant resources or next steps
- Be concise but comprehensive
- Include contact information for follow-up

Generate only the email response content, no additional formatting.
`

      const responseGeneration = await openai.chat.completions.create({
        model: config.ai.model,
        messages: [{ role: "user", content: responsePrompt }],
        temperature: 0.3,
        max_tokens: 1500,
      })

      detailedResponse = responseGeneration.choices[0].message.content || ""
    }

    // Store the email processing result
    const { data: emailRecord, error } = await supabase
      .from("email_triage")
      .insert({
        sender_email: sender,
        subject: subject,
        content: emailContent,
        classification: classificationResult.category,
        confidence_score: classificationResult.confidence,
        priority: classificationResult.priority,
        section3_related: classificationResult.section3_related,
        requires_human_review: classificationResult.requires_human_review,
        ai_suggested_response: detailedResponse,
        key_topics: classificationResult.key_topics,
        action_items: classificationResult.action_items,
        status: classificationResult.requires_human_review ? "pending_review" : "processed",
        processed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error storing email record:", error)
      return NextResponse.json({ error: "Failed to store email record" }, { status: 500 })
    }

    // Update AI metrics
    await supabase.from("ai_metrics").insert({
      operation_type: "email_classification",
      model_used: config.ai.model,
      confidence_score: classificationResult.confidence,
      processing_time: Date.now(), // This would be calculated properly in production
      tokens_used: classificationResponse.usage?.total_tokens || 0,
      success: true,
    })

    return NextResponse.json({
      classification: classificationResult,
      suggested_response: detailedResponse,
      email_id: emailRecord.id,
      requires_human_review: classificationResult.requires_human_review,
    })
  } catch (error) {
    console.error("AI Processing Error:", error)

    // Log the error
    await supabase.from("ai_metrics").insert({
      operation_type: "email_classification",
      model_used: config.ai.model,
      success: false,
      error_message: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.json({ error: "Failed to process email" }, { status: 500 })
  }
}
