export interface ProjectionInputs {
  currentAge: string
  retirementAge: string

  monthlyIncome: string
  currentSavings: string

  monthlyContribution: string

  incomeType: "stable" | "flexible" | "seasonal"
  savingBehavior: "consistent" | "flexible" | "opportunistic"

  growthModel: "stable" | "balanced" | "high"

  inflationRate: string

  includeIrregular: boolean
  extraContribution: string
}