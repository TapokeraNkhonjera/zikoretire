import { NextResponse } from "next/server"

import {
  type ProjectionStrategy,
  type RunInput,
  mapToMLPayload,
  buildDeterministicProjection,
} from "@/lib/projectionEngine"

const MLBACKEND_URL = process.env.MLBACKEND_URL || "http://127.0.0.1:8000"
const MLBACKEND_TIMEOUT_MS = Number(process.env.MLBACKEND_TIMEOUT_MS || 8000)

type MLRisk = "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN"

const DEFAULT_STRATEGIES: ProjectionStrategy[] = [
  "conservative",
  "balanced",
  "aggressive",
  "informal",
  "seasonal",
  "inflation_stress",
  "contribution_growth",
  "early_retirement",
  "sustainability",
]

type ProjectionResponse = {
  projectedSavings: number
  estimatedMonthlyIncome: number
  inflationAdjustedValue: number
  rsiScore: number
  meta: Record<string, unknown>
}

async function tryEnhanceWithML(input: RunInput, baseResponse: ProjectionResponse) {
  const mlPayload = mapToMLPayload(input)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), MLBACKEND_TIMEOUT_MS)

  try {
    const mlRes = await fetch(`${MLBACKEND_URL}/api/predict-multi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mlPayload),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!mlRes.ok) {
      return {
        ...baseResponse,
        meta: {
          ...baseResponse.meta,
          engine: "deterministic-v3",
          mlStatus: "http_error",
          mlWarnings: [`ML_HTTP_${mlRes.status}`, "ML_FALLBACK_DETERMINISTIC"],
        },
      }
    }

    const ml = await mlRes.json()
    const readinessOutput = ml?.outputs?.readiness
    const mlScore = readinessOutput?.prediction ? Number(readinessOutput.prediction * 100) : baseResponse.rsiScore
    const mlWarnings = Array.isArray(ml?.warnings) ? ml.warnings : []
    const mlConfidence = readinessOutput?.confidence ?? null

    const fallbackToRuleEngine = 
      ml?.status === "degraded" || !readinessOutput?.prediction

    if (fallbackToRuleEngine) {
      return {
        ...baseResponse,
        meta: {
          ...baseResponse.meta,
          engine: "deterministic-v3",
          mlStatus: ml?.status ?? "degraded",
          mlWarnings: [...mlWarnings, "ML_FALLBACK_DETERMINISTIC"],
          mlRequestId: ml?.request_id ?? null,
          mlConfidence,
          mlOverallConfidence: ml?.overall_confidence ?? null,
          mlOutputs: ml?.outputs ?? null,
          mlModelStatus: ml?.model_status ?? null,
        },
      }
    }

    return {
      ...baseResponse,
      rsiScore: Number(mlScore.toFixed(1)),
      meta: {
        ...baseResponse.meta,
        engine: "ml-enhanced-v3",
        mlStatus: ml?.status ?? "ok",
        mlWarnings,
        mlRequestId: ml?.request_id ?? null,
        mlConfidence,
        mlOverallConfidence: ml?.overall_confidence,
        mlOutputs: ml?.outputs,
        mlModelStatus: ml?.model_status,
      },
    }
  } catch {
    clearTimeout(timeout)
    return {
      ...baseResponse,
      meta: {
        ...baseResponse.meta,
        engine: "deterministic-v3",
        mlStatus: "unavailable",
        mlWarnings: ["ML_UNAVAILABLE", "ML_FALLBACK_DETERMINISTIC"],
      },
    }
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const {
      strategies = DEFAULT_STRATEGIES,
      ...rest
    } = data as { strategies?: ProjectionStrategy[] } & Partial<RunInput>

    const input: RunInput = {
      age: Number(rest.age),
      retirementAge: Number(rest.retirementAge),
      monthlyIncome: Number(rest.monthlyIncome),
      monthlyContribution: Number(rest.monthlyContribution),
      currentSavings: Number(rest.currentSavings ?? 0),
      inflationRate: Number(rest.inflationRate ?? 0),
      projectionStrategy: (rest.projectionStrategy ?? "balanced") as ProjectionStrategy,
      growthModel: (rest.growthModel ?? "balanced") as RunInput["growthModel"],
      incomeType: (rest.incomeType ?? "stable") as RunInput["incomeType"],
      savingBehavior: (rest.savingBehavior ?? "consistent") as RunInput["savingBehavior"],
      lifestyle: (rest.lifestyle ?? "moderate") as RunInput["lifestyle"],
    }

    if (!input.age || !input.retirementAge || input.retirementAge <= input.age) {
      return NextResponse.json(
        { success: false, message: "Invalid age values" },
        { status: 400 }
      )
    }

    const results = await Promise.all(
      strategies.map(async (strategy) => {
        const deterministic = buildDeterministicProjection({
          ...input,
          projectionStrategy: strategy,
        })
        const enhanced = await tryEnhanceWithML(
          { ...input, projectionStrategy: strategy },
          deterministic
        )
        return {
          strategy,
          ...enhanced,
        }
      })
    )

    const sorted = [...results].sort((a, b) => b.rsiScore - a.rsiScore)

    return NextResponse.json({
      success: true,
      data: {
        results,
        best: sorted[0] ?? null,
        worst: sorted[sorted.length - 1] ?? null,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Comparison failed", error: String(error) },
      { status: 500 }
    )
  }
}

