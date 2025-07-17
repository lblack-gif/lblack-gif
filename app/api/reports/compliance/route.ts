import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { config } from "@/lib/config"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const projectId = searchParams.get("project_id")
    const format = searchParams.get("format") || "json"

    // Build date filter
    let dateFilter = ""
    if (startDate && endDate) {
      dateFilter = `AND created_at BETWEEN '${startDate}' AND '${endDate}'`
    }

    // Build project filter
    let projectFilter = ""
    if (projectId) {
      projectFilter = `AND project_id = '${projectId}'`
    }

    // Get comprehensive compliance data
    const queries = await Promise.all([
      // Overall project statistics
      supabase
        .from("projects")
        .select(`
        id, name, total_budget, section3_budget, status,
        labor_hours(total_hours, section3_hours, targeted_section3_hours)
      `),

      // Worker statistics
      supabase
        .from("workers")
        .select(`
        id, is_section3_worker, is_targeted_section3_worker, verification_status,
        worker_employment_history(total_hours_worked, hourly_rate)
      `),

      // Contractor performance
      supabase
        .from("contractor_registrations")
        .select(`
        id, company_name, section3_status,
        contractor_kpis(section3_compliance_rate, total_section3_hires)
      `),

      // Recent compliance alerts
      supabase
        .from("compliance_alerts")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(10),

      // Training completion rates
      supabase
        .from("worker_training_records")
        .select(`
        status, training_type,
        workers(is_section3_worker)
      `),
    ])

    const [projectsData, workersData, contractorsData, alertsData, trainingData] = queries

    // Calculate compliance metrics
    const totalWorkers = workersData.data?.length || 0
    const section3Workers = workersData.data?.filter((w) => w.is_section3_worker).length || 0
    const targetedSection3Workers = workersData.data?.filter((w) => w.is_targeted_section3_worker).length || 0
    const verifiedWorkers = workersData.data?.filter((w) => w.verification_status === "verified").length || 0

    const totalProjects = projectsData.data?.length || 0
    const activeProjects = projectsData.data?.filter((p) => p.status === "active").length || 0
    const completedProjects = projectsData.data?.filter((p) => p.status === "completed").length || 0

    const totalContractors = contractorsData.data?.length || 0
    const compliantContractors = contractorsData.data?.filter((c) => c.section3_status === "compliant").length || 0

    // Calculate total labor hours and Section 3 hours
    let totalLaborHours = 0
    let totalSection3Hours = 0
    let totalTargetedSection3Hours = 0

    projectsData.data?.forEach((project) => {
      project.labor_hours?.forEach((lh: any) => {
        totalLaborHours += lh.total_hours || 0
        totalSection3Hours += lh.section3_hours || 0
        totalTargetedSection3Hours += lh.targeted_section3_hours || 0
      })
    })

    // Calculate compliance rates
    const section3ComplianceRate = totalLaborHours > 0 ? (totalSection3Hours / totalLaborHours) * 100 : 0
    const targetedSection3Rate = totalLaborHours > 0 ? (totalTargetedSection3Hours / totalLaborHours) * 100 : 0

    // Training completion rates
    const totalTrainingRecords = trainingData.data?.length || 0
    const completedTraining = trainingData.data?.filter((t) => t.status === "completed").length || 0
    const trainingCompletionRate = totalTrainingRecords > 0 ? (completedTraining / totalTrainingRecords) * 100 : 0

    // Compliance status determination
    const isCompliant = section3ComplianceRate >= config.compliance.section3Threshold * 100
    const meetsTargetedGoal = targetedSection3Rate >= config.compliance.targetedSection3Threshold * 100

    const complianceReport = {
      report_metadata: {
        generated_at: new Date().toISOString(),
        report_period: {
          start_date: startDate,
          end_date: endDate,
        },
        report_type: "comprehensive_compliance",
        version: "1.0",
      },
      executive_summary: {
        overall_compliance_status: isCompliant ? "compliant" : "non_compliant",
        section3_compliance_rate: Math.round(section3ComplianceRate * 100) / 100,
        targeted_section3_rate: Math.round(targetedSection3Rate * 100) / 100,
        meets_section3_requirement: isCompliant,
        meets_targeted_goal: meetsTargetedGoal,
        total_active_projects: activeProjects,
        total_registered_workers: totalWorkers,
        compliance_risk_level: section3ComplianceRate < 20 ? "high" : section3ComplianceRate < 23 ? "medium" : "low",
      },
      project_statistics: {
        total_projects: totalProjects,
        active_projects: activeProjects,
        completed_projects: completedProjects,
        total_labor_hours: totalLaborHours,
        section3_labor_hours: totalSection3Hours,
        targeted_section3_hours: totalTargetedSection3Hours,
      },
      worker_statistics: {
        total_workers: totalWorkers,
        section3_workers: section3Workers,
        targeted_section3_workers: targetedSection3Workers,
        verified_workers: verifiedWorkers,
        pending_verification: totalWorkers - verifiedWorkers,
        section3_worker_percentage: totalWorkers > 0 ? Math.round((section3Workers / totalWorkers) * 10000) / 100 : 0,
      },
      contractor_statistics: {
        total_contractors: totalContractors,
        compliant_contractors: compliantContractors,
        contractor_compliance_rate:
          totalContractors > 0 ? Math.round((compliantContractors / totalContractors) * 10000) / 100 : 0,
      },
      training_statistics: {
        total_training_records: totalTrainingRecords,
        completed_training: completedTraining,
        training_completion_rate: Math.round(trainingCompletionRate * 100) / 100,
      },
      compliance_alerts: {
        active_alerts: alertsData.data?.length || 0,
        recent_alerts: alertsData.data || [],
      },
      recommendations: generateRecommendations(section3ComplianceRate, targetedSection3Rate, alertsData.data || []),
    }

    // Store report generation in audit log
    await supabase.from("audit_logs").insert({
      table_name: "reports",
      action: "GENERATE",
      new_values: {
        report_type: "compliance",
        generated_by: "system",
        parameters: { startDate, endDate, projectId },
      },
      changed_by: "00000000-0000-0000-0000-000000000000",
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
    })

    if (format === "pdf") {
      // In production, this would generate a PDF report
      return NextResponse.json({ message: "PDF generation not implemented in demo" }, { status: 501 })
    }

    return NextResponse.json(complianceReport)
  } catch (error) {
    console.error("Report Generation Error:", error)
    return NextResponse.json({ error: "Failed to generate compliance report" }, { status: 500 })
  }
}

function generateRecommendations(section3Rate: number, targetedRate: number, alerts: any[]) {
  const recommendations = []

  if (section3Rate < 25) {
    recommendations.push({
      priority: "high",
      category: "compliance",
      title: "Increase Section 3 Worker Hiring",
      description: `Current Section 3 compliance rate is ${section3Rate.toFixed(1)}%, below the required 25% threshold.`,
      action_items: [
        "Review current hiring practices with contractors",
        "Increase outreach to Section 3 worker databases",
        "Provide additional training to contractors on Section 3 requirements",
      ],
    })
  }

  if (targetedRate < 5) {
    recommendations.push({
      priority: "medium",
      category: "targeted_hiring",
      title: "Improve Targeted Section 3 Hiring",
      description: `Targeted Section 3 hiring rate is ${targetedRate.toFixed(1)}%, below the 5% goal.`,
      action_items: [
        "Partner with local workforce development agencies",
        "Implement targeted recruitment programs",
        "Offer apprenticeship and training programs",
      ],
    })
  }

  if (alerts.length > 5) {
    recommendations.push({
      priority: "medium",
      category: "monitoring",
      title: "Address Active Compliance Alerts",
      description: `There are ${alerts.length} active compliance alerts requiring attention.`,
      action_items: [
        "Review and resolve pending compliance alerts",
        "Implement proactive monitoring procedures",
        "Increase frequency of contractor check-ins",
      ],
    })
  }

  return recommendations
}
