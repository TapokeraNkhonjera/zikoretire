import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required"
        },
        { status: 400 }
      )
    }

    /* ================= FETCH ================= */

const simulations = await prisma.simulation.findMany({
  where: {
    userId
  },
  include: {
    result: true,
    scenarios: {
      include: {
        result: true
      }
    },
    recommendations: true
  },
  orderBy: {
    createdAt: "desc"
  }
})

    /* ================= MAP ================= */

const formatted = simulations.map((sim) => ({

  id: sim.id,
  createdAt: sim.createdAt,
  priority: sim.priority,

  monthlyIncome: sim.monthlyIncome,

  incomeType: sim.incomeType.toLowerCase(),

  /* 🔥 MAIN RESULT */
  result: sim.result
    ? {
        projectedValue: sim.result.projectedSavings,
        monthlyIncome: sim.result.estimatedMonthlyIncome, // ✅ FIX
        inflationAdjustedValue: sim.result.inflationAdjustedValue, // ✅ ADD
        rsiScore: sim.result.rsiScore,
        readinessLevel: sim.result.readinessLevel,
        riskScore: sim.result.riskScore,
        confidenceScore: sim.result.confidenceScore
      }
    : null,

  /* 🔥 SCENARIOS */
  scenarios: sim.scenarios.map((s) => ({
    id: s.id,
    name: s.name,
    result: s.result
      ? {
          projectedValue: s.result.projectedSavings,
          monthlyIncome: s.result.estimatedMonthlyIncome,
          inflationAdjustedValue: s.result.inflationAdjustedValue,
          rsiScore: s.result.rsiScore,
          readinessLevel: s.result.readinessLevel,
          riskScore: s.result.riskScore,
          confidenceScore: s.result.confidenceScore
        }
      : null
  })),

  /* 🔥 RECOMMENDATIONS */
  recommendations: sim.recommendations.map((r) => ({
    message: r.message,
    type: r.type
  }))

}))

    console.log("📊 HISTORY OUTPUT:", formatted)

    return NextResponse.json({
      success: true,
      data: formatted
    })
  } catch (error) {
    console.error("🔥 HISTORY ERROR:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch history"
      },
      { status: 500 }
    )
  }
}