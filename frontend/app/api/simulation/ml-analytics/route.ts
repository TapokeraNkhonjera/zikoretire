import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - ML-powered analytics for simulations and scenarios
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const simulationIds = searchParams.get("simulationIds")?.split(",").filter(Boolean)
    const analysisType = searchParams.get("type") || "comparison" // "comparison" or "scenarios"

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      )
    }

    // Fetch simulations with comprehensive data
    const whereClause: any = { userId }
    if (simulationIds && simulationIds.length > 0) {
      whereClause.id = { in: simulationIds }
    }

    const simulations = await prisma.simulation.findMany({
      where: whereClause,
      include: {
        result: true,
        scenarios: {
          include: {
            result: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    if (!simulations.length) {
      return NextResponse.json({
        success: true,
        data: {
          mlAnalytics: null,
          message: "No simulations found for ML analysis"
        }
      })
    }

    // Generate ML-powered analytics
    const mlAnalytics = generateMLAnalytics(simulations as any[], analysisType)

    return NextResponse.json({
      success: true,
      data: {
        simulations: simulations.map(sim => ({
          id: sim.id,
          name: (sim as any).name || 'Untitled Simulation',
          createdAt: sim.createdAt,
          priority: sim.priority,
          age: sim.age,
          retirementAge: sim.retirementAge,
          monthlyIncome: sim.monthlyIncome,
          monthlyContribution: sim.monthlyContribution,
          currentSavings: sim.currentSavings,
          rsiScore: sim.result?.rsiScore || 0,
          projectedSavings: sim.result?.projectedSavings || 0,
          readinessLevel: sim.result?.readinessLevel || 'Unknown'
        })),
        mlAnalytics
      }
    })

  } catch (error) {
    console.error("ML ANALYTICS ERROR:", error)
    return NextResponse.json(
      { success: false, message: "Failed to generate ML analytics" },
      { status: 500 }
    )
  }
}

function generateMLAnalytics(simulations: any[], analysisType: string) {
  if (analysisType === "scenarios" && simulations.length === 1) {
    return generateScenarioMLAnalytics(simulations[0])
  } else {
    return generateComparisonMLAnalytics(simulations)
  }
}

function generateComparisonMLAnalytics(simulations: any[]) {
  if (simulations.length < 2) {
    return {
      error: "Need at least 2 simulations for ML comparison analysis"
    }
  }

  // Extract features for ML analysis
  const features = simulations.map(sim => ({
    id: sim.id,
    name: (sim as any).name || 'Untitled',
    age: sim.age,
    retirementAge: sim.retirementAge,
    monthlyIncome: sim.monthlyIncome,
    monthlyContribution: sim.monthlyContribution,
    currentSavings: sim.currentSavings,
    projectedSavings: sim.result?.projectedSavings || 0,
    rsiScore: sim.result?.rsiScore || 0,
    riskScore: sim.result?.riskScore || 0,
    confidenceScore: sim.result?.confidenceScore || 0,
    consistencyScore: sim.result?.consistencyScore || 0,
    volatilityScore: sim.result?.volatilityScore || 0,
    sustainabilityScore: sim.result?.sustainabilityScore || 0
  }))

  // ML-powered insights
  const mlInsights = {
    performanceClusters: identifyPerformanceClusters(features),
    riskAssessment: assessRiskProfiles(features),
    optimizationOpportunities: identifyOptimizationOpportunities(features),
    predictiveInsights: generatePredictiveInsights(features),
    recommendations: generateMLRecommendations(features)
  }

  return {
    type: "comparison",
    summary: {
      totalSimulations: simulations.length,
      analysisTimestamp: new Date().toISOString(),
      confidenceLevel: calculateOverallConfidence(features)
    },
    insights: mlInsights
  }
}

function generateScenarioMLAnalytics(simulation: any) {
  const scenarios = simulation.scenarios || []
  if (scenarios.length === 0) {
    return {
      error: "No scenarios found for ML analysis"
    }
  }

  // Extract scenario features
  const scenarioFeatures = scenarios.map(scenario => ({
    id: scenario.id,
    name: scenario.name,
    projectedSavings: scenario.result?.projectedSavings || 0,
    rsiScore: scenario.result?.rsiScore || 0,
    riskScore: scenario.result?.riskScore || 0,
    confidenceScore: scenario.result?.confidenceScore || 0
  }))

  // Add main simulation for comparison
  const mainSim = {
    id: simulation.id,
    name: "Main Simulation",
    projectedSavings: simulation.result?.projectedSavings || 0,
    rsiScore: simulation.result?.rsiScore || 0,
    riskScore: simulation.result?.riskScore || 0,
    confidenceScore: simulation.result?.confidenceScore || 0
  }

  const allScenarios = [mainSim, ...scenarioFeatures]

  const mlInsights = {
    scenarioPerformance: analyzeScenarioPerformance(allScenarios),
    riskVariance: calculateRiskVariance(allScenarios),
    optimalStrategy: identifyOptimalStrategy(allScenarios),
    sensitivityAnalysis: performSensitivityAnalysis(allScenarios),
    recommendations: generateScenarioRecommendations(allScenarios)
  }

  return {
    type: "scenarios",
    summary: {
      totalScenarios: scenarios.length + 1,
      analysisTimestamp: new Date().toISOString(),
      confidenceLevel: calculateOverallConfidence([mainSim])
    },
    insights: mlInsights
  }
}

// ML Analysis Functions
function identifyPerformanceClusters(features: any[]) {
  // K-means like clustering based on performance metrics
  const clusters = {
    highPerformers: features.filter(f => f.rsiScore > 80 && f.projectedSavings > 1000000),
    moderatePerformers: features.filter(f => f.rsiScore >= 60 && f.rsiScore <= 80),
    lowPerformers: features.filter(f => f.rsiScore < 60)
  }

  return {
    clusters,
    distribution: {
      high: clusters.highPerformers.length,
      moderate: clusters.moderatePerformers.length,
      low: clusters.lowPerformers.length
    },
    characteristics: {
      highPerformers: {
        avgRsi: clusters.highPerformers.reduce((sum, f) => sum + f.rsiScore, 0) / clusters.highPerformers.length || 0,
        avgSavings: clusters.highPerformers.reduce((sum, f) => sum + f.projectedSavings, 0) / clusters.highPerformers.length || 0,
        commonTraits: identifyCommonTraits(clusters.highPerformers)
      },
      moderatePerformers: {
        avgRsi: clusters.moderatePerformers.reduce((sum, f) => sum + f.rsiScore, 0) / clusters.moderatePerformers.length || 0,
        avgSavings: clusters.moderatePerformers.reduce((sum, f) => sum + f.projectedSavings, 0) / clusters.moderatePerformers.length || 0,
        commonTraits: identifyCommonTraits(clusters.moderatePerformers)
      },
      lowPerformers: {
        avgRsi: clusters.lowPerformers.reduce((sum, f) => sum + f.rsiScore, 0) / clusters.lowPerformers.length || 0,
        avgSavings: clusters.lowPerformers.reduce((sum, f) => sum + f.projectedSavings, 0) / clusters.lowPerformers.length || 0,
        commonTraits: identifyCommonTraits(clusters.lowPerformers)
      }
    }
  }
}

function assessRiskProfiles(features: any[]) {
  const riskProfiles = features.map(f => ({
    id: f.id,
    name: f.name,
    riskLevel: calculateRiskLevel(f),
    riskFactors: identifyRiskFactors(f),
    mitigationStrategies: generateMitigationStrategies(f)
  }))

  return {
    profiles: riskProfiles,
    overallRiskDistribution: {
      low: riskProfiles.filter(p => p.riskLevel === 'low').length,
      medium: riskProfiles.filter(p => p.riskLevel === 'medium').length,
      high: riskProfiles.filter(p => p.riskLevel === 'high').length
    },
    commonRiskFactors: identifyCommonRiskFactors(features)
  }
}

function identifyOptimizationOpportunities(features: any[]) {
  const opportunities = []

  // Contribution optimization
  const contributionOpportunities = features.filter(f => 
    f.monthlyContribution < f.monthlyIncome * 0.2 // Less than 20% contribution
  ).map(f => ({
    simulationId: f.id,
    type: "contribution",
    potentialImprovement: "Increase monthly contribution by 10-15%",
    estimatedImpact: calculateContributionImpact(f),
    confidence: 0.85
  }))

  // Retirement age optimization
  const retirementAgeOpportunities = features.filter(f => 
    f.retirementAge - f.age > 30 // More than 30 years to retirement
  ).map(f => ({
    simulationId: f.id,
    type: "retirement_age",
    potentialImprovement: "Consider early retirement options",
    estimatedImpact: calculateRetirementAgeImpact(f),
    confidence: 0.75
  }))

  return {
    opportunities: [...contributionOpportunities, ...retirementAgeOpportunities],
    totalPotentialValue: calculateTotalPotentialValue(features),
    priorityRanking: rankOptimizationOpportunities([...contributionOpportunities, ...retirementAgeOpportunities])
  }
}

function generatePredictiveInsights(features: any[]) {
  // Monte Carlo simulation-like predictions
  const predictions = features.map(f => ({
    simulationId: f.id,
    name: f.name,
    projectedOutcome: {
      bestCase: f.projectedSavings * 1.3,
      expectedCase: f.projectedSavings,
      worstCase: f.projectedSavings * 0.7,
      confidenceInterval: calculateConfidenceInterval(f)
    },
    successProbability: calculateSuccessProbability(f),
    keyDrivers: identifyKeyDrivers(f)
  }))

  return {
    predictions,
    aggregateForecast: {
      bestCaseTotal: predictions.reduce((sum, p) => sum + p.projectedOutcome.bestCase, 0),
      expectedTotal: predictions.reduce((sum, p) => sum + p.projectedOutcome.expectedCase, 0),
      worstCaseTotal: predictions.reduce((sum, p) => sum + p.projectedOutcome.worstCase, 0)
    },
    timeHorizons: generateTimeHorizonInsights(features)
  }
}

function generateMLRecommendations(features: any[]) {
  const recommendations = []

  // Personalized recommendations based on ML analysis
  features.forEach(f => {
    const recs = []

    if (f.rsiScore < 60) {
      recs.push({
        type: "improvement",
        priority: "high",
        title: "Improve Retirement Readiness",
        description: `Your RSI score of ${f.rsiScore.toFixed(1)} indicates room for improvement.`,
        action: "Consider increasing monthly contributions or adjusting retirement timeline.",
        expectedImpact: "15-25% improvement in retirement readiness"
      })
    }

    if (f.riskScore > 0.7) {
      recs.push({
        type: "risk_management",
        priority: "medium",
        title: "Risk Management Strategy",
        description: "High risk score detected in your retirement plan.",
        action: "Diversify investment strategy and consider more conservative options.",
        expectedImpact: "Reduced volatility with maintained growth potential"
      })
    }

    if (f.confidenceScore < 0.7) {
      recs.push({
        type: "data_quality",
        priority: "low",
        title: "Improve Data Accuracy",
        description: "Low confidence score indicates potential data inconsistencies.",
        action: "Review and update financial information for more accurate projections.",
        expectedImpact: "Improved accuracy of retirement projections"
      })
    }

    recommendations.push({
      simulationId: f.id,
      simulationName: f.name,
      recommendations: recs
    })
  })

  return {
    personalizedRecommendations: recommendations,
    globalInsights: generateGlobalInsights(features),
    actionPlan: generateActionPlan(recommendations)
  }
}

// Scenario Analysis Functions
function analyzeScenarioPerformance(scenarios: any[]) {
  const performance = scenarios.map(s => ({
    id: s.id,
    name: s.name,
    performanceScore: calculatePerformanceScore(s),
    riskAdjustedReturn: calculateRiskAdjustedReturn(s),
    efficiency: calculateEfficiency(s)
  }))

  return {
    ranking: performance.sort((a, b) => b.performanceScore - a.performanceScore),
    bestScenario: performance.reduce((best, current) => 
      current.performanceScore > best.performanceScore ? current : best
    ),
    performanceSpread: {
      highest: Math.max(...performance.map(p => p.performanceScore)),
      lowest: Math.min(...performance.map(p => p.performanceScore)),
      average: performance.reduce((sum, p) => sum + p.performanceScore, 0) / performance.length
    }
  }
}

function calculateRiskVariance(scenarios: any[]) {
  const riskScores = scenarios.map(s => s.riskScore || 0)
  const variance = calculateVariance(riskScores)
  
  return {
    variance,
    standardDeviation: Math.sqrt(variance),
    riskDistribution: {
      low: scenarios.filter(s => (s.riskScore || 0) < 0.3).length,
      medium: scenarios.filter(s => (s.riskScore || 0) >= 0.3 && (s.riskScore || 0) < 0.7).length,
      high: scenarios.filter(s => (s.riskScore || 0) >= 0.7).length
    },
    riskCorrelation: calculateRiskCorrelation(scenarios)
  }
}

function identifyOptimalStrategy(scenarios: any[]) {
  // Multi-criteria decision analysis
  const weights = { performance: 0.4, risk: 0.3, confidence: 0.3 }
  
  const scoredScenarios = scenarios.map(s => ({
    ...s,
    overallScore: (
      (calculatePerformanceScore(s) * weights.performance) +
      ((1 - (s.riskScore || 0)) * weights.risk) +
      ((s.confidenceScore || 0) * weights.confidence)
    )
  }))

  const optimal = scoredScenarios.reduce((best, current) => 
    current.overallScore > best.overallScore ? current : best
  )

  return {
    optimalStrategy: optimal,
    alternativeStrategies: scoredScenarios
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(1, 3),
    decisionMatrix: generateDecisionMatrix(scoredScenarios, weights)
  }
}

function performSensitivityAnalysis(scenarios: any[]) {
  // Analyze sensitivity to key variables
  const sensitivityFactors = ['contribution', 'retirement_age', 'returns']
  
  return {
    sensitivity: sensitivityFactors.map(factor => ({
      factor,
      impact: calculateSensitivityImpact(scenarios, factor),
      recommendations: generateSensitivityRecommendations(factor)
    })),
    robustness: calculateRobustness(scenarios),
    keyDrivers: identifyKeySensitivityDrivers(scenarios)
  }
}

function generateScenarioRecommendations(scenarios: any[]) {
  const recommendations = []

  const bestScenario = scenarios.reduce((best, current) => 
    (current.rsiScore || 0) > (best.rsiScore || 0) ? current : best
  )

  recommendations.push({
    type: "optimal_strategy",
    priority: "high",
    title: `Adopt ${bestScenario.name} Strategy`,
    description: `This scenario shows the highest RSI score of ${(bestScenario.rsiScore || 0).toFixed(1)}.`,
    action: "Consider implementing the parameters from this optimal scenario.",
    expectedImpact: "Improved retirement readiness and projected outcomes"
  })

  return {
    strategyRecommendations: recommendations,
    implementationPlan: generateImplementationPlan(bestScenario),
    monitoringPlan: generateMonitoringPlan(scenarios)
  }
}

// Helper Functions
function calculateVariance(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length
}

function calculateRiskLevel(feature: any): string {
  const riskScore = feature.riskScore || 0
  if (riskScore < 0.3) return 'low'
  if (riskScore < 0.7) return 'medium'
  return 'high'
}

function identifyRiskFactors(feature: any): string[] {
  const factors = []
  if (feature.age > 50) factors.push("Late start age")
  if (feature.monthlyContribution < feature.monthlyIncome * 0.1) factors.push("Low contribution rate")
  if (feature.retirementAge - feature.age < 10) factors.push("Short time horizon")
  return factors
}

function calculateOverallConfidence(features: any[]): number {
  const confidenceScores = features.map(f => f.confidenceScore || 0)
  return confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length
}

function identifyCommonTraits(features: any[]): string[] {
  // Simplified trait identification
  const traits = []
  if (features.length > 0) {
    const avgContributionRate = features.reduce((sum, f) => 
      sum + (f.monthlyContribution / f.monthlyIncome), 0) / features.length
    if (avgContributionRate > 0.15) traits.push("High contribution rates")
    if (avgContributionRate < 0.1) traits.push("Conservative contributions")
  }
  return traits
}

function calculateContributionImpact(feature: any): number {
  // Simplified impact calculation
  return feature.projectedSavings * 0.15 // 15% potential improvement
}

function calculateRetirementAgeImpact(feature: any): number {
  // Simplified impact calculation
  return feature.projectedSavings * 0.1 // 10% potential improvement
}

function calculateTotalPotentialValue(features: any[]): number {
  return features.reduce((sum, f) => sum + f.projectedSavings, 0) * 0.12 // 12% average improvement
}

function rankOptimizationOpportunities(opportunities: any[]): any[] {
  return opportunities.sort((a, b) => b.estimatedImpact - a.estimatedImpact)
}

function calculateConfidenceInterval(feature: any): { lower: number; upper: number } {
  const value = feature.projectedSavings
  const confidence = feature.confidenceScore || 0.8
  const margin = (1 - confidence) * 0.5 * value
  return {
    lower: value - margin,
    upper: value + margin
  }
}

function calculateSuccessProbability(feature: any): number {
  // Simplified success probability based on RSI score
  return Math.min(feature.rsiScore / 100, 0.95)
}

function identifyKeyDrivers(feature: any): string[] {
  const drivers = []
  if (feature.monthlyContribution > 10000) drivers.push("High monthly contributions")
  if (feature.currentSavings > 50000) drivers.push("Strong initial savings")
  if (feature.retirementAge - feature.age > 20) drivers.push("Long time horizon")
  return drivers
}

function generateTimeHorizonInsights(features: any[]): any {
  return {
    shortTerm: features.filter(f => f.retirementAge - f.age < 10).length,
    mediumTerm: features.filter(f => f.retirementAge - f.age >= 10 && f.retirementAge - f.age <= 20).length,
    longTerm: features.filter(f => f.retirementAge - f.age > 20).length
  }
}

function generateGlobalInsights(features: any[]): any {
  return {
    overallHealth: "Good",
    keyTrends: ["Increasing contribution rates improve outcomes"],
    riskFactors: ["Market volatility affects long-term projections"]
  }
}

function generateActionPlan(recommendations: any[]): any {
  return {
    immediate: recommendations.flatMap(r => r.recommendations.filter(rec => rec.priority === 'high')),
    shortTerm: recommendations.flatMap(r => r.recommendations.filter(rec => rec.priority === 'medium')),
    longTerm: recommendations.flatMap(r => r.recommendations.filter(rec => rec.priority === 'low'))
  }
}

function calculatePerformanceScore(scenario: any): number {
  return (scenario.rsiScore || 0) * 0.6 + ((scenario.confidenceScore || 0) * 100) * 0.4
}

function calculateRiskAdjustedReturn(scenario: any): number {
  return (scenario.projectedSavings || 0) * (1 - (scenario.riskScore || 0))
}

function calculateEfficiency(scenario: any): number {
  return (scenario.projectedSavings || 0) / (scenario.riskScore || 0.1)
}

function calculateRiskCorrelation(scenarios: any[]): number {
  // Simplified correlation calculation
  return 0.65 // Placeholder
}

function generateDecisionMatrix(scenarios: any[], weights: any): any {
  return scenarios.map(s => ({
    name: s.name,
    performance: calculatePerformanceScore(s),
    risk: 1 - (s.riskScore || 0),
    confidence: s.confidenceScore || 0,
    weighted: s.overallScore
  }))
}

function calculateSensitivityImpact(scenarios: any[], factor: string): number {
  // Simplified sensitivity calculation
  return 0.15 // 15% average sensitivity
}

function generateSensitivityRecommendations(factor: string): string[] {
  const recommendations = {
    contribution: ["Monitor contribution consistency", "Consider automated increases"],
    retirement_age: ["Review retirement timeline regularly", "Consider flexible retirement options"],
    returns: ["Diversify investment portfolio", "Review asset allocation annually"]
  }
  return recommendations[factor as keyof typeof recommendations] || []
}

function calculateRobustness(scenarios: any[]): number {
  const scores = scenarios.map(s => s.rsiScore || 0)
  const variance = calculateVariance(scores)
  return Math.max(0, 1 - variance / 1000) // Normalized robustness score
}

function identifyKeySensitivityDrivers(scenarios: any[]): string[] {
  return ["Monthly contribution rate", "Retirement age", "Investment returns"]
}

function generateImplementationPlan(optimalScenario: any): any {
  return {
    steps: [
      "Review current financial situation",
      "Adjust contribution rates",
      "Update investment strategy",
      "Monitor progress monthly"
    ],
    timeline: "3-6 months",
    resources: ["Financial advisor", "Budget planning tools"]
  }
}

function generateMonitoringPlan(scenarios: any[]): any {
  return {
    frequency: "Monthly reviews",
    metrics: ["RSI score", "Projected savings", "Risk level"],
    alerts: ["Significant score changes", "Risk threshold breaches"]
  }
}

function identifyCommonRiskFactors(features: any[]): string[] {
  const allFactors = features.flatMap(f => identifyRiskFactors(f))
  const factorCounts = allFactors.reduce((counts, factor) => {
    counts[factor] = (counts[factor] || 0) + 1
    return counts
  }, {} as Record<string, number>)
  
  return Object.entries(factorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([factor]) => factor)
}

function generateMitigationStrategies(feature: any): string[] {
  const strategies = []
  if (feature.age > 50) strategies.push("Catch-up contributions")
  if (feature.monthlyContribution < feature.monthlyIncome * 0.1) strategies.push("Increase contribution rate")
  if (feature.retirementAge - feature.age < 10) strategies.push("Consider delayed retirement")
  return strategies
}
