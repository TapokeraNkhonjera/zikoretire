// Import deterministic engine types and functions
import {
  type ProjectionStrategy,
  type RunInput,
  type DeterministicResult,
  type DeterministicMeta,
  type StrategyAdjustments,
  buildDeterministicProjection,
  getStrategyDescription,
  validateProjectionInput
} from './deterministicEngine'

// Re-export for external use
export {
  type ProjectionStrategy,
  type RunInput,
  type DeterministicResult,
  type DeterministicMeta,
  type StrategyAdjustments,
  buildDeterministicProjection,
  getStrategyDescription,
  validateProjectionInput
}

// Enhanced ML output types
export type MLOutput = {
  prediction: number | null
  confidence: number
  factors: Array<{
    feature: string
    label: string
    impact: number
    raw_shap: number
    value: number
  }>
  explanation: string
  error?: string
}

export type MultiMLResult = {
  status: "ok" | "partial" | "degraded"
  overall_confidence: number
  outputs: {
    readiness: MLOutput
    consistency: MLOutput
    volatility: MLOutput
    sustainability: MLOutput
    inflation_vulnerability: MLOutput
  }
  warnings: string[]
  model_status: Record<string, boolean>
}

export type EnhancedProjectionResult = DeterministicResult & {
  ml?: MultiMLResult
  confidence: "high" | "medium" | "low" | "unavailable"
  engine: "deterministic" | "ml-enhanced" | "ml-fallback"
}

export function mapToMLPayload(input: RunInput) {
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

// =========================================================
// ENHANCED PROJECTION ENGINE WITH ML INTEGRATION
// =========================================================
export async function buildEnhancedProjection(
  input: RunInput, 
  mlBackendUrl: string = "http://127.0.0.1:8000",
  timeoutMs: number = 8000
): Promise<EnhancedProjectionResult> {
  // Start deterministic calculation immediately
  const deterministic = buildDeterministicProjection(input)
  
  // Try to enhance with ML
  let mlResult: MultiMLResult | undefined
  let engine: EnhancedProjectionResult["engine"] = "deterministic"
  let confidence: EnhancedProjectionResult["confidence"] = "unavailable"
  
  try {
    const mlPayload = mapToMLPayload(input)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    
    const mlResponse = await fetch(`${mlBackendUrl}/api/predict-multi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mlPayload),
      signal: controller.signal,
    })
    
    clearTimeout(timeout)
    
    if (mlResponse.ok) {
      mlResult = await mlResponse.json()
      
      // Determine confidence level
      if (mlResult && mlResult.overall_confidence >= 0.8) {
        confidence = "high"
      } else if (mlResult && mlResult.overall_confidence >= 0.6) {
        confidence = "medium"
      } else if (mlResult && mlResult.overall_confidence >= 0.4) {
        confidence = "low"
      }
      
      // Determine engine status
      if (mlResult && mlResult.status === "ok") {
        engine = "ml-enhanced"
      } else if (mlResult && mlResult.status === "partial") {
        engine = "ml-fallback"
      }
    }
  } catch (error) {
    console.warn("ML enhancement failed:", error)
  }
  
  return {
    ...deterministic,
    ml: mlResult,
    confidence,
    engine
  }
}

// =========================================================
// STRATEGY COMPARISON UTILITIES
// =========================================================
export async function compareStrategies(
  input: RunInput,
  strategies: ProjectionStrategy[] = [
    "conservative", "balanced", "aggressive", "informal", 
    "seasonal", "inflation_stress", "contribution_growth", 
    "early_retirement", "sustainability"
  ],
  mlBackendUrl: string = "http://127.0.0.1:8000"
): Promise<Array<EnhancedProjectionResult & { strategy: ProjectionStrategy }>> {
  const results = await Promise.all(
    strategies.map(async (strategy) => {
      const result = await buildEnhancedProjection(
        { ...input, projectionStrategy: strategy },
        mlBackendUrl
      )
      return { ...result, strategy }
    })
  )
  
  return results.sort((a, b) => b.rsiScore - a.rsiScore)
}

export function getStrategyComparisonSummary(
  results: Array<EnhancedProjectionResult & { strategy: ProjectionStrategy }>
): {
  best: EnhancedProjectionResult & { strategy: ProjectionStrategy }
  worst: EnhancedProjectionResult & { strategy: ProjectionStrategy }
  average: {
    rsiScore: number
    projectedSavings: number
    estimatedMonthlyIncome: number
  }
  spread: {
    rsiScore: number
    projectedSavings: number
    estimatedMonthlyIncome: number
  }
} {
  const best = results[0]
  const worst = results[results.length - 1]
  
  const average = {
    rsiScore: results.reduce((sum, r) => sum + r.rsiScore, 0) / results.length,
    projectedSavings: results.reduce((sum, r) => sum + r.projectedSavings, 0) / results.length,
    estimatedMonthlyIncome: results.reduce((sum, r) => sum + r.estimatedMonthlyIncome, 0) / results.length,
  }
  
  const spread = {
    rsiScore: best.rsiScore - worst.rsiScore,
    projectedSavings: best.projectedSavings - worst.projectedSavings,
    estimatedMonthlyIncome: best.estimatedMonthlyIncome - worst.estimatedMonthlyIncome,
  }
  
  return { best, worst, average, spread }
}

