import { NextResponse } from "next/server"

import {
  type RunInput,
  mapToMLPayload,
  buildDeterministicProjection,
} from "@/lib/projectionEngine"

const MLBACKEND_URL =
  process.env.MLBACKEND_URL || "http://127.0.0.1:8000"
const MLBACKEND_TIMEOUT_MS = Number(process.env.MLBACKEND_TIMEOUT_MS || 8000)
const TELEMETRY_TIMEOUT_MS = Number(process.env.ML_TELEMETRY_TIMEOUT_MS || 2000)

type MLRisk = "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN"

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

      projectionStrategy = "balanced",

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
      projectionStrategy,
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

    let response = buildDeterministicProjection(input)
    const mlPayload = mapToMLPayload(input)
    let inboundRequestId: string | null = null

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
        inboundRequestId = typeof ml?.request_id === "string" ? ml.request_id : null
        const mlScore = Number(ml?.readiness_percentage ?? 0)
        const mlWarnings = Array.isArray(ml?.warnings) ? ml.warnings : []
        const mlFactors = Array.isArray(ml?.factors) ? ml.factors : []
        const mlConfidence =
          typeof ml?.confidence === "number" ? Number(ml.confidence) : null
        const mlRisk: MLRisk = (ml?.risk as MLRisk) || "UNKNOWN"
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
              mlRisk,
              mlRequestId: ml?.request_id ?? null,
              mlConfidence,
              mlPrediction:
                typeof ml?.prediction === "number" ? Number(ml.prediction) : null,
              mlReadinessPercentage:
                typeof ml?.readiness_percentage === "number"
                  ? Number(ml.readiness_percentage)
                  : null,
              mlFactorsCount: mlFactors.length,
              mlExplanation:
                typeof ml?.explanation === "string" ? ml.explanation : null,
              mlAdvice:
                typeof ml?.advice === "string" ? ml.advice : null,
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
              mlRisk,
              mlRequestId: ml?.request_id ?? null,
              mlConfidence,
              mlPrediction:
                typeof ml?.prediction === "number" ? Number(ml.prediction) : null,
              mlReadinessPercentage:
                typeof ml?.readiness_percentage === "number"
                  ? Number(ml.readiness_percentage)
                  : null,
              mlFactorsCount: mlFactors.length,
              mlExplanation:
                typeof ml?.explanation === "string" ? ml.explanation : null,
              mlAdvice:
                typeof ml?.advice === "string" ? ml.advice : null,
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
            mlConfidence: null,
            mlPrediction: null,
            mlReadinessPercentage: null,
            mlFactorsCount: 0,
            mlExplanation: null,
            mlAdvice: null,
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
          mlConfidence: null,
          mlPrediction: null,
          mlReadinessPercentage: null,
          mlFactorsCount: 0,
          mlExplanation: null,
          mlAdvice: null,
        },
      }
    }

    // Capture inference telemetry for continuous model improvement.
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), TELEMETRY_TIMEOUT_MS)

      await fetch(`${MLBACKEND_URL}/api/telemetry/inference`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_id: inboundRequestId,
          source: "frontend-simulation-run",
          input_payload: input,
          ml_payload: mlPayload,
          result_meta: response.meta,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
    } catch (telemetryError) {
      console.warn("Failed to record ML telemetry event:", telemetryError)
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