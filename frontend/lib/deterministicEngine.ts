export type ProjectionStrategy =
  | "conservative"
  | "balanced"
  | "aggressive"
  | "informal"
  | "seasonal"
  | "inflation_stress"
  | "contribution_growth"
  | "early_retirement"
  | "sustainability"

export type RunInput = {
  age: number
  retirementAge: number
  monthlyIncome: number
  monthlyContribution: number
  currentSavings: number
  inflationRate: number
  projectionStrategy?: ProjectionStrategy
  growthModel: "stable" | "balanced" | "high"
  incomeType: "stable" | "flexible" | "seasonal"
  savingBehavior: "consistent" | "flexible" | "opportunistic"
  lifestyle: "basic" | "moderate" | "comfortable"
  historicalData?: any
}

export type DeterministicResult = {
  projectedSavings: number
  estimatedMonthlyIncome: number
  inflationAdjustedValue: number
  rsiScore: number
  meta: DeterministicMeta
}

export type DeterministicMeta = {
  projectionStrategy: ProjectionStrategy
  growthModel: string
  incomeType: string
  savingBehavior: string
  annualReturnRate: number
  adjustedContribution: number
  contributionConsistencyScore: number
  skippedMonths: number
  sustainabilityYears: number | null
  engine: string
  effectiveInflationRate: number
  yearsToRetirement: number
  totalMonths: number
  effectiveMonths: number
  strategyAdjustments: StrategyAdjustments
  // ML-related properties (optional)
  mlStatus?: string
  mlWarnings?: string[]
  mlRisk?: string
  mlRequestId?: string
  mlConfidence?: number
  mlPrediction?: number
  mlReadinessPercentage?: number
  mlFactorsCount?: number
  mlExplanation?: string
  mlAdvice?: string
  // Compliance properties
  complianceWarning?: string
  earlyRetirementPenalty?: number
  isFormalSector?: boolean
} | null

export type StrategyAdjustments = {
  returnRateMultiplier: number
  inflationAdjustment: number
  contributionMultiplier: number
  incomeFactor: number
  lifestyleFactor: number
  yearsAdjustment: number
}

// =========================================================
// STRATEGY CONFIGURATIONS
// =========================================================
const STRATEGY_CONFIGS: Record<ProjectionStrategy, StrategyAdjustments> = {
  conservative: {
    returnRateMultiplier: 0.85,
    inflationAdjustment: 0.03,
    contributionMultiplier: 1.0,
    incomeFactor: 1.0,
    lifestyleFactor: 1.0,
    yearsAdjustment: 0
  },
  balanced: {
    returnRateMultiplier: 1.0,
    inflationAdjustment: 0.0,
    contributionMultiplier: 1.0,
    incomeFactor: 1.0,
    lifestyleFactor: 1.0,
    yearsAdjustment: 0
  },
  aggressive: {
    returnRateMultiplier: 1.35,
    inflationAdjustment: -0.01,
    contributionMultiplier: 1.0,
    incomeFactor: 1.0,
    lifestyleFactor: 1.0,
    yearsAdjustment: 0
  },
  informal: {
    returnRateMultiplier: 0.9,
    inflationAdjustment: 0.02,
    contributionMultiplier: 0.85,
    incomeFactor: 0.9,
    lifestyleFactor: 1.0,
    yearsAdjustment: 0
  },
  seasonal: {
    returnRateMultiplier: 0.95,
    inflationAdjustment: 0.01,
    contributionMultiplier: 0.9,
    incomeFactor: 0.8,
    lifestyleFactor: 1.0,
    yearsAdjustment: 0
  },
  inflation_stress: {
    returnRateMultiplier: 0.8,
    inflationAdjustment: 0.08,
    contributionMultiplier: 1.0,
    incomeFactor: 1.0,
    lifestyleFactor: 1.0,
    yearsAdjustment: 0
  },
  contribution_growth: {
    returnRateMultiplier: 1.0,
    inflationAdjustment: 0.0,
    contributionMultiplier: 1.0,
    incomeFactor: 1.0,
    lifestyleFactor: 1.0,
    yearsAdjustment: 0
  },
  early_retirement: {
    returnRateMultiplier: 1.1,
    inflationAdjustment: 0.0,
    contributionMultiplier: 1.2,
    incomeFactor: 1.0,
    lifestyleFactor: 1.0,
    yearsAdjustment: -5
  },
  sustainability: {
    returnRateMultiplier: 0.95,
    inflationAdjustment: 0.015,
    contributionMultiplier: 1.0,
    incomeFactor: 1.0,
    lifestyleFactor: 1.0,
    yearsAdjustment: 0
  }
}

// =========================================================
// GROWTH MODEL CONFIGURATIONS
// =========================================================
const GROWTH_MODEL_RATES: Record<RunInput["growthModel"], number> = {
  stable: 0.06,
  balanced: 0.08,
  high: 0.12
}

// =========================================================
// COMPLIANCE FUNCTIONS (Malawi Pension Act 2023)
// =========================================================

// Strategy classification for compliance
function classifyStrategy(strategy: ProjectionStrategy): "formal" | "informal" {
  const formalStrategies: ProjectionStrategy[] = [
    "conservative", "balanced", "aggressive", "contribution_growth", 
    "sustainability", "early_retirement", "inflation_stress"
  ]
  const informalStrategies: ProjectionStrategy[] = ["informal", "seasonal"]
  
  if (formalStrategies.includes(strategy)) return "formal"
  if (informalStrategies.includes(strategy)) return "informal"
  
  // Default to formal for unknown strategies
  return "formal"
}

// Calculate early retirement penalty for formal sector
function calculateEarlyRetirementPenalty(
  retirementAge: number, 
  baseProjectedAmount: number
): { 
  adjustedAmount: number; 
  penaltyRate: number; 
  complianceWarning?: string 
} {
  const statutoryRetirementAge = 50
  
  // Only apply penalty if retirement age is below statutory age
  if (retirementAge >= statutoryRetirementAge) {
    return { 
      adjustedAmount: baseProjectedAmount, 
      penaltyRate: 0 
    }
  }
  
  // Calculate penalty: 3% per year below 50
  const yearsBelowStatutory = statutoryRetirementAge - retirementAge
  const penaltyRate = Math.pow(1 - 0.03, yearsBelowStatutory)
  const adjustedAmount = baseProjectedAmount * penaltyRate
  
  const complianceWarning = `Retiring before the statutory age of 50 in the formal sector results in a 3% annual benefit reduction per the Pension Act. Total reduction: ${((1 - penaltyRate) * 100).toFixed(1)}%`
  
  return { 
    adjustedAmount, 
    penaltyRate: 1 - penaltyRate, 
    complianceWarning 
  }
}

// Apply compliance adjustments to projection result
function applyComplianceAdjustments(
  baseResult: DeterministicResult,
  input: RunInput
): DeterministicResult {
  const strategy = input.projectionStrategy ?? "balanced"
  const isFormalSector = classifyStrategy(strategy) === "formal"
  
  // Start with base projected amount
  let adjustedProjectedSavings = baseResult.projectedSavings
  let complianceWarning: string | undefined
  let earlyRetirementPenalty: number | undefined
  
  if (isFormalSector) {
    // Apply early retirement penalty for formal sector
    const penaltyResult = calculateEarlyRetirementPenalty(
      input.retirementAge, 
      adjustedProjectedSavings
    )
    
    adjustedProjectedSavings = penaltyResult.adjustedAmount
    complianceWarning = penaltyResult.complianceWarning
    earlyRetirementPenalty = penaltyResult.penaltyRate
  }
  // Note: Informal sector exception - no penalty applied, just reduced compounding time
  
  // Update the result with compliance adjustments
  const baseMeta = baseResult.meta
  return {
    ...baseResult,
    projectedSavings: Math.round(adjustedProjectedSavings),
    estimatedMonthlyIncome: Math.round(adjustedProjectedSavings / (20 * 12)),
    inflationAdjustedValue: Math.round(adjustedProjectedSavings),
    meta: {
      projectionStrategy: strategy,
      growthModel: input.growthModel,
      incomeType: input.incomeType,
      savingBehavior: input.savingBehavior,
      annualReturnRate: baseMeta?.annualReturnRate || 0,
      adjustedContribution: baseMeta?.adjustedContribution || 0,
      contributionConsistencyScore: baseMeta?.contributionConsistencyScore || 1,
      skippedMonths: baseMeta?.skippedMonths || 0,
      sustainabilityYears: baseMeta?.sustainabilityYears || null,
      engine: baseMeta?.engine || "deterministic",
      effectiveInflationRate: baseMeta?.effectiveInflationRate || 0,
      yearsToRetirement: baseMeta?.yearsToRetirement || 0,
      totalMonths: baseMeta?.totalMonths || 0,
      effectiveMonths: baseMeta?.effectiveMonths || 0,
      strategyAdjustments: baseMeta?.strategyAdjustments || {
        returnRateMultiplier: 1,
        inflationAdjustment: 0,
        contributionMultiplier: 1,
        incomeFactor: 1,
        lifestyleFactor: 1,
        yearsAdjustment: 0
      },
      mlStatus: baseMeta?.mlStatus,
      mlWarnings: baseMeta?.mlWarnings,
      mlRisk: baseMeta?.mlRisk,
      mlRequestId: baseMeta?.mlRequestId,
      mlConfidence: baseMeta?.mlConfidence,
      mlPrediction: baseMeta?.mlPrediction,
      mlReadinessPercentage: baseMeta?.mlReadinessPercentage,
      mlFactorsCount: baseMeta?.mlFactorsCount,
      mlExplanation: baseMeta?.mlExplanation,
      mlAdvice: baseMeta?.mlAdvice,
      complianceWarning,
      earlyRetirementPenalty,
      isFormalSector
    }
  }
}

// =========================================================
// BEHAVIORAL ADJUSTMENTS
// =========================================================
function getBehavioralAdjustments(input: RunInput): {
  contributionMultiplier: number
  incomeFactor: number
  lifestyleFactor: number
} {
  let contributionMultiplier = 1.0
  let incomeFactor = 1.0
  let lifestyleFactor = 1.0

  // Saving behavior adjustments
  if (input.savingBehavior === "flexible") contributionMultiplier *= 0.9
  if (input.savingBehavior === "opportunistic") contributionMultiplier *= 1.2

  // Income type adjustments
  if (input.incomeType === "flexible") incomeFactor = 0.9
  if (input.incomeType === "seasonal") incomeFactor = 0.8

  // Lifestyle adjustments
  if (input.lifestyle === "basic") lifestyleFactor = 0.7
  if (input.lifestyle === "comfortable") lifestyleFactor = 1.3

  return { contributionMultiplier, incomeFactor, lifestyleFactor }
}

// =========================================================
// CORE CALCULATION ENGINE
// =========================================================
function calculateBaseProjection(input: RunInput, strategy: ProjectionStrategy): {
  annualReturnRate: number
  adjustedContribution: number
  effectiveInflation: number
  yearsToRetirement: number
  totalMonths: number
  effectiveMonths: number
  contributionConsistencyScore: number
  skippedMonths: number
} {
  const strategyConfig = STRATEGY_CONFIGS[strategy]
  const behavioralAdjustments = getBehavioralAdjustments(input)

  // Base return rate from growth model
  let annualReturnRate = GROWTH_MODEL_RATES[input.growthModel]
  
  // Apply strategy adjustment
  annualReturnRate *= strategyConfig.returnRateMultiplier

  // Apply behavioral adjustments
  const adjustedContribution = input.monthlyContribution * 
    strategyConfig.contributionMultiplier * 
    behavioralAdjustments.contributionMultiplier

  // Calculate time horizon
  let yearsToRetirement = input.retirementAge - input.age + strategyConfig.yearsAdjustment
  yearsToRetirement = Math.max(1, yearsToRetirement)
  const totalMonths = yearsToRetirement * 12

  // Calculate effective inflation
  const baseInflation = input.inflationRate / 100
  const effectiveInflation = Math.min(0.6, baseInflation + strategyConfig.inflationAdjustment)

  // Calculate contribution consistency
  let contributionConsistencyScore = 1.0
  let skippedMonths = 0
  let effectiveMonths = totalMonths

  // Strategy-specific contribution patterns
  if (strategy === "informal") {
    // 1 month skipped every quarter (25%)
    skippedMonths = Math.floor(totalMonths * 0.25)
    effectiveMonths = Math.max(1, totalMonths - skippedMonths)
    contributionConsistencyScore = effectiveMonths / totalMonths
  } else if (strategy === "seasonal") {
    contributionConsistencyScore = 0.75
    // 8 dry months every year
    skippedMonths = Math.floor(totalMonths * (8/12))
    effectiveMonths = Math.max(1, totalMonths - skippedMonths)
  }

  return {
    annualReturnRate,
    adjustedContribution,
    effectiveInflation,
    yearsToRetirement,
    totalMonths,
    effectiveMonths,
    contributionConsistencyScore,
    skippedMonths
  }
}

// =========================================================
// CONTRIBUTION CALCULATION STRATEGIES
// =========================================================
function calculateFutureContributions(
  input: RunInput,
  strategy: ProjectionStrategy,
  baseCalc: ReturnType<typeof calculateBaseProjection>
): number {
  const { adjustedContribution, totalMonths } = baseCalc
  const monthlyRate = baseCalc.annualReturnRate / 12

  let futureValue = 0

  for (let m = 1; m <= totalMonths; m++) {
    // 1. Compound existing balance
    futureValue = futureValue * (1 + monthlyRate)
    
    // 2. Add new contribution
    let monthlyCont = adjustedContribution
    
    switch (strategy) {
      case "seasonal": {
        // 4 months harvest, 8 months dry. Total annual contribution is preserved (4 * 3.0 = 12)
        const monthInYear = m % 12
        if (monthInYear > 0 && monthInYear <= 4) {
           monthlyCont = adjustedContribution * 3.0
        } else {
           monthlyCont = 0
        }
        break;
      }
      case "contribution_growth": {
        const yearsPassed = Math.floor((m - 1) / 12)
        monthlyCont = adjustedContribution * Math.pow(1 + 0.07, yearsPassed)
        break;
      }
      case "informal": {
        // Skips 1 month every quarter (e.g. months 3, 6, 9, 12) to simulate gig volatility
        if (m % 3 === 0) {
           monthlyCont = 0
        }
        break;
      }
      default: {
        break;
      }
    }
    
    futureValue += monthlyCont
  }

  return futureValue
}

// =========================================================
// MAIN DETERMINISTIC ENGINE
// =========================================================
export function buildDeterministicProjection(input: RunInput): DeterministicResult {
  const strategy: ProjectionStrategy = input.projectionStrategy ?? "balanced"
  const strategyConfig = STRATEGY_CONFIGS[strategy]
  const behavioralAdjustments = getBehavioralAdjustments(input)

  // Calculate base projection parameters
  const baseCalc = calculateBaseProjection(input, strategy)

  // Calculate future value of contributions
  const futureValueContributions = calculateFutureContributions(input, strategy, baseCalc)

  // Calculate future value of current savings
  const monthlyRate = baseCalc.annualReturnRate / 12
  const futureValueSavings = input.currentSavings * Math.pow(1 + monthlyRate, baseCalc.totalMonths)

  // Total estimated savings
  const estimatedSavings = futureValueContributions + futureValueSavings

  // Inflation adjustment
  const inflationAdjustedSavings = estimatedSavings * 
    Math.pow(1 - baseCalc.effectiveInflation, baseCalc.yearsToRetirement)

  // Calculate RSI (Retirement Sustainability Index)
  const combinedIncomeFactor = strategyConfig.incomeFactor * behavioralAdjustments.incomeFactor
  const combinedLifestyleFactor = strategyConfig.lifestyleFactor * behavioralAdjustments.lifestyleFactor
  
  const requiredSavings = input.monthlyIncome * 12 * baseCalc.yearsToRetirement * 
    combinedLifestyleFactor * combinedIncomeFactor

  const rsi = requiredSavings > 0 ? inflationAdjustedSavings / requiredSavings : 0
  const rsiScore = Math.min(rsi * 100, 100)

  // Calculate sustainability for sustainability strategy
  let sustainabilityYears: number | null = null
  if (strategy === "sustainability") {
    const annualNeed = input.monthlyIncome * 12 * combinedLifestyleFactor * combinedIncomeFactor
    sustainabilityYears = annualNeed > 0 ? inflationAdjustedSavings / annualNeed : 0
  }

  const baseResult = {
    projectedSavings: Math.round(inflationAdjustedSavings),
    estimatedMonthlyIncome: Math.round(inflationAdjustedSavings / (20 * 12)),
    inflationAdjustedValue: Math.round(inflationAdjustedSavings),
    rsiScore: Number(rsiScore.toFixed(1)),
    meta: {
      projectionStrategy: strategy,
      growthModel: input.growthModel,
      incomeType: input.incomeType,
      savingBehavior: input.savingBehavior,
      annualReturnRate: baseCalc.annualReturnRate,
      adjustedContribution: baseCalc.adjustedContribution,
      contributionConsistencyScore: Number(baseCalc.contributionConsistencyScore.toFixed(3)),
      skippedMonths: baseCalc.skippedMonths,
      sustainabilityYears,
      engine: "deterministic",
      effectiveInflationRate: baseCalc.effectiveInflation,
      yearsToRetirement: baseCalc.yearsToRetirement,
      totalMonths: baseCalc.totalMonths,
      effectiveMonths: baseCalc.effectiveMonths,
      strategyAdjustments: strategyConfig
    }
  }

  // Apply compliance adjustments (Malawi Pension Act 2023)
  return applyComplianceAdjustments(baseResult, input)
}

// =========================================================
// UTILITY FUNCTIONS
// =========================================================
export function generateProjectionCurve(input: RunInput, stepYears: number = 1): { year: string, savings: number, inflationAdjusted: number }[] {
  const strategy: ProjectionStrategy = input.projectionStrategy ?? "balanced"
  const strategyConfig = STRATEGY_CONFIGS[strategy]
  const behavioralAdjustments = getBehavioralAdjustments(input)

  const baseCalc = calculateBaseProjection(input, strategy)
  
  const curve = []
  const currentYear = new Date().getFullYear()
  const monthlyRate = baseCalc.annualReturnRate / 12

  const totalMonths = baseCalc.yearsToRetirement * 12
  const stepMonths = Math.max(1, Math.round(stepYears * 12)) 

  let currentSavingsBalance = input.currentSavings || 0
  const totalSkippedAllowed = strategy === "informal" 
      ? Math.min(10, Math.round(totalMonths * 0.08)) 
      : 0

  curve.push({
    year: currentYear.toString(),
    savings: Math.round(currentSavingsBalance),
    inflationAdjusted: Math.round(currentSavingsBalance)
  })

  for (let m = 1; m <= totalMonths; m++) {
    
    currentSavingsBalance = currentSavingsBalance * (1 + monthlyRate)
    
    // Default standard contribution (used as base for all strategies)
    let monthlyCont = baseCalc.adjustedContribution
    let historicalProbability = 1.0;
    
    // If we have highly accurate historical data, override generic strategies
    if (input.historicalData && input.historicalData.depositProbabilityMap) {
      const monthInYear = m % 12;
      historicalProbability = input.historicalData.depositProbabilityMap[monthInYear] ?? 0;
      // In historical mode, the engine uses the probability of deposit per month.
      // If they skip this month historically, we skip. Otherwise they deposit base.
      // We'll deterministically map the probability to a binary or scaled contribution.
      // e.g. if probability is 1 (always deposited), they deposit. If 0, they don't.
      monthlyCont = baseCalc.adjustedContribution * historicalProbability;
    } else {
      // Execute generic ML-inferred strategies
      switch (strategy) {
        case "seasonal": {
          const monthInYear = m % 12
          // Harvest months: May(4), Jun(5), Jul(6), Aug(7)
          if (monthInYear >= 4 && monthInYear <= 7) {
             monthlyCont = baseCalc.adjustedContribution * 3.0
          } else {
             monthlyCont = 0
          }
          break;
        }
        case "informal": {
           // Skip ~25% of months to simulate freelance volatility
           if ((m * 17) % 4 === 0) { 
              monthlyCont = 0
           }
           break;
        }
        case "balanced":
        default:
          // Keep it as baseCalc.adjustedContribution
          break;
      }
    }
    
    currentSavingsBalance += monthlyCont

    if (m % stepMonths === 0 || m === totalMonths) {
      const yearsElapsed = m / 12
      const yearNum = currentYear + Math.floor(yearsElapsed)
      let yearStr = yearNum.toString()
      
      if (stepMonths === 1) { 
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const currentMonthIndex = new Date().getMonth()
        const totalMonthsAbsolute = currentMonthIndex + m
        const targetMonthIndex = totalMonthsAbsolute % 12
        const yearOffset = Math.floor(totalMonthsAbsolute / 12)
        const actualYearNum = currentYear + yearOffset
        yearStr = `${monthNames[targetMonthIndex]} '${actualYearNum.toString().slice(2)}`
      }
      
      const inflationAdjustedSavings = currentSavingsBalance * Math.pow(1 - baseCalc.effectiveInflation, yearsElapsed)

      const isDuplicate = curve.length > 0 && curve[curve.length - 1].year === yearStr
      
      if (!isDuplicate) {
        curve.push({
          year: yearStr,
          savings: Math.round(currentSavingsBalance),
          inflationAdjusted: Math.round(inflationAdjustedSavings)
        })
      }
    }
  }

  return curve
}
export function getStrategyDescription(strategy: ProjectionStrategy): string {
  const descriptions: Record<ProjectionStrategy, string> = {
    conservative: "Lower growth assumptions with higher inflation sensitivity for safer long-term stability",
    balanced: "Moderate growth assumptions with balanced risk management for steady retirement planning",
    aggressive: "Higher growth assumptions with increased volatility for better long-term upside potential",
    informal: "Designed for inconsistent monthly contributions with skipped months and income volatility",
    seasonal: "Optimized for seasonal income patterns with fluctuating contribution cycles",
    inflation_stress: "Simulates high inflation environments showing purchasing power erosion effects",
    contribution_growth: "Models increasing yearly contributions with salary growth and promotions",
    early_retirement: "Higher pressure planning with shorter accumulation period for early retirement goals",
    sustainability: "Estimates retirement income duration and long-term pension sustainability"
  }
  
  return descriptions[strategy] || "Standard projection strategy"
}

export function validateProjectionInput(input: Partial<RunInput>): string[] {
  const errors: string[] = []
  
  if (!input.age || input.age < 18 || input.age > 70) {
    errors.push("Age must be between 18 and 70")
  }
  
  if (!input.retirementAge || input.retirementAge < input.age! + 1 || input.retirementAge > 80) {
    errors.push("Retirement age must be greater than current age and less than 80")
  }
  
  if (!input.monthlyIncome || input.monthlyIncome < 0) {
    errors.push("Monthly income must be positive")
  }
  
  if (!input.monthlyContribution || input.monthlyContribution < 0) {
    errors.push("Monthly contribution must be positive")
  }
  
  if (input.monthlyContribution! > input.monthlyIncome! * 0.5) {
    errors.push("Monthly contribution should not exceed 50% of monthly income")
  }
  
  if (input.currentSavings && input.currentSavings < 0) {
    errors.push("Current savings cannot be negative")
  }
  
  if (input.inflationRate && (input.inflationRate < 0 || input.inflationRate > 50)) {
    errors.push("Inflation rate should be between 0% and 50%")
  }
  
  return errors
}