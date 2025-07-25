"use client"

import { useState } from "react"
import { EnhancedDashboard } from "@/components/enhanced-dashboard"
import { EmailTriage } from "@/components/email-triage"
import { LaborHoursTracker } from "@/components/labor-hours-tracker"
import { Button } from "@/components/ui/button"
import { NotificationSystem } from "@/components/notification-system"
import { SystemMonitoring } from "@/components/system-monitoring"
import {
  LayoutDashboard,
  Mail,
  Clock,
  FileText,
  Users,
  MapPin,
  Link,
  Smartphone,
  Shield,
  BookOpen,
  Brain,
  Bell,
  Activity,
  ClipboardCheck,
  TrendingUp,
  Building2,
  UserCheck,
  BarChart3,
  FileBarChart,
  Zap,
} from "lucide-react"
import { AutomatedReporting } from "@/components/automated-reporting"
import { PayrollIntegration } from "@/components/payroll-integration"
import { GeographicMapping } from "@/components/geographic-mapping"
import { QualitativeReporting } from "@/components/qualitative-reporting"
import { ContractorManagement } from "@/components/contractor-management"
import { AuditAccountability } from "@/components/audit-accountability"
import { MobileInterface } from "@/components/mobile-interface"
import { SecurityManagement } from "@/components/security-management"
import { HudIntegration } from "@/components/hud-integration"
import { TrainingSupport } from "@/components/training-support"
import { AIIntegration } from "@/components/ai-integration"
import { WorkerManagement } from "@/components/worker-management"
import { ComprehensiveReporting } from "@/components/comprehensive-reporting"
import { PerformanceDashboard } from "@/components/performance-dashboard"
import { getConfigStatus } from "@/lib/config"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Info } from "lucide-react"

type ActiveView =
  | "overview"
  | "project-compliance"
  | "workers"
  | "contractor-performance"
  | "notifications"
  | "email-triage"
  | "labor-hours"
  | "comprehensive-reports"
  | "automated-reports"
  | "qualitative-reports"
  | "performance-analytics"
  | "ai-integration"
  | "payroll-integration"
  | "hud-integration"
  | "geographic-mapping"
  | "system-monitoring"
  | "security-management"
  | "audit-accountability"
  | "mobile-interface"
  | "training-support"

// Organized navigation with logical grouping and enhanced visual hierarchy
const navigation = [
  // Core Overview & Dashboard
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    category: "core",
    description: "Main dashboard and system overview",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    category: "core",
    description: "System alerts and updates",
  },

  // Primary Compliance Features
  {
    id: "project-compliance",
    label: "Project Compliance Tracking",
    icon: ClipboardCheck,
    category: "compliance",
    description: "Track project compliance status",
  },
  {
    id: "email-triage",
    label: "Email Triage",
    icon: Mail,
    category: "compliance",
    description: "Automated email processing",
  },
  {
    id: "labor-hours",
    label: "Labor Hours Tracking",
    icon: Clock,
    category: "compliance",
    description: "Monitor labor hour requirements",
  },

  // Management Features
  {
    id: "workers",
    label: "Workers",
    icon: Users,
    category: "management",
    description: "Worker management and tracking",
  },
  {
    id: "contractor-performance",
    label: "Contractor Performance",
    icon: TrendingUp,
    category: "management",
    description: "Contractor performance metrics",
  },

  // Reporting & Analytics
  {
    id: "comprehensive-reports",
    label: "Comprehensive Reports",
    icon: FileBarChart,
    category: "reporting",
    description: "Detailed compliance reports",
  },
  {
    id: "automated-reports",
    label: "Automated Reports",
    icon: Zap,
    category: "reporting",
    description: "Scheduled report generation",
  },
  {
    id: "qualitative-reports",
    label: "Qualitative Reports",
    icon: FileText,
    category: "reporting",
    description: "Qualitative analysis reports",
  },
  {
    id: "performance-analytics",
    label: "Performance Analytics",
    icon: BarChart3,
    category: "reporting",
    description: "Advanced performance metrics",
  },

  // Integration & AI
  {
    id: "ai-integration",
    label: "AI Integration",
    icon: Brain,
    category: "integration",
    description: "AI-powered compliance assistance",
  },
  {
    id: "payroll-integration",
    label: "Payroll Integration",
    icon: Link,
    category: "integration",
    description: "Payroll system connectivity",
  },
  {
    id: "hud-integration",
    label: "HUD Integration",
    icon: Building2,
    category: "integration",
    description: "HUD system integration",
  },
  {
    id: "geographic-mapping",
    label: "Geographic Mapping",
    icon: MapPin,
    category: "integration",
    description: "Location-based tracking",
  },

  // System Administration
  {
    id: "system-monitoring",
    label: "System Monitoring",
    icon: Activity,
    category: "admin",
    description: "System health and performance",
  },
  {
    id: "security-management",
    label: "Security Management",
    icon: Shield,
    category: "admin",
    description: "Security settings and access control",
  },
  {
    id: "audit-accountability",
    label: "Audit & Accountability",
    icon: UserCheck,
    category: "admin",
    description: "Audit trails and accountability",
  },
  {
    id: "mobile-interface",
    label: "Mobile Interface",
    icon: Smartphone,
    category: "admin",
    description: "Mobile app configuration",
  },
  {
    id: "training-support",
    label: "Training & Support",
    icon: BookOpen,
    category: "admin",
    description: "Training resources and support",
  },
]

// Color schemes for different categories
const getCategoryColors = (category: string, isActive: boolean) => {
  if (isActive) {
    return "bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-md"
  }

  switch (category) {
    case "core":
      return "text-slate-700 hover:bg-blue-500 hover:text-white hover:border-l-4 hover:border-l-blue-600 transition-all duration-200"
    case "compliance":
      return "text-slate-700 hover:bg-green-500 hover:text-white hover:border-l-4 hover:border-l-green-600 transition-all duration-200"
    case "management":
      return "text-slate-700 hover:bg-purple-500 hover:text-white hover:border-l-4 hover:border-l-purple-600 transition-all duration-200"
    case "reporting":
      return "text-slate-700 hover:bg-orange-500 hover:text-white hover:border-l-4 hover:border-l-orange-600 transition-all duration-200"
    case "integration":
      return "text-slate-700 hover:bg-teal-500 hover:text-white hover:border-l-4 hover:border-l-teal-600 transition-all duration-200"
    case "admin":
      return "text-slate-700 hover:bg-gray-500 hover:text-white hover:border-l-4 hover:border-l-gray-600 transition-all duration-200"
    default:
      return "text-slate-700 hover:bg-slate-500 hover:text-white hover:border-l-4 hover:border-l-slate-600 transition-all duration-200"
  }
}

export default function HomePage() {
  const [activeView, setActiveView] = useState<ActiveView>("overview")
  const configStatus = getConfigStatus()

  const renderActiveView = () => {
    switch (activeView) {
      case "overview":
        return <EnhancedDashboard />
      case "notifications":
        return <NotificationSystem />
      case "project-compliance":
        return <SystemMonitoring />
      case "performance-analytics":
        return <PerformanceDashboard />
      case "ai-integration":
        return <AIIntegration />
      case "email-triage":
        return <EmailTriage />
      case "labor-hours":
        return <LaborHoursTracker />
      case "payroll-integration":
        return <PayrollIntegration />
      case "geographic-mapping":
        return <GeographicMapping />
      case "automated-reports":
        return <AutomatedReporting />
      case "qualitative-reports":
        return <QualitativeReporting />
      case "contractor-performance":
        return <ContractorManagement />
      case "audit-accountability":
        return <AuditAccountability />
      case "mobile-interface":
        return <MobileInterface />
      case "security-management":
        return <SecurityManagement />
      case "hud-integration":
        return <HudIntegration />
      case "training-support":
        return <TrainingSupport />
      case "workers":
        return <WorkerManagement />
      case "comprehensive-reports":
        return <ComprehensiveReporting />
      case "system-monitoring":
        return <SystemMonitoring />
      default:
        return <EnhancedDashboard />
    }
  }

  // Group navigation items by category for better visual organization
  const groupedNavigation = navigation.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, typeof navigation>,
  )

  const categoryLabels = {
    core: "Core Dashboard",
    compliance: "Compliance Tracking",
    management: "Management",
    reporting: "Reports & Analytics",
    integration: "Integrations",
    admin: "Administration",
  }

  return (
    <div className="min-h-screen bg-background">
      {configStatus.isDemoMode && (
        <Alert className="m-4 border-amber-200 bg-amber-50">
          <Info className="h-4 w-4" />
          <AlertTitle>Demo Mode</AlertTitle>
          <AlertDescription>
            The application is running in demo mode with sample data. Configure your Supabase environment variables to
            connect to a real database.
          </AlertDescription>
        </Alert>
      )}

      {!configStatus.supabase.hasValidUrl && configStatus.supabase.url && (
        <Alert className="m-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Invalid Supabase URL</AlertTitle>
          <AlertDescription>
            The NEXT_PUBLIC_SUPABASE_URL environment variable contains an invalid URL format:{" "}
            {configStatus.supabase.url}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex">
        {/* Enhanced Sidebar */}
        <div className="w-72 bg-white shadow-lg border-r border-slate-200 p-4 overflow-y-auto">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Rapid Compliance</h1>
              </div>
            </div>
            <p className="text-sm text-slate-600 ml-13">Section 3 Management System</p>
          </div>

          <nav className="space-y-6">
            {Object.entries(categoryLabels).map(([category, label]) => (
              <div key={category} className="space-y-1">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-1">{label}</h3>
                <div className="space-y-1">
                  {groupedNavigation[category]?.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeView === item.id ? "default" : "ghost"}
                      className={`w-full justify-start text-sm h-11 px-3 ${getCategoryColors(
                        item.category,
                        activeView === item.id,
                      )}`}
                      onClick={() => setActiveView(item.id as ActiveView)}
                      title={item.description}
                    >
                      <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-full">
            {renderActiveView()}
          </div>
        </div>
      </div>
    </div>
  )
}
