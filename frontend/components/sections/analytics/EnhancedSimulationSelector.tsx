"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Calendar, TrendingUp, AlertTriangle } from "lucide-react"

interface AnalyticsData {
  id: string
  name: string
  result: {
    projectedValue: number
    estimatedMonthlyIncome: number
    rsiScore: number
    riskScore: number | null
    confidenceScore: number | null
  }
  scenarios: any[]
  recommendations: any[]
}

interface EnhancedSimulationSelectorProps {
  simulations: AnalyticsData[]
  selectedId: string
  onChange: (id: string) => void
  onFilterChange?: (filters: any) => void
}

export default function EnhancedSimulationSelector({ 
  simulations, 
  selectedId, 
  onChange, 
  onFilterChange 
}: EnhancedSimulationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState<"all" | "high-rsi" | "low-risk" | "recent" | "high-savings">("all")
  const [sortBy, setSortBy] = useState<"name" | "rsi" | "savings" | "risk" | "date">("date")

  // Filter and sort simulations
  const filteredAndSortedSimulations = useMemo(() => {
    let filtered = simulations

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(sim => 
        sim.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    switch (filterBy) {
      case "high-rsi":
        filtered = filtered.filter(sim => sim.result.rsiScore > 70)
        break
      case "low-risk":
        filtered = filtered.filter(sim => (sim.result.riskScore || 0) < 0.3)
        break
      case "recent":
        // Note: This would need createdAt field in AnalyticsData
        // For now, we'll use a placeholder
        break
      case "high-savings":
        filtered = filtered.filter(sim => sim.result.projectedValue > 1000000)
        break
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "rsi":
          return b.result.rsiScore - a.result.rsiScore
        case "savings":
          return b.result.projectedValue - a.result.projectedValue
        case "risk":
          return (a.result.riskScore || 0) - (b.result.riskScore || 0)
        case "date":
        default:
          return 0 // Placeholder - would need date field
      }
    })

    return filtered
  }, [simulations, searchQuery, filterBy, sortBy])

  const selectedSimulation = simulations.find(sim => sim.id === selectedId)

  // Notify parent of filter changes
  useState(() => {
    onFilterChange?.({
      searchQuery,
      filterBy,
      sortBy,
      resultCount: filteredAndSortedSimulations.length
    })
  })

  const getRSIColor = (rsi: number) => {
    if (rsi > 80) return "text-green-600 bg-green-50"
    if (rsi > 60) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getRiskColor = (risk: number | null) => {
    if (!risk) return "text-gray-600 bg-gray-50"
    if (risk < 0.3) return "text-green-600 bg-green-50"
    if (risk < 0.7) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return "MWK 0"
    return `MWK ${value.toLocaleString()}`
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Your Simulation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search simulations by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Simulations</SelectItem>
                    <SelectItem value="high-rsi">High RSI Score</SelectItem>
                    <SelectItem value="low-risk">Low Risk</SelectItem>
                    <SelectItem value="high-savings">High Savings</SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <SelectValue placeholder="Sort by..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date Created</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="rsi">RSI Score</SelectItem>
                    <SelectItem value="savings">Projected Savings</SelectItem>
                    <SelectItem value="risk">Risk Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredAndSortedSimulations.length} of {simulations.length} simulations
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Simulation Display */}
      {selectedSimulation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected Simulation</span>
              <Badge variant="outline">Active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-lg">{selectedSimulation.name}</h3>
                <p className="text-sm text-muted-foreground">ID: {selectedSimulation.id}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(selectedSimulation.result.projectedValue)}
                  </div>
                  <div className="text-xs text-muted-foreground">Projected Savings</div>
                </div>
                
                <div className="text-center p-3 border rounded-lg">
                  <div className={`text-lg font-bold ${getRSIColor(selectedSimulation.result.rsiScore).split(' ')[0]}`}>
                    {selectedSimulation.result.rsiScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">RSI Score</div>
                </div>
                
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(selectedSimulation.result.estimatedMonthlyIncome)}
                  </div>
                  <div className="text-xs text-muted-foreground">Monthly Income</div>
                </div>
                
                <div className="text-center p-3 border rounded-lg">
                  <div className={`text-lg font-bold ${getRiskColor(selectedSimulation.result.riskScore).split(' ')[0]}`}>
                    {selectedSimulation.result.riskScore ? 
                      `${(selectedSimulation.result.riskScore * 100).toFixed(0)}%` : 
                      "N/A"
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">Risk Level</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simulation List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Simulations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredAndSortedSimulations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>No simulations found matching your criteria.</p>
                <p className="text-sm">Try adjusting your search or filters.</p>
              </div>
            ) : (
              filteredAndSortedSimulations.map((simulation) => (
                <div
                  key={simulation.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedId === simulation.id
                      ? "border-blue-500 bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => onChange(simulation.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{simulation.name}</h3>
                    {selectedId === simulation.id && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="font-medium text-blue-600">
                        {formatCurrency(simulation.result.projectedValue)}
                      </div>
                      <div className="text-xs text-muted-foreground">Projected</div>
                    </div>
                    
                    <div>
                      <div className={`font-medium ${getRSIColor(simulation.result.rsiScore).split(' ')[0]}`}>
                        {simulation.result.rsiScore.toFixed(1)} RSI
                      </div>
                      <div className="text-xs text-muted-foreground">Readiness</div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-green-600">
                        {formatCurrency(simulation.result.estimatedMonthlyIncome)}
                      </div>
                      <div className="text-xs text-muted-foreground">Monthly</div>
                    </div>
                    
                    <div>
                      <div className={`font-medium ${getRiskColor(simulation.result.riskScore).split(' ')[0]}`}>
                        {simulation.result.riskScore ? 
                          `${(simulation.result.riskScore * 100).toFixed(0)}%` : 
                          "Low"
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">Risk</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {simulation.scenarios.length} scenarios
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {simulation.recommendations.length} recommendations
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
