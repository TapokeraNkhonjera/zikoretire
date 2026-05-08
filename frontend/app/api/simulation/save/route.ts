import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {

  try {

    const data = await req.json()

    const {
      userId,

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

      results,
      forceSave = false
    } = data

    /* ================= VALIDATION ================= */

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
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
        return NextResponse.json({
          success: false,
          isDuplicate: true,
          message: "A simulation with similar results is already saved.",
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
      results
    })

    /* ================= SAVE SIMULATION ================= */

    const simulation = await prisma.simulation.create({
      data: {

        userId,

        age,
        retirementAge,

        monthlyIncome,
        monthlyContribution,

        currentSavings,
        inflationRate,

        lifestyle,

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

    readinessLevel:
      results.rsiScore >= 100
        ? "Ready"
        : results.rsiScore >= 60
        ? "Moderate"
        : "At Risk"
  }
})

    console.log("✅ SAVE SUCCESS:", {
      simulationId: simulation.id,
      resultId: savedResult.id
    })

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