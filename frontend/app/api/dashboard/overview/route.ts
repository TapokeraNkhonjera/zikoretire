import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

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
      return NextResponse.json({
        success: true,
        data: null
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

    const years = latest.retirementAge - latest.age
    const chartData = []

    for (let i = 0; i <= years; i += 2) {
      const year = new Date().getFullYear() + i

      const growth =
        latest.monthlyContribution *
        12 *
        i

      const savings =
        (latest.currentSavings || 0) + growth

      const inflationAdjusted =
        savings *
        Math.pow(
          1 - latest.inflationRate / 100,
          i
        )

      chartData.push({
        year: year.toString(),
        savings: Math.round(savings),
        inflationAdjusted: Math.round(
          inflationAdjusted
        )
      })
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