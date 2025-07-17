"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, TrendingUp, DollarSign, Clock, Users, FileText } from "lucide-react"

interface ROIInputs {
  annualProjects: number
  avgProjectBudget: number
  complianceStaffCount: number
  avgHourlyRate: number
  hoursPerReport: number
  reportsPerMonth: number
  penaltyRisk: number
  currentSoftwareCost: number
}

interface ROIResults {
  currentAnnualCost: number
  systemAnnualCost: number
  timeSavings: number
  costSavings: number
  riskReduction: number
  totalBenefit: number
  netROI: number
  paybackMonths: number
}

export function ROICalculator() {
  const [inputs, setInputs] = useState<ROIInputs>({
    annualProjects: 10,
    avgProjectBudget: 2000000,
    complianceStaffCount: 3,
    avgHourlyRate: 65,
    hoursPerReport: 40,
    reportsPerMonth: 8,
    penaltyRisk: 50000,
    currentSoftwareCost: 25000,
  })

  const [results, setResults] = useState<ROIResults>({
    currentAnnualCost: 0,
    systemAnnualCost: 0,
    timeSavings: 0,
    costSavings: 0,
    riskReduction: 0,
    totalBenefit: 0,
    netROI: 0,
    paybackMonths: 0,
  })

  useEffect(() => {
    calculateROI()
  }, [inputs])

  const calculateROI = () => {
    // Current annual costs
    const manualLaborCost =
      inputs.complianceStaffCount * inputs.avgHourlyRate * inputs.hoursPerReport * inputs.reportsPerMonth * 12
    const currentTotalCost = manualLaborCost + inputs.currentSoftwareCost + inputs.penaltyRisk * 0.1 // 10% probability of penalty

    // System costs (based on project volume and complexity)
    let systemAnnualCost = 50000 // Base enterprise plan
    if (inputs.annualProjects > 25) systemAnnualCost = 100000
    if (inputs.annualProjects > 50) systemAnnualCost = 150000
    if (inputs.avgProjectBudget > 5000000) systemAnnualCost *= 1.5

    // Time savings (78% automation rate)
    const automatedHours = inputs.hoursPerReport * 0.78
    const timeSavingsAnnual =
      automatedHours * inputs.reportsPerMonth * 12 * inputs.avgHourlyRate * inputs.complianceStaffCount

    // Risk reduction (90% reduction in penalty risk)
    const riskReduction = inputs.penaltyRisk * 0.9 * 0.1 // 90% reduction in 10% probability

    // Additional benefits
    const efficiencyGains = currentTotalCost * 0.15 // 15% additional efficiency
    const auditSavings = 25000 // Reduced audit preparation costs

    const totalBenefit = timeSavingsAnnual + riskReduction + efficiencyGains + auditSavings
    const netBenefit = totalBenefit - systemAnnualCost
    const roiPercentage = (netBenefit / systemAnnualCost) * 100
    const paybackMonths = systemAnnualCost / (totalBenefit / 12)

    setResults({
      currentAnnualCost: currentTotalCost,
      systemAnnualCost,
      timeSavings: timeSavingsAnnual,
      costSavings: netBenefit,
      riskReduction,
      totalBenefit,
      netROI: roiPercentage,
      paybackMonths,
    })
  }

  const updateInput = (field: keyof ROIInputs, value: number) => {
    setInputs({ ...inputs, [field]: value })
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(Math.round(num))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-6 w-6" />
        <h2 className="text-2xl font-bold">ROI Calculator</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Your Organization</CardTitle>
            <CardDescription>Enter your current compliance situation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Project Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Project Information
              </h3>

              <div className="space-y-2">
                <Label>Annual Projects</Label>
                <Input
                  type="number"
                  value={inputs.annualProjects}
                  onChange={(e) => updateInput("annualProjects", Number.parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label>Average Project Budget</Label>
                <Input
                  type="number"
                  value={inputs.avgProjectBudget}
                  onChange={(e) => updateInput("avgProjectBudget", Number.parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <Separator />

            {/* Staffing Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Compliance Staffing
              </h3>

              <div className="space-y-2">
                <Label>Compliance Staff Count</Label>
                <div className="px-3">
                  <Slider
                    value={[inputs.complianceStaffCount]}
                    onValueChange={(value) => updateInput("complianceStaffCount", value[0])}
                    max={20}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>1</span>
                    <span>{inputs.complianceStaffCount} staff</span>
                    <span>20</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Average Hourly Rate</Label>
                <Input
                  type="number"
                  value={inputs.avgHourlyRate}
                  onChange={(e) => updateInput("avgHourlyRate", Number.parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <Separator />

            {/* Reporting Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Current Process
              </h3>

              <div className="space-y-2">
                <Label>Hours per Report</Label>
                <div className="px-3">
                  <Slider
                    value={[inputs.hoursPerReport]}
                    onValueChange={(value) => updateInput("hoursPerReport", value[0])}
                    max={100}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>5h</span>
                    <span>{inputs.hoursPerReport} hours</span>
                    <span>100h</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reports per Month</Label>
                <Input
                  type="number"
                  value={inputs.reportsPerMonth}
                  onChange={(e) => updateInput("reportsPerMonth", Number.parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label>Annual Penalty Risk</Label>
                <Input
                  type="number"
                  value={inputs.penaltyRisk}
                  onChange={(e) => updateInput("penaltyRisk", Number.parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label>Current Software Cost (Annual)</Label>
                <Input
                  type="number"
                  value={inputs.currentSoftwareCost}
                  onChange={(e) => updateInput("currentSoftwareCost", Number.parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* ROI Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                ROI Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-600">
                    {results.netROI > 0 ? "+" : ""}
                    {formatNumber(results.netROI)}%
                  </div>
                  <p className="text-sm text-green-700 mt-1">Annual ROI</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{formatCurrency(results.costSavings)}</div>
                    <p className="text-xs text-blue-700">Annual Savings</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">{formatNumber(results.paybackMonths)} mo</div>
                    <p className="text-xs text-purple-700">Payback Period</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cost Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Annual Cost</span>
                <Badge variant="destructive">{formatCurrency(results.currentAnnualCost)}</Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">System Annual Cost</span>
                <Badge variant="outline">{formatCurrency(results.systemAnnualCost)}</Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Time Savings</span>
                  <span className="text-sm font-medium text-green-600">+{formatCurrency(results.timeSavings)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Risk Reduction</span>
                  <span className="text-sm font-medium text-green-600">+{formatCurrency(results.riskReduction)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Efficiency Gains</span>
                  <span className="text-sm font-medium text-green-600">
                    +{formatCurrency(results.totalBenefit - results.timeSavings - results.riskReduction)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center font-semibold">
                <span>Net Annual Benefit</span>
                <span className={results.costSavings > 0 ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(results.costSavings)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Key Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Key Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">78% reduction in manual processing time</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">90% reduction in compliance penalty risk</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">65% faster report generation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">85% reduction in data entry errors</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">Real-time compliance monitoring</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-sm">Automated HUD reporting integration</span>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="font-semibold">Ready to Get Started?</h3>
                <p className="text-sm text-muted-foreground">
                  Schedule a demo to see how our Section 3 Compliance System can transform your operations.
                </p>
                <div className="flex gap-2">
                  <Button className="flex-1">Schedule Demo</Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    Download Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
