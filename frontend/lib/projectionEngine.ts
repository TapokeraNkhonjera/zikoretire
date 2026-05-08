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
}

export type DeterministicResult = {
  projectedSavings: number
  estimatedMonthlyIncome: number
  inflationAdjustedValue: number
  rsiScore: number
  meta: Record<string, unknown>
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

export function buildDeterministicProjection(input: RunInput): DeterministicResult {
  const strategy: ProjectionStrategy = input.projectionStrategy ?? "balanced"

  // Growth model → return rate
  let annualReturnRate = 0.08
  if (input.growthModel === "stable") annualReturnRate = 0.06
  if (input.growthModel === "balanced") annualReturnRate = 0.08
  if (input.growthModel === "high") annualReturnRate = 0.12

  // Strategy adjustments (deterministic, Malawi-friendly defaults)
  if (strategy === "conservative") annualReturnRate = Math.min(annualReturnRate, 0.065)
  if (strategy === "aggressive") annualReturnRate = Math.max(annualReturnRate, 0.11)

  // Saving behavior → contribution adjustment
  let adjustedContribution = input.monthlyContribution
  if (input.savingBehavior === "flexible") adjustedContribution *= 0.9
  if (input.savingBehavior === "opportunistic") adjustedContribution *= 1.2

  // Income type → risk adjustment
  let incomeFactor = 1
  if (input.incomeType === "flexible") incomeFactor = 0.9
  if (input.incomeType === "seasonal") incomeFactor = 0.8

  // Lifestyle
  let lifestyleFactor = 1
  if (input.lifestyle === "basic") lifestyleFactor = 0.7
  if (input.lifestyle === "comfortable") lifestyleFactor = 1.3

  let yearsToRetirement = input.retirementAge - input.age
  if (strategy === "early_retirement") yearsToRetirement = Math.max(0, yearsToRetirement - 5)

  const monthlyRate = annualReturnRate / 12
  const totalMonths = yearsToRetirement * 12

  let futureValueContributions =
    adjustedContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)

  let contributionConsistencyScore = 1
  let skippedMonths = 0

  if (strategy === "informal") {
    skippedMonths = Math.min(10, Math.max(0, Math.round(totalMonths * 0.08)))
    const effectiveMonths = Math.max(1, totalMonths - skippedMonths)
    contributionConsistencyScore = effectiveMonths / Math.max(1, totalMonths)
    futureValueContributions =
      adjustedContribution * ((Math.pow(1 + monthlyRate, effectiveMonths) - 1) / monthlyRate)
  }

  if (strategy === "seasonal") {
    const peakMonths = Math.round((totalMonths / 12) * 4)
    const weakMonths = Math.max(0, totalMonths - peakMonths)
    const peakContribution = adjustedContribution * 1.6
    const weakContribution = adjustedContribution * 0.6
    const fvPeak =
      peakContribution * ((Math.pow(1 + monthlyRate, peakMonths) - 1) / monthlyRate)
    const fvWeak =
      weakContribution * ((Math.pow(1 + monthlyRate, weakMonths) - 1) / monthlyRate)
    futureValueContributions = fvPeak + fvWeak
    contributionConsistencyScore = 0.75
  }

  if (strategy === "contribution_growth") {
    const annualGrowth = 0.07
    let fv = 0
    for (let y = 0; y < yearsToRetirement; y++) {
      const yearlyContribution = adjustedContribution * Math.pow(1 + annualGrowth, y)
      const monthsRemaining = (yearsToRetirement - y) * 12
      fv += yearlyContribution * ((Math.pow(1 + monthlyRate, monthsRemaining) - 1) / monthlyRate)
    }
    futureValueContributions = fv
  }

  const futureValueSavings = input.currentSavings * Math.pow(1 + monthlyRate, totalMonths)
  const estimatedSavings = futureValueContributions + futureValueSavings

  const inflationDecimal = input.inflationRate / 100
  let effectiveInflation = inflationDecimal
  if (strategy === "inflation_stress") effectiveInflation = Math.min(0.6, inflationDecimal + 0.08)
  if (strategy === "conservative") effectiveInflation = Math.min(0.6, inflationDecimal + 0.03)
  const inflationAdjustedSavings = estimatedSavings * Math.pow(1 - effectiveInflation, yearsToRetirement)

  const requiredSavings =
    input.monthlyIncome * 12 * yearsToRetirement * lifestyleFactor * incomeFactor

  const rsi = requiredSavings > 0 ? inflationAdjustedSavings / requiredSavings : 0
  const rsiScore = Math.min(rsi * 100, 100)

  let sustainabilityYears: number | null = null
  if (strategy === "sustainability") {
    const annualNeed = input.monthlyIncome * 12 * lifestyleFactor
    sustainabilityYears = annualNeed > 0 ? inflationAdjustedSavings / annualNeed : 0
  }

  return {
    projectedSavings: Math.round(inflationAdjustedSavings),
    estimatedMonthlyIncome: Math.round(inflationAdjustedSavings / (20 * 12)),
    inflationAdjustedValue: Math.round(inflationAdjustedSavings),
    rsiScore: Number(rsiScore.toFixed(1)),
    meta: {
      projectionStrategy: strategy,
      growthModel: input.growthModel,
      incomeType: input.incomeType,
      savingBehavior: input.savingBehavior,
      annualReturnRate,
      adjustedContribution,
      contributionConsistencyScore: Number(contributionConsistencyScore.toFixed(3)),
      skippedMonths,
      sustainabilityYears:
        typeof sustainabilityYears === "number"
          ? Number(sustainabilityYears.toFixed(2))
          : null,
      engine: "rule-v2",
    },
  }
}

