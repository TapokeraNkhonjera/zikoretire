"use client"

import { useState, useMemo, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useMLLearning } from "@/hooks/useMLLearning"
import MLFeedback from "./MLFeedback"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { AnalyticsData } from "@/types/analytics"
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChartIcon, 
  Target, 
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle
} from "lucide-react"

interface ComparisonData {
  simulations: AnalyticsData[]
  comparison: {
    overview: {
      totalSimulations: number
      averageProjectedSavings: number
      averageRsiScore: number
      averageMonthlyIncome: number
      savingsVariance: number
      rsiVariance: number
    }
    rankings: {
      highestProjectedSavings: {
        simulation: string
        value: number
        percentage: number
      }
      lowestProjectedSavings: {
        simulation: string
        value: number
        percentage: number
      }
      highestRsiScore: {
        simulation: string
        value: number
        percentage: number
      }
      lowestRsiScore: {
        simulation: string
        value: number
        percentage: number
      }
    }
    insights: Array<{
      type: string
      title: string
      description: string
      recommendation: string
    }>
  }
}

interface SimulationComparisonProps {
  simulations: AnalyticsData[]
}

// Helper function to determine ML analysis type
const getMLAnalysisType = (mode: "scenarios" | "simulations"): "ml_scenarios" | "ml_comparison" => {
  return mode === "scenarios" ? "ml_scenarios" : "ml_comparison"
}

export default function SimulationComparison({ simulations }: SimulationComparisonProps) {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const [comparisonMode, setComparisonMode] = useState<"scenarios" | "simulations">("simulations")
  const [selectedSimulations, setSelectedSimulations] = useState<string[]>([])
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
  const [mlAnalytics, setMlAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [mlLoading, setMlLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState<"all" | "high-performing" | "recent" | "priority">("all")
  const [sortBy, setSortBy] = useState<"name" | "created" | "rsi" | "savings">("created")

  // ML Learning hook
  const {
    trackClick,
    trackSimulationSelection,
    trackFilterApplication,
    trackSearchQuery,
    trackMLAnalyticsViewed,
    trackRecommendationAccepted,
    storeComparisonData,
    storeScenarioAnalysisData,
    startTracking,
    stopTracking,
    resetTracking
  } = useMLLearning()

  // Start tracking when component mounts
  useEffect(() => {
    startTracking()
    return () => stopTracking()
  }, [startTracking, stopTracking])

  // Track simulation selections
  useEffect(() => {
    if (selectedSimulations.length > 0) {
      trackSimulationSelection(selectedSimulations)
    }
  }, [selectedSimulations, trackSimulationSelection])

  // Track filter applications
  useEffect(() => {
    if (filterBy !== "all") {
      trackFilterApplication(filterBy)
    }
  }, [filterBy, trackFilterApplication])

  // Track search queries
  useEffect(() => {
    if (searchQuery) {
      trackSearchQuery(searchQuery)
    }
  }, [searchQuery, trackSearchQuery])

  // Filter and sort simulations
  const filteredAndSortedSimulations = useMemo(() => {
    let filtered = simulations

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(sim => 
        (sim.name && sim.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        sim.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    switch (filterBy) {
      case "high-performing":
        filtered = filtered.filter(sim => sim.result.rsiScore > 70)
        break
      case "recent":
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(sim => {
          // Note: This would need createdAt field in AnalyticsData
          return true // Placeholder - would need date field
        })
        break
      case "priority":
        // Note: This would need priority field in AnalyticsData
        break
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || '').localeCompare(b.name || '')
        case "rsi":
          return b.result.rsiScore - a.result.rsiScore
        case "savings":
          return b.result.projectedValue - a.result.projectedValue
        case "created":
        default:
          return 0 // Placeholder - would need date field
      }
    })

    return filtered
  }, [simulations, searchQuery, filterBy, sortBy])

  const availableSimulations = filteredAndSortedSimulations.filter(sim => !selectedSimulations.includes(sim.id))
  const canAddMore = selectedSimulations.length < 3 && availableSimulations.length > 0

  const fetchComparisonData = async () => {
    if (selectedSimulations.length < 2) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/simulation/comparison?userId=${userId}&simulationIds=${selectedSimulations.join(',')}`
      )
      const data = await response.json()
      
      if (data.success) {
        setComparisonData(data.data)
        
        // Store learning data for ML training
        await storeComparisonData(data.data, selectedSimulations, comparisonMode)
      }
    } catch (error) {
      console.error("Error fetching comparison data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMLAnalytics = async () => {
    if ((comparisonMode === "simulations" && selectedSimulations.length < 2) ||
        (comparisonMode === "scenarios" && selectedSimulations.length !== 1)) return

    setMlLoading(true)
    try {
      const analysisType = comparisonMode === "scenarios" ? "scenarios" : "comparison"
      const response = await fetch(
        `/api/simulation/ml-analytics?userId=${userId}&simulationIds=${selectedSimulations.join(',')}&type=${analysisType}`
      )
      const data = await response.json()
      
      if (data.success) {
        setMlAnalytics(data.data.mlAnalytics)
        trackMLAnalyticsViewed()
        
        // Store ML analytics learning data
        if (comparisonMode === "scenarios") {
          await storeScenarioAnalysisData(data.data.mlAnalytics, selectedSimulations[0])
        } else {
          await storeComparisonData(data.data.mlAnalytics, selectedSimulations, `ml_${comparisonMode}`)
        }
      }
    } catch (error) {
      console.error("Error fetching ML analytics:", error)
    } finally {
      setMlLoading(false)
    }
  }

  const addSimulation = (simulationId: string) => {
    if (selectedSimulations.length < 3) {
      setSelectedSimulations([...selectedSimulations, simulationId])
      trackClick()
    }
  }

  const removeSimulation = (simulationId: string) => {
    setSelectedSimulations(selectedSimulations.filter(id => id !== simulationId))
    setComparisonData(null)
    setMlAnalytics(null)
    trackClick()
  }

  const selectedSimulationData = useMemo(() => {
    return simulations.filter(sim => selectedSimulations.includes(sim.id))
  }, [simulations, selectedSimulations])

  // Generate chart data
  const projectedSavingsData = useMemo(() => {
    return selectedSimulationData.map(sim => ({
      name: sim.name || `Simulation ${sim.id.slice(-4)}`,
      projectedSavings: sim.result.projectedValue,
      monthlyIncome: sim.result.monthlyRetirementIncome || 0,
      rsiScore: sim.result.rsiScore,
    }))
  }, [selectedSimulationData])

  const rsiScoreData = useMemo(() => {
    return selectedSimulationData.map(sim => ({
      name: sim.name || `Simulation ${sim.id.slice(-4)}`,
      rsiScore: sim.result.rsiScore,
      riskScore: sim.result.riskScore || 0,
      confidenceScore: sim.result.confidenceScore || 0,
    }))
  }, [selectedSimulationData])

  const scenarioComparisonData = useMemo(() => {
    if (comparisonMode !== "scenarios" || selectedSimulationData.length !== 1) return []
    
    const sim = selectedSimulationData[0]
    return [
      {
        name: "Main Simulation",
        projectedSavings: sim.result.projectedValue,
        rsiScore: sim.result.rsiScore,
      },
      ...sim.scenarios.map(scenario => ({
        name: scenario.name,
        projectedSavings: scenario.result.projectedValue,
        rsiScore: scenario.result.rsiScore,
      }))
    ]
  }, [selectedSimulationData, comparisonMode])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Simulation Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="comparison-mode"
                checked={comparisonMode === "scenarios"}
                onCheckedChange={(checked) => {
                  setComparisonMode(checked ? "scenarios" : "simulations")
                  setSelectedSimulations([])
                  setComparisonData(null)
                }}
              />
              <Label htmlFor="comparison-mode">
                {comparisonMode === "scenarios" 
                  ? "Compare Simulation vs Scenarios" 
                  : "Compare Multiple Simulations"
                }
              </Label>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search simulations by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="high-performing">High RSI</SelectItem>
                      <SelectItem value="recent">Recent</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created">Created</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="rsi">RSI Score</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results count */}
              <div className="text-sm text-muted-foreground">
                Showing {availableSimulations.length} of {filteredAndSortedSimulations.length} simulations
                {searchQuery && ` matching "${searchQuery}"`}
              </div>
            </div>

            {/* Simulation Selection */}
            <div className="space-y-2">
              <Label>
                {comparisonMode === "scenarios" 
                  ? "Select Simulation to Compare with its Scenarios" 
                  : `Select Simulations to Compare (${selectedSimulations.length}/3)`
                }
              </Label>
              
              {comparisonMode === "simulations" && (
                <div className="flex flex-wrap gap-2">
                  {selectedSimulations.map(simId => {
                    const sim = simulations.find(s => s.id === simId)
                    return (
                      <Badge key={simId} variant="secondary" className="flex items-center gap-1">
                        {sim?.name || `Simulation ${simId.slice(-4)}`}
                        <button
                          onClick={() => removeSimulation(simId)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}

              {(canAddMore || (comparisonMode === "scenarios" && selectedSimulations.length === 0)) && (
                <Select onValueChange={addSimulation}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      comparisonMode === "scenarios"
                        ? "Select a simulation"
                        : "Add simulation to compare"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSimulations.map(sim => (
                      <SelectItem key={sim.id} value={sim.id}>
                        {sim.name || `Simulation ${sim.id.slice(-4)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {comparisonMode === "scenarios" && selectedSimulations.length === 1 && (
                <Button 
                  onClick={fetchMLAnalytics} 
                  disabled={mlLoading}
                  variant="outline"
                  className="w-full"
                >
                  {mlLoading ? "ML Analyzing..." : "Generate ML Scenario Analytics"}
                </Button>
              )}

              {comparisonMode === "simulations" && selectedSimulations.length >= 2 && (
                <div className="flex gap-2">
                  <Button 
                    onClick={fetchComparisonData} 
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Analyzing..." : "Compare Simulations"}
                  </Button>
                  <Button 
                    onClick={fetchMLAnalytics} 
                    disabled={mlLoading}
                    variant="outline"
                    className="flex-1"
                  >
                    {mlLoading ? "ML Analyzing..." : "ML Analytics"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {comparisonData && comparisonMode === "simulations" && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
            <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="ml-analytics" disabled={!mlAnalytics}>ML Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Simulations</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{comparisonData.comparison.overview.totalSimulations}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Projected Savings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    MWK {comparisonData.comparison.overview.averageProjectedSavings.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. RSI Score</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {comparisonData.comparison.overview.averageRsiScore.toFixed(1)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Savings Variance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    MWK {comparisonData.comparison.overview.savingsVariance.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rankings */}
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Projected Savings Rankings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Highest</span>
                    <div className="text-right">
                      <div className="font-medium">{comparisonData.comparison.rankings.highestProjectedSavings.simulation}</div>
                      <div className="text-sm text-green-600">
                        +{comparisonData.comparison.rankings.highestProjectedSavings.percentage}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Lowest</span>
                    <div className="text-right">
                      <div className="font-medium">{comparisonData.comparison.rankings.lowestProjectedSavings.simulation}</div>
                      <div className="text-sm text-red-600">
                        {comparisonData.comparison.rankings.lowestProjectedSavings.percentage}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">RSI Score Rankings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Highest</span>
                    <div className="text-right">
                      <div className="font-medium">{comparisonData.comparison.rankings.highestRsiScore.simulation}</div>
                      <div className="text-sm text-green-600">
                        +{comparisonData.comparison.rankings.highestRsiScore.percentage}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Lowest</span>
                    <div className="text-right">
                      <div className="font-medium">{comparisonData.comparison.rankings.lowestRsiScore.simulation}</div>
                      <div className="text-sm text-red-600">
                        {comparisonData.comparison.rankings.lowestRsiScore.percentage}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projections Tab */}
          <TabsContent value="projections">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Projected Savings Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={projectedSavingsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`MWK ${Number(value).toLocaleString()}`, 'Projected Savings']} />
                      <Bar dataKey="projectedSavings" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Retirement Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={projectedSavingsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`MWK ${Number(value).toLocaleString()}`, 'Monthly Income']} />
                      <Bar dataKey="monthlyIncome" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Risk Analysis Tab */}
          <TabsContent value="risks">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>RSI Score Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={rsiScoreData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="rsiScore" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk & Confidence Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={rsiScoreData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis />
                      <Radar name="RSI Score" dataKey="rsiScore" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Radar name="Risk Score" dataKey="riskScore" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <div className="space-y-4">
              {comparisonData.comparison.insights.map((insight, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {insight.type === 'savings_potential' && <TrendingUp className="h-5 w-5 text-green-600" />}
                      {insight.type === 'risk_assessment' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                      {insight.type === 'income_optimization' && <DollarSign className="h-5 w-5 text-blue-600" />}
                      {insight.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3">{insight.description}</p>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Recommendation:</p>
                      <p className="text-sm text-blue-700">{insight.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ML Analytics Tab */}
          <TabsContent value="ml-analytics">
            {mlAnalytics ? (
              <div className="space-y-6">
                {/* ML Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      ML-Powered Analytics Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {(mlAnalytics.summary?.confidenceLevel * 100 || 0).toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">ML Confidence Level</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {mlAnalytics.summary?.totalSimulations || selectedSimulations.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Simulations Analyzed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {mlAnalytics.insights?.performanceClusters?.distribution?.high || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">High Performers</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Clusters */}
                {mlAnalytics.insights?.performanceClusters && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Clusters</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-green-600">High Performers</span>
                            <Badge variant="secondary">{mlAnalytics.insights.performanceClusters.distribution.high}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Avg RSI: {mlAnalytics.insights.performanceClusters.characteristics.highPerformers.avgRsi.toFixed(1)}</div>
                            <div>Avg Savings: MWK {mlAnalytics.insights.performanceClusters.characteristics.highPerformers.avgSavings.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-yellow-600">Moderate Performers</span>
                            <Badge variant="secondary">{mlAnalytics.insights.performanceClusters.distribution.moderate}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Avg RSI: {mlAnalytics.insights.performanceClusters.characteristics.moderatePerformers.avgRsi.toFixed(1)}</div>
                            <div>Avg Savings: MWK {mlAnalytics.insights.performanceClusters.characteristics.moderatePerformers.avgSavings.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-red-600">Low Performers</span>
                            <Badge variant="secondary">{mlAnalytics.insights.performanceClusters.distribution.low}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Avg RSI: {mlAnalytics.insights.performanceClusters.characteristics.lowPerformers.avgRsi.toFixed(1)}</div>
                            <div>Avg Savings: MWK {mlAnalytics.insights.performanceClusters.characteristics.lowPerformers.avgSavings.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Risk Assessment */}
                {mlAnalytics.insights?.riskAssessment && (
                  <Card>
                    <CardHeader>
                      <CardTitle>ML Risk Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="text-center">
                            <div className="text-xl font-bold text-green-600">
                              {mlAnalytics.insights.riskAssessment.overallRiskDistribution.low}
                            </div>
                            <div className="text-sm text-muted-foreground">Low Risk</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-yellow-600">
                              {mlAnalytics.insights.riskAssessment.overallRiskDistribution.medium}
                            </div>
                            <div className="text-sm text-muted-foreground">Medium Risk</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-red-600">
                              {mlAnalytics.insights.riskAssessment.overallRiskDistribution.high}
                            </div>
                            <div className="text-sm text-muted-foreground">High Risk</div>
                          </div>
                        </div>
                        
                        {mlAnalytics.insights.riskAssessment.commonRiskFactors && (
                          <div>
                            <h4 className="font-medium mb-2">Common Risk Factors</h4>
                            <div className="flex flex-wrap gap-2">
                              {mlAnalytics.insights.riskAssessment.commonRiskFactors.map((factor: string, index: number) => (
                                <Badge key={index} variant="outline">{factor}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Optimization Opportunities */}
                {mlAnalytics.insights?.optimizationOpportunities && (
                  <Card>
                    <CardHeader>
                      <CardTitle>ML-Identified Optimization Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mlAnalytics.insights.optimizationOpportunities.opportunities.map((opp: any, index: number) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium capitalize">{opp.type.replace('_', ' ')}</span>
                              <Badge variant="secondary">{(opp.confidence * 100).toFixed(0)}% confidence</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{opp.potentialImprovement}</p>
                            <p className="text-sm font-medium text-green-600">
                              Estimated Impact: MWK {opp.estimatedImpact.toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Predictive Insights */}
                {mlAnalytics.insights?.predictiveInsights && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Predictive Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="text-center p-3 border rounded-lg">
                            <div className="text-lg font-bold text-green-600">
                              MWK {mlAnalytics.insights.predictiveInsights.aggregateForecast.bestCaseTotal.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Best Case</div>
                          </div>
                          <div className="text-center p-3 border rounded-lg">
                            <div className="text-lg font-bold text-blue-600">
                              MWK {mlAnalytics.insights.predictiveInsights.aggregateForecast.expectedTotal.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Expected</div>
                          </div>
                          <div className="text-center p-3 border rounded-lg">
                            <div className="text-lg font-bold text-red-600">
                              MWK {mlAnalytics.insights.predictiveInsights.aggregateForecast.worstCaseTotal.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Worst Case</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ML Recommendations */}
                {mlAnalytics.insights?.recommendations && (
                  <Card>
                    <CardHeader>
                      <CardTitle>ML-Powered Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mlAnalytics.insights.recommendations.personalizedRecommendations.map((simRec: any, index: number) => (
                          <div key={index} className="space-y-3">
                            <h4 className="font-medium">{simRec.simulationName}</h4>
                            <div className="space-y-2">
                              {simRec.recommendations.map((rec: any, recIndex: number) => (
                                <div key={recIndex} className="p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">{rec.title}</span>
                                    <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                                      {rec.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                                  <p className="text-sm"><strong>Action:</strong> {rec.action}</p>
                                  <p className="text-sm text-green-600"><strong>Expected Impact:</strong> {rec.expectedImpact}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    Click "ML Analytics" to generate machine learning insights
                  </p>
                </CardContent>
              </Card>
            )}

          {/* ML Feedback Component */}
          {mlAnalytics && (
            <MLFeedback 
              analysisType={getMLAnalysisType(comparisonMode)}
              analysisData={mlAnalytics}
              onFeedbackSubmitted={() => {
                // Track that feedback was submitted
                trackClick()
              }}
            />
          )}
          </TabsContent>
        </Tabs>
      )}

      {/* Scenario Comparison */}
      {comparisonMode === "scenarios" && selectedSimulationData.length === 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario vs Main Simulation Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={scenarioComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`MWK ${Number(value).toLocaleString()}`, 'Projected Savings']} />
                  <Bar dataKey="projectedSavings" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>RSI Score Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={scenarioComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="rsiScore" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={scenarioComparisonData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="projectedSavings"
                    >
                      {scenarioComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* ML Scenario Analytics */}
          {mlAnalytics && mlAnalytics.type === "scenarios" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    ML-Powered Scenario Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {(mlAnalytics.summary?.confidenceLevel * 100 || 0).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">ML Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {mlAnalytics.summary?.totalScenarios || scenarioComparisonData.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Scenarios Analyzed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {mlAnalytics.insights?.optimalStrategy?.name || "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">Optimal Strategy</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scenario Performance Analysis */}
              {mlAnalytics.insights?.scenarioPerformance && (
                <Card>
                  <CardHeader>
                    <CardTitle>ML Performance Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            {mlAnalytics.insights.scenarioPerformance.bestScenario.performanceScore.toFixed(1)}
                          </div>
                          <div className="text-sm text-muted-foreground">Best Performance Score</div>
                          <div className="text-xs text-muted-foreground">
                            {mlAnalytics.insights.scenarioPerformance.bestScenario.name}
                          </div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            {mlAnalytics.insights.scenarioPerformance.performanceSpread.average.toFixed(1)}
                          </div>
                          <div className="text-sm text-muted-foreground">Average Performance</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-lg font-bold text-yellow-600">
                            {(mlAnalytics.insights.scenarioPerformance.performanceSpread.highest - 
                              mlAnalytics.insights.scenarioPerformance.performanceSpread.lowest).toFixed(1)}
                          </div>
                          <div className="text-sm text-muted-foreground">Performance Spread</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Risk Variance Analysis */}
              {mlAnalytics.insights?.riskVariance && (
                <Card>
                  <CardHeader>
                    <CardTitle>ML Risk Variance Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-purple-600">
                            {mlAnalytics.insights.riskVariance.variance.toFixed(3)}
                          </div>
                          <div className="text-sm text-muted-foreground">Risk Variance</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-orange-600">
                            {mlAnalytics.insights.riskVariance.standardDeviation.toFixed(3)}
                          </div>
                          <div className="text-sm text-muted-foreground">Std Deviation</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">
                            {mlAnalytics.insights.riskVariance.riskDistribution.low}
                          </div>
                          <div className="text-sm text-muted-foreground">Low Risk</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-red-600">
                            {mlAnalytics.insights.riskVariance.riskDistribution.high}
                          </div>
                          <div className="text-sm text-muted-foreground">High Risk</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Optimal Strategy */}
              {mlAnalytics.insights?.optimalStrategy && (
                <Card>
                  <CardHeader>
                    <CardTitle>ML-Identified Optimal Strategy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">
                          Recommended: {mlAnalytics.insights.optimalStrategy.name}
                        </h4>
                        <div className="text-sm text-green-700 space-y-1">
                          <div>Overall Score: {mlAnalytics.insights.optimalStrategy.overallScore.toFixed(2)}</div>
                          <div>Projected Savings: MWK {mlAnalytics.insights.optimalStrategy.projectedSavings.toLocaleString()}</div>
                          <div>RSI Score: {mlAnalytics.insights.optimalStrategy.rsiScore.toFixed(1)}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ML Scenario Recommendations */}
              {mlAnalytics.insights?.recommendations && (
                <Card>
                  <CardHeader>
                    <CardTitle>ML Scenario Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mlAnalytics.insights.recommendations.strategyRecommendations.map((rec: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{rec.title}</span>
                            <Badge variant={rec.priority === 'high' ? 'destructive' : 'default'}>
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                          <p className="text-sm"><strong>Action:</strong> {rec.action}</p>
                          <p className="text-sm text-green-600"><strong>Expected Impact:</strong> {rec.expectedImpact}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
