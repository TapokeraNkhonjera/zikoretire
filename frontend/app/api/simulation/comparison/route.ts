import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Compare simulations and provide insights
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

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      )
    }

    // Fetch simulations to compare
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
          comparison: null,
          message: "No simulations found for comparison"
        }
      })
    }

    // Generate comparison insights
    const comparison = generateComparisonInsights(simulations as any[])

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
        comparison
      }
    })

  } catch (error) {
    console.error("SIMULATION COMPARISON ERROR:", error)
    return NextResponse.json(
      { success: false, message: "Failed to compare simulations" },
      { status: 500 }
    )
  }
}

function generateComparisonInsights(simulations: any[]) {
  if (simulations.length < 2) {
    return {
      comparison: null,
      message: "Need at least 2 simulations for comparison"
    }
  }

  // Sort by projected savings for comparison
  const sortedBySavings = [...simulations].sort((a, b) => 
    (b.result?.projectedSavings || 0) - (a.result?.projectedSavings || 0)
  )

  // Sort by RSI score for comparison
  const sortedByRsi = [...simulations].sort((a, b) => 
    (b.result?.rsiScore || 0) - (a.result?.rsiScore || 0)
  )

  // Find best and worst performers
  const bestSavings = sortedBySavings[sortedBySavings.length - 1]
  const worstSavings = sortedBySavings[0]
  const bestRsi = sortedByRsi[sortedByRsi.length - 1]
  const worstRsi = sortedByRsi[0]

  // Calculate variance and ranges
  const projectedSavings = simulations.map(sim => sim.result?.projectedSavings || 0)
  const rsiScores = simulations.map(sim => sim.result?.rsiScore || 0)
  const monthlyIncomes = simulations.map(sim => sim.monthlyIncome)

  const avgProjectedSavings = projectedSavings.reduce((sum, val) => sum + val, 0) / projectedSavings.length
  const avgRsiScore = rsiScores.reduce((sum, val) => sum + val, 0) / rsiScores.length
  const avgMonthlyIncome = monthlyIncomes.reduce((sum, val) => sum + val, 0) / monthlyIncomes.length

  const savingsVariance = calculateVariance(projectedSavings)
  const rsiVariance = calculateVariance(rsiScores)

  return {
    overview: {
      totalSimulations: simulations.length,
      averageProjectedSavings: Math.round(avgProjectedSavings),
      averageRsiScore: Math.round(avgRsiScore * 100) / 100,
      averageMonthlyIncome: Math.round(avgMonthlyIncome),
      savingsVariance: Math.round(savingsVariance),
      rsiVariance: Math.round(rsiVariance * 100) / 100
    },
    
    rankings: {
      highestProjectedSavings: {
        simulation: (bestSavings as any).name || 'Untitled',
        value: bestSavings.result?.projectedSavings || 0,
        percentage: Math.round(((bestSavings.result?.projectedSavings || 0) / avgProjectedSavings - 1) * 100)
      },
      lowestProjectedSavings: {
        simulation: (worstSavings as any).name || 'Untitled',
        value: worstSavings.result?.projectedSavings || 0,
        percentage: Math.round(((worstSavings.result?.projectedSavings || 0) / avgProjectedSavings - 1) * 100)
      },
      highestRsiScore: {
        simulation: (bestRsi as any).name || 'Untitled',
        value: bestRsi.result?.rsiScore || 0,
        percentage: Math.round(((bestRsi.result?.rsiScore || 0) / avgRsiScore - 1) * 100)
      },
      lowestRsiScore: {
        simulation: (worstRsi as any).name || 'Untitled',
        value: worstRsi.result?.rsiScore || 0,
        percentage: Math.round(((worstRsi.result?.rsiScore || 0) / avgRsiScore - 1) * 100)
      }
    },

    insights: [
      {
        type: 'savings_potential',
        title: 'Savings Potential Analysis',
        description: `Your best simulation shows ${Math.round(((bestSavings.result?.projectedSavings || 0) / avgProjectedSavings - 1) * 100)}% higher projected savings than average.`,
        recommendation: 'Consider applying the strategy from your best-performing simulation to your main planning.'
      },
      {
        type: 'risk_assessment',
        title: 'Risk Assessment',
        description: `RSI scores vary by ${Math.round(rsiVariance * 100)}% across simulations. Focus on strategies that consistently improve readiness scores.`,
        recommendation: 'Analyze factors contributing to higher RSI scores in your best-performing simulations.'
      },
      {
        type: 'income_optimization',
        title: 'Income Contribution Strategy',
        description: `Monthly contributions range from MWK ${Math.min(...monthlyIncomes).toLocaleString()} to MWK ${Math.max(...monthlyIncomes).toLocaleString()}. Consider optimizing your contribution strategy.`,
        recommendation: 'Higher monthly contributions significantly impact projected retirement savings.'
      }
    ]
  }
}

function calculateVariance(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length
  return variance
}
