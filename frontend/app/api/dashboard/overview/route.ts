import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateProjectionCurve, RunInput } from "@/lib/deterministicEngine"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const resolutionParam = searchParams.get("resolution")
    const resolution = resolutionParam ? parseFloat(resolutionParam) : 2

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing userId" },
        { status: 400 }
      )
    }
console.log("USER ID:", userId)
    /* ================= FETCH SIMULATIONS ================= */

    const simulations = await prisma.simulation.findMany({
      where: { userId },
      include: {
        result: true,
        scenarios: {
          include: {
            result: true
          }
        },
        recommendations: true
      },
      orderBy: { createdAt: "desc" }
    })

    if (!simulations.length) {
      const currentYear = new Date().getFullYear()
      return NextResponse.json({
        success: true,
        data: {
          stats: {
            totalContributions: 0,
            projectedFund: 0,
            monthlyIncome: 0,
            rsi: 0
          },
          chartData: [
            { year: currentYear.toString(), savings: 0, inflationAdjusted: 0 },
            { year: (currentYear + 5).toString(), savings: 0, inflationAdjusted: 0 },
            { year: (currentYear + 10).toString(), savings: 0, inflationAdjusted: 0 }
          ],
          activity: []
        }
      })
    }

    // Prioritize main simulation (priority = true), fall back to latest
    const prioritySimulation = simulations.find(s => s.priority === true)
    const latest = prioritySimulation || simulations[0]
    
    // Log which simulation is being used for dashboard
    console.log(`Dashboard using ${prioritySimulation ? 'priority' : 'latest'} simulation for user ${userId}:`, latest.id)

    /* ================= STATS ================= */

    const totalContributions = simulations.reduce(
      (sum, s) =>
        sum +
        s.monthlyContribution *
          (s.retirementAge - s.age) *
          12,
      0
    )

    const projectedFund =
      latest.result?.projectedSavings || 0

    const monthlyIncome =
      latest.result?.estimatedMonthlyIncome || 0

    const rsi =
      latest.result?.rsiScore || 0

    /* ================= CHART DATA ================= */

    /* ================= CHART DATA ================= */

    let chartData = []
    
    try {
      let detectedStrategy: any = "balanced"
      if (latest.incomeType.toLowerCase() === "seasonal") {
        detectedStrategy = "seasonal"
      } else if (latest.incomeType.toLowerCase() === "flexible" || latest.savingBehavior.toLowerCase() === "flexible") {
        detectedStrategy = "informal"
      }
      
      const runInput: RunInput = {
        age: latest.age,
        retirementAge: latest.retirementAge,
        monthlyIncome: latest.monthlyIncome,
        monthlyContribution: latest.monthlyContribution,
        currentSavings: latest.currentSavings || 0,
        inflationRate: latest.inflationRate,
        growthModel: latest.growthModel.toLowerCase() as RunInput["growthModel"],
        incomeType: latest.incomeType.toLowerCase() as RunInput["incomeType"],
        savingBehavior: latest.savingBehavior.toLowerCase() as RunInput["savingBehavior"],
        lifestyle: latest.lifestyle as RunInput["lifestyle"],
        projectionStrategy: detectedStrategy
      }
      
      chartData = generateProjectionCurve(runInput, resolution)
      
      if (resolution < 1) {
        // Monthly view: Zoom in on the first 24 months so Recharts can fit every single month label
        chartData = chartData.slice(0, 25)
      } else {
        // Full view: Ensure the final point perfectly aligns with the compliance-adjusted final ML result if available
        if (chartData.length > 0 && latest.result) {
          const lastPoint = chartData[chartData.length - 1]
          lastPoint.savings = latest.result.projectedSavings
          lastPoint.inflationAdjusted = latest.result.inflationAdjustedValue
        }
      }
      
    } catch (e) {
      console.warn("Could not generate exact projection curve, falling back to empty", e)
      chartData = []
    }

    /* ================= RECENT ACTIVITY ================= */

    const activity = simulations.slice(0, 5).map(s => ({
      title: "Simulation created",
      description: `Age ${s.age} → ${s.retirementAge}`,
      time: s.createdAt
    }))

    /* ================= RESPONSE ================= */

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalContributions,
          projectedFund,
          monthlyIncome,
          rsi
        },
        chartData,
        activity
      }
    })

  } catch (error) {
    console.error("DASHBOARD ERROR:", error)

    return NextResponse.json(
      { success: false, message: "Failed to load dashboard" },
      { status: 500 }
    )
  }
}