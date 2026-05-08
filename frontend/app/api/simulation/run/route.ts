import { NextResponse } from "next/server"

const MLBACKEND_URL =
  process.env.MLBACKEND_URL || "http://127.0.0.1:8000"
const MLBACKEND_TIMEOUT_MS = Number(process.env.MLBACKEND_TIMEOUT_MS || 8000)

type RunInput = {
  age: number
  retirementAge: number
  monthlyIncome: number
  monthlyContribution: number
  currentSavings: number
  inflationRate: number
  growthModel: "stable" | "balanced" | "high"
  incomeType: "stable" | "flexible" | "seasonal"
  savingBehavior: "consistent" | "flexible" | "opportunistic"
  lifestyle: "basic" | "moderate" | "comfortable"
}

function mapToMLPayload(input: RunInput) {
  const employmentTypeMap: Record<RunInput["incomeType"], number> = {
    stable: 1,
    flexible: 0,
    seasonal: 2,
  }
  const jobStabilityMap: Record<RunInput["incomeType"], number> = {
    stable: 0.8,
    flexible: 0.55,
    seasonal: 0.45,
  }
  const contributionGapMap: Record<RunInput["savingBehavior"], number> = {
    consistent: 1,
    flexible: 4,
    opportunistic: 2,
  }

  return {
    age: input.age,
    retirement_age: input.retirementAge,
    monthly_income: input.monthlyIncome,
    monthly_contribution: input.monthlyContribution,
    current_savings: input.currentSavings,
    inflation_rate: input.inflationRate,
    employment_type: employmentTypeMap[input.incomeType],
    job_stability: jobStabilityMap[input.incomeType],
    contribution_gap_months: contributionGapMap[input.savingBehavior],
  }
}

function buildRuleEngineResult(input: RunInput) {
  // 🔹 Growth Model → Return Rate
  let annualReturnRate = 0.08
  if (input.growthModel === "stable") annualReturnRate = 0.06
  if (input.growthModel === "balanced") annualReturnRate = 0.08
  if (input.growthModel === "high") annualReturnRate = 0.12

  // 🔹 Saving Behavior → Contribution Adjustment
  let adjustedContribution = input.monthlyContribution
  if (input.savingBehavior === "flexible") adjustedContribution *= 0.9
  if (input.savingBehavior === "opportunistic") adjustedContribution *= 1.2

  // 🔹 Income Type → Risk Adjustment
  let incomeFactor = 1
  if (input.incomeType === "flexible") incomeFactor = 0.9
  if (input.incomeType === "seasonal") incomeFactor = 0.8

  // 🔹 Lifestyle
  let lifestyleFactor = 1
  if (input.lifestyle === "basic") lifestyleFactor = 0.7
  if (input.lifestyle === "comfortable") lifestyleFactor = 1.3

  const yearsToRetirement = input.retirementAge - input.age
  const monthlyRate = annualReturnRate / 12
  const totalMonths = yearsToRetirement * 12

  const futureValueContributions =
    adjustedContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)
  const futureValueSavings = input.currentSavings * Math.pow(1 + monthlyRate, totalMonths)
  const estimatedSavings = futureValueContributions + futureValueSavings

  const inflationDecimal = input.inflationRate / 100
  const inflationAdjustedSavings = estimatedSavings * Math.pow(1 - inflationDecimal, yearsToRetirement)

  const requiredSavings =
    input.monthlyIncome * 12 * yearsToRetirement * lifestyleFactor * incomeFactor
  const rsi = requiredSavings > 0 ? inflationAdjustedSavings / requiredSavings : 0
  const rsiScore = Math.min(rsi * 100, 100)

  return {
    projectedSavings: Math.round(inflationAdjustedSavings),
    estimatedMonthlyIncome: Math.round(inflationAdjustedSavings / (20 * 12)),
    inflationAdjustedValue: Math.round(inflationAdjustedSavings),
    rsiScore: Number(rsiScore.toFixed(1)),
    meta: {
      growthModel: input.growthModel,
      incomeType: input.incomeType,
      savingBehavior: input.savingBehavior,
      annualReturnRate,
      adjustedContribution,
      engine: "rule-v2",
    },
  }
}

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

    const input: RunInput = {
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
    }

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

    let response = buildRuleEngineResult(input)
    const mlPayload = mapToMLPayload(input)

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), MLBACKEND_TIMEOUT_MS)

      const mlRes = await fetch(`${MLBACKEND_URL}/api/predict-readiness`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mlPayload),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (mlRes.ok) {
        const ml = await mlRes.json()
        const mlScore = Number(ml?.readiness_percentage ?? 0)
        const mlWarnings = Array.isArray(ml?.warnings) ? ml.warnings : []
        const fallbackToRuleEngine =
          ml?.status === "degraded" ||
          ml?.risk === "UNKNOWN" ||
          ml?.prediction == null

        if (fallbackToRuleEngine) {
          response = {
            ...response,
            meta: {
              ...response.meta,
              engine: "rule-v2",
              mlStatus: ml?.status ?? "degraded",
              mlWarnings: [...mlWarnings, "ML_FALLBACK_RULE_ENGINE"],
              mlRisk: ml?.risk ?? "UNKNOWN",
              mlRequestId: ml?.request_id ?? null,
            },
          }
        } else {
          response = {
            ...response,
            rsiScore: Number(mlScore.toFixed(1)),
            meta: {
              ...response.meta,
              engine: "ml-v1",
              mlStatus: ml?.status ?? "ok",
              mlWarnings,
              mlRisk: ml?.risk ?? "UNKNOWN",
              mlRequestId: ml?.request_id ?? null,
            },
          }
        }
      } else {
        response = {
          ...response,
          meta: {
            ...response.meta,
            engine: "rule-v2",
            mlStatus: "http_error",
            mlWarnings: [`ML_HTTP_${mlRes.status}`, "ML_FALLBACK_RULE_ENGINE"],
            mlRisk: "UNKNOWN",
            mlRequestId: null,
          },
        }
      }
    } catch (mlError) {
      console.warn("ML backend unavailable, falling back to rule engine:", mlError)
      response = {
        ...response,
        meta: {
          ...response.meta,
          engine: "rule-v2",
          mlStatus: "unavailable",
          mlWarnings: ["ML_UNAVAILABLE", "ML_FALLBACK_RULE_ENGINE"],
          mlRisk: "UNKNOWN",
          mlRequestId: null,
        },
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