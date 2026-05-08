export interface ProjectionInputs {
  currentAge: string
  retirementAge: string

  monthlyIncome: string
  currentSavings: string

  monthlyContribution: string

  projectionStrategy:
    | "conservative"
    | "balanced"
    | "aggressive"
    | "informal"
    | "seasonal"
    | "inflation_stress"
    | "contribution_growth"
    | "early_retirement"
    | "sustainability"

  incomeType: "stable" | "flexible" | "seasonal"
  savingBehavior: "consistent" | "flexible" | "opportunistic"

  growthModel: "stable" | "balanced" | "high"

  inflationRate: string

  includeIrregular: boolean
  extraContribution: string
}