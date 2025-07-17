"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
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
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp, DollarSign, Target, AlertCircle, CheckCircle, Building2, Zap, Shield, Globe } from "lucide-react"

export function BusinessIntelligence() {
  const [marketData] = useState({
    totalAddressableMarket: 500000000, // $500M
    servicableMarket: 150000000, // $150M
    currentMarketShare: 0.001, // 0.1%
    targetMarketShare: 0.05, // 5%
    competitorCount: 12,
    marketGrowthRate: 0.12, // 12% annually
  })

  const [revenueProjections] = useState([
    { year: "2024", revenue: 500000, customers: 50, arr: 500000 },
    { year: "2025", revenue: 2000000, customers: 150, arr: 2000000 },
    { year: "2026", revenue: 5000000, customers: 300, arr: 5000000 },
    { year: "2027", revenue: 12000000, customers: 600, arr: 12000000 },
    { year: "2028", revenue: 25000000, customers: 1000, arr: 25000000 },
  ])

  const [customerSegments] = useState([
    {
      name: "Large Housing Authorities",
      size: 50,
      avgRevenue: 36000,
      totalRevenue: 1800000,
      growthRate: 0.15,
      acquisitionCost: 5000,
      lifetimeValue: 180000,
    },
    {
      name: "Mid-Size Housing Authorities",
      size: 200,
      avgRevenue: 12000,
      totalRevenue: 2400000,
      growthRate: 0.25,
      acquisitionCost: 2000,
      lifetimeValue: 60000,
    },
    {
      name: "General Contractors",
      size: 1000,
      avgRevenue: 6000,
      totalRevenue: 6000000,
      growthRate: 0.35,
      acquisitionCost: 800,
      lifetimeValue: 30000,
    },
  ])

  const [competitiveAnalysis] = useState([
    {
      name: "Our Solution",
      marketShare: 0.1,
      features: 95,
      pricing: 85,
      customerSat: 92,
      aiCapability: 95,
      integration: 90,
    },
    {
      name: "Legacy Provider A",
      marketShare: 15,
      features: 70,
      pricing: 60,
      customerSat: 75,
      aiCapability: 20,
      integration: 65,
    },
    {
      name: "Legacy Provider B",
      marketShare: 12,
      features: 65,
      pricing: 70,
      customerSat: 70,
      aiCapability: 15,
      integration: 60,
    },
    {
      name: "New Entrant C",
      marketShare: 2,
      features: 80,
      pricing: 90,
      customerSat: 85,
      aiCapability: 75,
      integration: 70,
    },
  ])

  const [valuationMetrics] = useState({
    currentValuation: 5000000, // $5M
    targetValuation: 50000000, // $50M
    revenueMultiple: 10,
    growthRate: 0.45,
    burnRate: 150000, // Monthly
    runway: 24, // Months
    fundingNeeded: 5000000, // $5M Series A
  })

  const [riskFactors] = useState([
    {
      category: "Market Risk",
      risk: "Regulatory Changes",
      probability: 0.3,
      impact: 0.8,
      mitigation: "Close HUD relationships and rapid adaptation",
      status: "monitored",
    },
    {
      category: "Competitive Risk",
      risk: "Large Tech Entry",
      probability: 0.4,
      impact: 0.7,
      mitigation: "First-mover advantage and customer lock-in",
      status: "active",
    },
    {
      category: "Execution Risk",
      risk: "Talent Acquisition",
      probability: 0.6,
      impact: 0.6,
      mitigation: "Competitive packages and remote work",
      status: "active",
    },
    {
      category: "Financial Risk",
      risk: "Funding Delays",
      probability: 0.3,
      impact: 0.9,
      mitigation: "Multiple funding sources and revenue focus",
      status: "monitored",
    },
  ])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value.toLocaleString()}`
  }

  const getRiskColor = (probability: number, impact: number) => {
    const riskScore = probability * impact
    if (riskScore >= 0.6) return "text-red-600"
    if (riskScore >= 0.3) return "text-yellow-600"
    return "text-green-600"
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Intelligence Dashboard</h1>
          <p className="text-gray-600 mt-1">Strategic insights and market analysis for IP valuation</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">Market Ready</Badge>
          <Badge className="bg-blue-100 text-blue-800">High Growth Potential</Badge>
        </div>
      </div>

      {/* Key Valuation Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Valuation</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(valuationMetrics.currentValuation)}</div>
            <p className="text-xs text-gray-600 mt-1">Based on current metrics</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Valuation</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(valuationMetrics.targetValuation)}</div>
            <p className="text-xs text-gray-600 mt-1">3-year projection</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Opportunity</CardTitle>
            <Globe className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(marketData.totalAddressableMarket)}
            </div>
            <p className="text-xs text-gray-600 mt-1">Total addressable market</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{(valuationMetrics.growthRate * 100).toFixed(0)}%</div>
            <p className="text-xs text-gray-600 mt-1">Annual revenue growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="revenue-projections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="revenue-projections">Revenue</TabsTrigger>
          <TabsTrigger value="market-analysis">Market</TabsTrigger>
          <TabsTrigger value="customer-segments">Customers</TabsTrigger>
          <TabsTrigger value="competitive-analysis">Competition</TabsTrigger>
          <TabsTrigger value="valuation-model">Valuation</TabsTrigger>
          <TabsTrigger value="risk-analysis">Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue-projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Projections</CardTitle>
              <CardDescription>5-year revenue and customer growth forecast</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueProjections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Year 1 Target</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-bold">{formatCurrency(revenueProjections[0].revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customers:</span>
                    <span className="font-bold">{revenueProjections[0].customers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ARR:</span>
                    <span className="font-bold">{formatCurrency(revenueProjections[0].arr)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Year 3 Target</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-bold">{formatCurrency(revenueProjections[2].revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customers:</span>
                    <span className="font-bold">{revenueProjections[2].customers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ARR:</span>
                    <span className="font-bold">{formatCurrency(revenueProjections[2].arr)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Year 5 Target</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-bold">{formatCurrency(revenueProjections[4].revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customers:</span>
                    <span className="font-bold">{revenueProjections[4].customers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ARR:</span>
                    <span className="font-bold">{formatCurrency(revenueProjections[4].arr)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="market-analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Size Analysis</CardTitle>
                <CardDescription>Total addressable and serviceable market</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Total Addressable Market</span>
                      <span className="font-bold">{formatCurrency(marketData.totalAddressableMarket)}</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Serviceable Market</span>
                      <span className="font-bold">{formatCurrency(marketData.servicableMarket)}</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Current Market Share</span>
                      <span className="font-bold">{(marketData.currentMarketShare * 100).toFixed(2)}%</span>
                    </div>
                    <Progress value={marketData.currentMarketShare * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Target Market Share</span>
                      <span className="font-bold">{(marketData.targetMarketShare * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={marketData.targetMarketShare * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Dynamics</CardTitle>
                <CardDescription>Growth drivers and market trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Market Growth Rate</div>
                      <div className="text-sm text-gray-600">
                        {(marketData.marketGrowthRate * 100).toFixed(0)}% annually
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Active Competitors</div>
                      <div className="text-sm text-gray-600">{marketData.competitorCount} direct competitors</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">Technology Disruption</div>
                      <div className="text-sm text-gray-600">AI automation creating new opportunities</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="font-medium">Regulatory Environment</div>
                      <div className="text-sm text-gray-600">Increasing compliance requirements</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customer-segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segment Analysis</CardTitle>
              <CardDescription>Revenue potential and characteristics by customer type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {customerSegments.map((segment, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-lg">{segment.name}</h3>
                      <Badge className="bg-blue-100 text-blue-800">
                        {(segment.growthRate * 100).toFixed(0)}% Growth
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Market Size</div>
                        <div className="text-lg font-bold">{segment.size.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Avg Revenue</div>
                        <div className="text-lg font-bold">{formatCurrency(segment.avgRevenue)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">CAC</div>
                        <div className="text-lg font-bold">{formatCurrency(segment.acquisitionCost)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">LTV</div>
                        <div className="text-lg font-bold">{formatCurrency(segment.lifetimeValue)}</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between mb-2">
                        <span>LTV/CAC Ratio</span>
                        <span className="font-bold">
                          {(segment.lifetimeValue / segment.acquisitionCost).toFixed(1)}x
                        </span>
                      </div>
                      <Progress
                        value={Math.min((segment.lifetimeValue / segment.acquisitionCost) * 10, 100)}
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitive-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Competitive Positioning</CardTitle>
              <CardDescription>Feature comparison and market positioning analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={competitiveAnalysis} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="features" fill="#8884d8" name="Features" />
                  <Bar dataKey="aiCapability" fill="#82ca9d" name="AI Capability" />
                  <Bar dataKey="customerSat" fill="#ffc658" name="Customer Satisfaction" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Competitive Advantages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>95% AI automation capability</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Government-native design</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Real-time HUD integration</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Mobile-first architecture</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>End-to-end compliance platform</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Share Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={competitiveAnalysis}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="marketShare"
                      nameKey="name"
                    >
                      {competitiveAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "Market Share"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="valuation-model" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Valuation Components</CardTitle>
                <CardDescription>Key factors driving IP valuation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Revenue Multiple</span>
                      <span className="font-bold">{valuationMetrics.revenueMultiple}x</span>
                    </div>
                    <div className="text-sm text-gray-600">Based on SaaS industry standards</div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Growth Premium</span>
                      <span className="font-bold">+25%</span>
                    </div>
                    <div className="text-sm text-gray-600">High growth rate bonus</div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Market Position</span>
                      <span className="font-bold">+15%</span>
                    </div>
                    <div className="text-sm text-gray-600">First-mover advantage</div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Technology Moat</span>
                      <span className="font-bold">+20%</span>
                    </div>
                    <div className="text-sm text-gray-600">AI and integration barriers</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Funding Requirements</CardTitle>
                <CardDescription>Capital needs for growth execution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Series A Target</span>
                      <span className="font-bold">{formatCurrency(valuationMetrics.fundingNeeded)}</span>
                    </div>
                    <div className="text-sm text-gray-600">18-24 month runway</div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Current Burn Rate</span>
                      <span className="font-bold">{formatCurrency(valuationMetrics.burnRate)}/mo</span>
                    </div>
                    <div className="text-sm text-gray-600">Monthly operating expenses</div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Runway Remaining</span>
                      <span className="font-bold">{valuationMetrics.runway} months</span>
                    </div>
                    <div className="text-sm text-gray-600">At current burn rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Valuation Scenarios</CardTitle>
              <CardDescription>Different valuation outcomes based on execution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">Conservative</div>
                    <div className="text-2xl font-bold mt-2">$10M - $25M</div>
                    <div className="text-sm text-gray-600 mt-2">Slower growth, limited market penetration</div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">Base Case</div>
                    <div className="text-2xl font-bold mt-2">$25M - $75M</div>
                    <div className="text-sm text-gray-600 mt-2">Planned execution, market leadership</div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">Optimistic</div>
                    <div className="text-2xl font-bold mt-2">$75M - $200M</div>
                    <div className="text-sm text-gray-600 mt-2">Rapid expansion, market dominance</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment Matrix</CardTitle>
              <CardDescription>Key risks and mitigation strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskFactors.map((risk, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className={`h-5 w-5 ${getRiskColor(risk.probability, risk.impact)}`} />
                        <div>
                          <div className="font-medium">{risk.risk}</div>
                          <div className="text-sm text-gray-600">{risk.category}</div>
                        </div>
                      </div>
                      <Badge
                        className={
                          risk.status === "active" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {risk.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-gray-600">Probability</div>
                        <Progress value={risk.probability * 100} className="h-2 mt-1" />
                        <div className="text-xs text-gray-500">{(risk.probability * 100).toFixed(0)}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Impact</div>
                        <Progress value={risk.impact * 100} className="h-2 mt-1" />
                        <div className="text-xs text-gray-500">{(risk.impact * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Mitigation Strategy:</div>
                      <div className="text-sm text-gray-600">{risk.mitigation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Action Items</CardTitle>
          <CardDescription>Next steps to maximize IP value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button className="h-auto p-4 text-left justify-start bg-transparent" variant="outline">
              <div>
                <div className="font-medium">Secure Pilot Customers</div>
                <div className="text-sm text-gray-600">Target 5-10 housing authorities</div>
              </div>
            </Button>
            <Button className="h-auto p-4 text-left justify-start bg-transparent" variant="outline">
              <div>
                <div className="font-medium">File Patent Applications</div>
                <div className="text-sm text-gray-600">Protect AI algorithms and methods</div>
              </div>
            </Button>
            <Button className="h-auto p-4 text-left justify-start bg-transparent" variant="outline">
              <div>
                <div className="font-medium">Prepare Series A</div>
                <div className="text-sm text-gray-600">Raise $5M growth capital</div>
              </div>
            </Button>
            <Button className="h-auto p-4 text-left justify-start bg-transparent" variant="outline">
              <div>
                <div className="font-medium">Build Sales Team</div>
                <div className="text-sm text-gray-600">Hire government sales specialists</div>
              </div>
            </Button>
            <Button className="h-auto p-4 text-left justify-start bg-transparent" variant="outline">
              <div>
                <div className="font-medium">Develop Partnerships</div>
                <div className="text-sm text-gray-600">Partner with HUD vendors</div>
              </div>
            </Button>
            <Button className="h-auto p-4 text-left justify-start bg-transparent" variant="outline">
              <div>
                <div className="font-medium">Market Validation</div>
                <div className="text-sm text-gray-600">Prove product-market fit</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
