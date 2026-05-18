import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
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
      name,

      age,
      retirementAge,

      monthlyIncome,
      monthlyContribution,

      currentSavings = 0,
      inflationRate = 0,

      // ✅ behavioral inputs
      growthModel = "balanced",
      incomeType = "stable",
      savingBehavior = "consistent",

      lifestyle = "moderate",
      historicalData = null,

      results,
      scenarios = [],
      forceSave = false
    } = data

    /* ================= VALIDATION ================= */

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      )
    }

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Simulation name is required" },
        { status: 400 }
      )
    }

    if (!age) {
      return NextResponse.json({ success: false, message: "Invalid simulation data: missing age" }, { status: 400 })
    }
    if (!retirementAge) {
      return NextResponse.json({ success: false, message: "Invalid simulation data: missing retirementAge" }, { status: 400 })
    }
    if (retirementAge <= age) {
      return NextResponse.json({ success: false, message: "Invalid simulation data: retirementAge must be greater than age" }, { status: 400 })
    }

    if (!results) {
      return NextResponse.json(
        { success: false, message: "Missing results data" },
        { status: 400 }
      )
    }

    /* ================= DUPLICATE CHECK ================= */

    if (!forceSave) {
      const existingSims = await prisma.simulation.findMany({
        where: {
          userId,
          name,
          age,
          retirementAge,
          monthlyIncome,
          monthlyContribution,
          currentSavings,
          growthModel: growthModel.toUpperCase(),
        },
        include: {
          result: true,
        },
        take: 1,
      });

      if (existingSims.length > 0) {
        const scenarioCount = scenarios && Array.isArray(scenarios) ? scenarios.length : 0;
        const scenariosText = scenarioCount > 0 ? ` You are about to save this simulation along with ${scenarioCount} scenario(s).` : "";
        return NextResponse.json({
          success: false,
          isDuplicate: true,
          message: `A simulation with similar results is already saved.${scenariosText}`,
          data: {
            simulationId: existingSims[0].id,
            resultId: existingSims[0].result?.id
          }
        });
      }
    }

    console.log("💾 SAVE INPUT:", {
      userId,
      age,
      retirementAge,
      monthlyIncome,
      monthlyContribution,
      currentSavings,
      inflationRate,
      growthModel,
      incomeType,
      savingBehavior,
      lifestyle,
      historicalData,
      results
    })

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

    /* ================= SAVE SIMULATION ================= */

    const simulation = await prisma.simulation.create({
      data: {

        userId,
        name,

        age,
        retirementAge,

        monthlyIncome,
        monthlyContribution,

        currentSavings,
        inflationRate,

        lifestyle,
        historicalData: historicalData || null,

    // ✅ FIX ENUM CASE
    growthModel: growthModel.toUpperCase(),
    incomeType: incomeType.toUpperCase(),
    savingBehavior: savingBehavior.toUpperCase()

      }
    })

    /* ================= SAVE RESULT ================= */
    
const savedResult = await prisma.result.create({
  data: {
    simulationId: simulation.id,

    projectedSavings:
      Number(results.projectedSavings ?? 0),

    estimatedMonthlyIncome:
      Number(results.estimatedMonthlyIncome ?? 0),

    inflationAdjustedValue:
      Number(results.inflationAdjustedValue ?? 0),

    rsiScore:
      Number(results.rsiScore ?? 0),

    riskScore:
      mapRiskToScore(results?.meta?.mlRisk),

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

    /* ================= SAVE SCENARIOS ================= */
    
    if (scenarios && Array.isArray(scenarios) && scenarios.length > 0) {
      for (const scenario of scenarios) {
        if (!scenario.results) continue;
        
        const savedScenario = await prisma.scenario.create({
          data: {
            userId,
            simulationId: simulation.id,
            name: scenario.name || "Scenario",
            
            age: Number(scenario.inputs.currentAge),
            retirementAge: Number(scenario.inputs.retirementAge),
            monthlyIncome: Number(scenario.inputs.monthlyIncome),
            monthlyContribution: Number(scenario.inputs.monthlyContribution),
            currentSavings: Number(scenario.inputs.currentSavings || 0),
            inflationRate: Number(scenario.inputs.inflationRate || 0),
            
            growthModel: scenario.inputs.growthModel.toUpperCase() as any,
            incomeType: scenario.inputs.incomeType.toUpperCase() as any,
            savingBehavior: scenario.inputs.savingBehavior.toUpperCase() as any,
            
            includeIrregular: scenario.inputs.includeIrregular || false,
            extraContribution: Number(scenario.inputs.extraContribution || 0),
            lifestyle: "moderate",
            historicalData: scenario.inputs.historicalData || null
          }
        });

        await prisma.scenarioResult.create({
          data: {
            scenarioId: savedScenario.id,
            projectedSavings: Number(scenario.results.projectedSavings ?? 0),
            estimatedMonthlyIncome: Number(scenario.results.estimatedMonthlyIncome ?? 0),
            inflationAdjustedValue: Number(scenario.results.inflationAdjustedValue ?? 0),
            rsiScore: Number(scenario.results.rsiScore ?? 0),
            readinessLevel: scenario.results.rsiScore >= 100 ? "Ready" : scenario.results.rsiScore >= 60 ? "Moderate" : "At Risk",
            
            riskScore: mapRiskToScore(scenario.results?.meta?.mlRisk),
            confidenceScore: typeof scenario.results?.meta?.mlConfidence === "number" ? Number(scenario.results.meta.mlConfidence) : null
          }
        });
      }
    }

    console.log("✅ SAVE SUCCESS:", {
      simulationId: simulation.id,
      resultId: savedResult.id,
      scenariosSaved: scenarios.length
    })

    // 🎯 Trigger notification for simulation save
    try {
      await NotificationService.onSimulationSaved(userId, simulation.id, Number(results.projectedSavings || 0))
    } catch (notificationError) {
      console.error('❌ Failed to create simulation save notification:', notificationError)
      // Don't fail the save operation if notification fails
    }

    return NextResponse.json({
      success: true,
      data: {
        simulationId: simulation.id,
        resultId: savedResult.id
      }
    })

  }

  catch (error) {

    console.error("🔥 SAVE ERROR:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save simulation",
        error: String(error)
      },
      { status: 500 }
    )

  }

}