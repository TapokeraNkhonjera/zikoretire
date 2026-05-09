import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Get comprehensive simulation analytics for a user
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

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      )
    }

    // Fetch all simulations with results and scenarios
    const simulations = await prisma.simulation.findMany({
      where: { userId },
      include: {
        result: true,
        scenarios: {
          include: {
            result: true
          }
        },
        recommendations: true,
        notifications: true
      },
      orderBy: { createdAt: "desc" }
    })

    if (!simulations.length) {
      return NextResponse.json({
        success: true,
        data: {
          totalSimulations: 0,
          prioritySimulation: null,
          analytics: null
        }
      })
    }

    // Identify priority simulation
    const prioritySimulation = simulations.find(sim => sim.priority === true)

    // Calculate comprehensive analytics
    const analytics = {
      // Overview metrics
      totalSimulations: simulations.length,
      prioritySimulation: prioritySimulation ? {
        id: prioritySimulation.id,
        name: prioritySimulation.name,
        createdAt: prioritySimulation.createdAt,
        rsiScore: prioritySimulation.result?.rsiScore,
        projectedSavings: prioritySimulation.result?.projectedSavings,
        monthlyIncome: prioritySimulation.monthlyIncome
      } : null,

      // Financial insights
      financialMetrics: {
        totalProjectedSavings: simulations.reduce((sum, sim) => 
          sum + (sim.result?.projectedSavings || 0), 0),
        averageMonthlyIncome: simulations.reduce((sum, sim, _, arr) => 
          sum + sim.monthlyIncome, 0) / arr.length,
        totalCurrentSavings: simulations.reduce((sum, sim) => 
          sum + (sim.currentSavings || 0), 0),
        averageRsiScore: simulations.reduce((sum, sim) => 
          sum + (sim.result?.rsiScore || 0), 0) / simulations.filter(s => s.result?.rsiScore).length
      },

      // Scenario analysis
      scenarioAnalysis: {
        totalScenarios: simulations.reduce((sum, sim) => sum + sim.scenarios.length, 0),
        averageScenariosPerSimulation: simulations.reduce((sum, sim) => 
          sum + sim.scenarios.length, 0) / simulations.length,
        scenarioTypes: simulations.flatMap(sim => 
          sim.scenarios.map(s => s.scenarioType).filter(Boolean)
        ).reduce((acc, type, _, arr) => {
          acc[type] = (acc[type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      },

      // Timeline analysis
      timelineAnalysis: {
        firstSimulation: simulations[simulations.length - 1],
        lastSimulation: simulations[0],
        averageDaysBetweenSimulations: simulations.length > 1 ? 
          Math.round((new Date(simulations[0].createdAt).getTime() - 
          new Date(simulations[simulations.length - 1].createdAt).getTime()) / 
          (1000 * 60 * 60 * 24) / (simulations.length - 1)) : 0
      },

      // Performance trends
      performanceTrends: {
        rsiTrend: calculateRsiTrend(simulations),
        savingsTrend: calculateSavingsTrend(simulations),
        incomeTrend: calculateIncomeTrend(simulations)
      }
    }

    return NextResponse.json({
      success: true,
      data: analytics
    })

  } catch (error) {
    console.error("SIMULATION ANALYTICS ERROR:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch simulation analytics" },
      { status: 500 }
    )
  }
}

// Helper functions for trend analysis
function calculateRsiTrend(simulations: any[]): 'improving' | 'stable' | 'declining' {
  if (simulations.length < 2) return 'stable'
  
  const recentSimulations = simulations.slice(0, Math.min(5, simulations.length))
  const rsiScores = recentSimulations
    .filter(sim => sim.result?.rsiScore)
    .map(sim => sim.result.rsiScore)
  
  if (rsiScores.length < 2) return 'stable'
  
  const firstHalf = rsiScores.slice(0, Math.floor(rsiScores.length / 2))
  const secondHalf = rsiScores.slice(Math.floor(rsiScores.length / 2))
  
  const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length
  
  if (secondAvg > firstAvg + 5) return 'improving'
  if (secondAvg < firstAvg - 5) return 'declining'
  return 'stable'
}

function calculateSavingsTrend(simulations: any[]): 'increasing' | 'stable' | 'decreasing' {
  if (simulations.length < 2) return 'stable'
  
  const recentSimulations = simulations.slice(0, Math.min(5, simulations.length))
  const projectedSavings = recentSimulations
    .filter(sim => sim.result?.projectedSavings)
    .map(sim => sim.result.projectedSavings)
  
  if (projectedSavings.length < 2) return 'stable'
  
  const firstHalf = projectedSavings.slice(0, Math.floor(projectedSavings.length / 2))
  const secondHalf = projectedSavings.slice(Math.floor(projectedSavings.length / 2))
  
  const firstAvg = firstHalf.reduce((sum, amount) => sum + amount, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, amount) => sum + amount, 0) / secondHalf.length
  
  if (secondAvg > firstAvg * 1.1) return 'increasing'
  if (secondAvg < firstAvg * 0.9) return 'decreasing'
  return 'stable'
}

function calculateIncomeTrend(simulations: any[]): 'increasing' | 'stable' | 'decreasing' {
  if (simulations.length < 2) return 'stable'
  
  const recentSimulations = simulations.slice(0, Math.min(5, simulations.length))
  const incomes = recentSimulations.map(sim => sim.monthlyIncome)
  
  if (incomes.length < 2) return 'stable'
  
  const firstHalf = incomes.slice(0, Math.floor(incomes.length / 2))
  const secondHalf = incomes.slice(Math.floor(incomes.length / 2))
  
  const firstAvg = firstHalf.reduce((sum, income) => sum + income, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, income) => sum + income, 0) / secondHalf.length
  
  if (secondAvg > firstAvg * 1.1) return 'increasing'
  if (secondAvg < firstAvg * 0.9) return 'decreasing'
  return 'stable'
}
