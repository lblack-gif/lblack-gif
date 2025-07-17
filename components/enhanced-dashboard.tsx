"use client" 

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  LineChart,
  Line,
} from "recharts"
import {
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  Target,
  Award,
  Building2,
  AlertTriangle,
  FileBarChart,
  UserCheck,
  Calendar,
  BarChart3,
  Building,
  ClipboardCheck,
  UserCog,
} from "lucide-react"

export function EnhancedDashboard() {
  const [complianceData, setComplianceData] = useState({
    totalHours: 12450,
    section3Hours: 3890,
    targetedSection3Hours: 2340,
    section3Percentage: 31.2,
    targetedSection3Percentage: 18.8,
    requiredPercentage: 25,
    targetedRequiredPercentage: 15,
    totalWorkers: 156,
    section3Workers: 48,
    targetedSection3Workers: 29,
    activeProjects: 8,
    complianceStatus: "compliant",
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
      case "excellent":
        return "text-green-600"
      case "at-risk":
      case "good":
        return "text-yellow-600"
      case "non-compliant":
      case "needs-improvement":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
      case "excellent":
        return (
          <Badge className="bg-green-100 text-green-800">{status === "compliant" ? "Compliant" : "Excellent"}</Badge>
        )
      case "at-risk":
      case "good":
        return <Badge className="bg-yellow-100 text-yellow-800">{status === "at-risk" ? "At Risk" : "Good"}</Badge>
      case "non-compliant":
      case "needs-improvement":
        return (
          <Badge className="bg-red-100 text-red-800">
            {status === "non-compliant" ? "Non-Compliant" : "Needs Improvement"}
          </Badge>
        )
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={[
            { name: "Targeted Section 3", value: complianceData.targetedSection3Hours, fill: "#0d9488" },
            {
              name: "Section 3 (Non-Targeted)",
              value: complianceData.section3Hours - complianceData.targetedSection3Hours,
              fill: "#10b981",
            },
            {
              name: "Non-Section 3",
              value: complianceData.totalHours - complianceData.section3Hours,
              fill: "#6b7280",
            },
          ]}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label={({ name, percent }) =>
            percent !== undefined ? `${name}: ${(percent * 100).toFixed(1)}%` : `${name}`
          }
        />
        <Tooltip formatter={(value) => [value.toLocaleString(), "Hours"]} />
      </PieChart>
    </ResponsiveContainer>
  )
}
