import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { NotificationService } from "@/lib/notificationService"

function mapRiskToScore(mlRisk: string | undefined): number | null {
  if (!mlRisk) return null
  if (mlRisk === "LOW") return 0.2
  if (mlRisk === "MEDIUM") return 0.5
  if (mlRisk === "HIGH") return 0.8
  return null
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const {
      userId,
      simulationId,
      name,
      overrides,
      results
    } = data

    /* ================= VALIDATION ================= */

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      )
    }

    if (!simulationId || !name || !results) {
      return NextResponse.json(
        { success: false, message: "Missing required scenario data" },
        { status: 400 }
      )
    }

    console.log("💾 SAVE SCENARIO INPUT:", {
      userId,
      simulationId,
      name,
      overrides,
      results
    })

    /* ================= SAVE SCENARIO ================= */

    // Convert string inputs back to numbers where appropriate
    const age = overrides.currentAge ? Number(overrides.currentAge) : undefined
    const retirementAge = overrides.retirementAge ? Number(overrides.retirementAge) : undefined
    const monthlyIncome = overrides.monthlyIncome ? Number(overrides.monthlyIncome) : undefined
    const monthlyContribution = overrides.monthlyContribution ? Number(overrides.monthlyContribution) : undefined
    const currentSavings = overrides.currentSavings ? Number(overrides.currentSavings) : undefined
    const inflationRate = overrides.inflationRate ? Number(overrides.inflationRate) : undefined
    const extraContribution = overrides.extraContribution ? Number(overrides.extraContribution) : undefined
    const includeIrregular = overrides.includeIrregular !== undefined ? Boolean(overrides.includeIrregular) : undefined

    // Convert enums to uppercase for Prisma
    const growthModel = overrides.growthModel ? overrides.growthModel.toUpperCase() : undefined
    const incomeType = overrides.incomeType ? overrides.incomeType.toUpperCase() : undefined
    const savingBehavior = overrides.savingBehavior ? overrides.savingBehavior.toUpperCase() : undefined

    /* ================= CHECK USER EXISTS ================= */

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found. Please sign out and sign in again." },
        { status: 404 }
      )
    }

    const scenario = await prisma.scenario.create({
      data: {
        userId,
        simulationId,
        name,
        
        // Overrides
        age,
        retirementAge,
        monthlyIncome,
        monthlyContribution,
        currentSavings,
        inflationRate,
        includeIrregular,
        extraContribution,
        
        growthModel,
        incomeType,
        savingBehavior
      }
    })

    /* ================= SAVE SCENARIO RESULT ================= */

    const savedResult = await prisma.scenarioResult.create({
      data: {
        scenarioId: scenario.id,

        projectedSavings: Number(results.projectedSavings ?? 0),
        estimatedMonthlyIncome: Number(results.estimatedMonthlyIncome ?? 0),
        inflationAdjustedValue: Number(results.inflationAdjustedValue ?? 0),
        rsiScore: Number(results.rsiScore ?? 0),
        riskScore: mapRiskToScore(results?.meta?.mlRisk),
        confidenceScore:
          typeof results?.meta?.mlConfidence === "number"
            ? Number(results.meta.mlConfidence)
            : null,

        readinessLevel:
          results.rsiScore >= 100
            ? "Ready"
            : results.rsiScore >= 60
            ? "Moderate"
            : "At Risk"
      }
    })

    console.log("✅ SCENARIO SAVE SUCCESS:", {
      scenarioId: scenario.id,
      resultId: savedResult.id
    })

    // 🎯 Trigger notification for scenario creation
    try {
      await NotificationService.onScenarioCreated(userId, name, simulationId)
    } catch (notificationError) {
      console.error('❌ Failed to create scenario notification:', notificationError)
      // Don't fail scenario save if notification fails
    }

    return NextResponse.json({
      success: true,
      data: {
        scenarioId: scenario.id,
        resultId: savedResult.id
      }
    })

  } catch (error) {
    console.error("🔥 SCENARIO SAVE ERROR:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save scenario",
        error: String(error)
      },
      { status: 500 }
    )
  }
}
