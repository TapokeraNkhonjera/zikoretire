import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body: { scenarioId: string } = await req.json()

    if (!body.scenarioId) {
      return NextResponse.json(
        { success: false, message: "Missing scenarioId" },
        { status: 400 }
      )
    }

    const scenario = await prisma.scenario.findUnique({
      where: { id: body.scenarioId },
      include: { simulation: true }
    })

    if (!scenario) {
      return NextResponse.json(
        { success: false, message: "Scenario not found" },
        { status: 404 }
      )
    }

    const base = scenario.simulation

    /* ================= MERGE ================= */

    const age = scenario.age ?? base.age
    const retirementAge = scenario.retirementAge ?? base.retirementAge
    const monthlyIncome = scenario.monthlyIncome ?? base.monthlyIncome
    const monthlyContribution =
      scenario.monthlyContribution ?? base.monthlyContribution
    const currentSavings =
      scenario.currentSavings ?? base.currentSavings ?? 0
    const inflationRate =
      scenario.inflationRate ?? base.inflationRate

    const growthModel = scenario.growthModel ?? base.growthModel
    const incomeType = scenario.incomeType ?? base.incomeType
    const savingBehavior = scenario.savingBehavior ?? base.savingBehavior
    const lifestyle = scenario.lifestyle ?? base.lifestyle

    /* ================= SAME ENGINE ================= */

    let annualReturnRate = 0.08

    if (growthModel === "STABLE") annualReturnRate = 0.06
    if (growthModel === "HIGH") annualReturnRate = 0.12

    let adjustedContribution = monthlyContribution

    if (savingBehavior === "FLEXIBLE") adjustedContribution *= 0.9
    if (savingBehavior === "OPPORTUNISTIC") adjustedContribution *= 1.2

    let incomeFactor = 1
    if (incomeType === "FLEXIBLE") incomeFactor = 0.9
    if (incomeType === "SEASONAL") incomeFactor = 0.8

    let lifestyleFactor = 1
    if (lifestyle === "basic") lifestyleFactor = 0.7
    if (lifestyle === "comfortable") lifestyleFactor = 1.3

    const years = retirementAge - age
    const monthlyRate = annualReturnRate / 12
    const months = years * 12

    const fvContrib =
      adjustedContribution *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)

    const fvSavings =
      currentSavings * Math.pow(1 + monthlyRate, months)

    const total = fvContrib + fvSavings

    const inflationAdjusted =
      total * Math.pow(1 - inflationRate / 100, years)

    const requiredSavings =
      monthlyIncome * 12 * years * lifestyleFactor * incomeFactor

    const rsi =
      requiredSavings > 0 ? inflationAdjusted / requiredSavings : 0

    const rsiScore = Math.min(rsi * 100, 100)

    /* ================= SAVE ================= */

    const result = await prisma.scenarioResult.create({
      data: {
        scenarioId: scenario.id,

        projectedSavings: Math.round(inflationAdjusted),
        estimatedMonthlyIncome: Math.round(
          inflationAdjusted / (20 * 12)
        ),
        inflationAdjustedValue: Math.round(inflationAdjusted),

        rsiScore: Number(rsiScore.toFixed(1)),

        readinessLevel:
          rsiScore >= 100
            ? "Ready"
            : rsiScore >= 60
            ? "Moderate"
            : "At Risk"
      }
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error("SCENARIO RUN ERROR:", error)

    return NextResponse.json(
      { success: false },
      { status: 500 }
    )
  }
}