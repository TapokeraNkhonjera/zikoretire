import { NextResponse } from "next/server"

export async function POST(req: Request) {

  try {

    const data = await req.json()

    /* ================= EXTRACT + DEFAULTS ================= */

    const {
      age,
      retirementAge,
      monthlyIncome,
      monthlyContribution,

      currentSavings = 0,
      inflationRate = 0,

      // ✅ enforce behavioral inputs
      growthModel = "balanced",
      incomeType = "stable",
      savingBehavior = "consistent",

      lifestyle = "moderate"
    } = data

    console.log("📥 RUN INPUT:", {
      age,
      retirementAge,
      monthlyIncome,
      monthlyContribution,
      currentSavings,
      inflationRate,
      growthModel,
      incomeType,
      savingBehavior,
      lifestyle
    })

    /* ================= VALIDATION ================= */

    if (
      !age ||
      !retirementAge ||
      retirementAge <= age
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid age values"
        },
        { status: 400 }
      )
    }

    /* ================= BEHAVIOR MODELS ================= */

    // 🔹 Growth Model → Return Rate
    let annualReturnRate = 0.08

    if (growthModel === "stable") annualReturnRate = 0.06
    if (growthModel === "balanced") annualReturnRate = 0.08
    if (growthModel === "high") annualReturnRate = 0.12

    // 🔹 Saving Behavior → Contribution Adjustment
    let adjustedContribution = monthlyContribution

    if (savingBehavior === "flexible") {
      adjustedContribution *= 0.9
    }

    if (savingBehavior === "opportunistic") {
      adjustedContribution *= 1.2
    }

    // 🔹 Income Type → Risk Adjustment
    let incomeFactor = 1

    if (incomeType === "flexible") incomeFactor = 0.9
    if (incomeType === "seasonal") incomeFactor = 0.8

    // 🔹 Lifestyle
    let lifestyleFactor = 1

    if (lifestyle === "basic") lifestyleFactor = 0.7
    if (lifestyle === "comfortable") lifestyleFactor = 1.3

    /* ================= CORE CALCULATION ================= */

    const yearsToRetirement =
      retirementAge - age

    const monthlyRate =
      annualReturnRate / 12

    const totalMonths =
      yearsToRetirement * 12

    // Future Value of Contributions
    const futureValueContributions =
      adjustedContribution *
      (
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
        / monthlyRate
      )

    // Future Value of Current Savings
    const futureValueSavings =
      currentSavings *
      Math.pow(1 + monthlyRate, totalMonths)

    const estimatedSavings =
      futureValueContributions +
      futureValueSavings

    // Inflation Adjustment
    const inflationDecimal =
      inflationRate / 100

    const inflationAdjustedSavings =
      estimatedSavings *
      Math.pow(
        1 - inflationDecimal,
        yearsToRetirement
      )

    /* ================= RSI ================= */

    const requiredSavings =
      monthlyIncome *
      12 *
      yearsToRetirement *
      lifestyleFactor *
      incomeFactor

    const rsi =
      requiredSavings > 0
        ? inflationAdjustedSavings / requiredSavings
        : 0

    const rsiScore =
      Math.min(rsi * 100, 100)

    /* ================= RESPONSE ================= */

    const response = {

      projectedSavings:
        Math.round(inflationAdjustedSavings),

      estimatedMonthlyIncome:
        Math.round(
          inflationAdjustedSavings / (20 * 12)
        ),

      inflationAdjustedValue:
        Math.round(inflationAdjustedSavings),

      rsiScore: Number(rsiScore.toFixed(1)),

      // 🔥 IMPORTANT (future ML + debugging)
      meta: {
        growthModel,
        incomeType,
        savingBehavior,
        annualReturnRate,
        adjustedContribution,
        engine: "rule-v2"
      }

    }

    console.log("📊 RUN OUTPUT:", response)

    return NextResponse.json({
      success: true,
      data: response
    })

  }

  catch (error) {

    console.error("🔥 RUN ERROR:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Calculation failed",
        error: String(error)
      },
      { status: 500 }
    )

  }

}