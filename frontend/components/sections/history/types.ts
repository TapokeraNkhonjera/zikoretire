export type IncomeType =
  | "stable"
  | "flexible"
  | "seasonal"

export interface HistoryResult {
  projectedValue: number
  rsiScore: number
  readinessLevel: string
}

export interface HistorySimulation {
  id: string
  createdAt: string
  priority: boolean

  monthlyIncome: number
  incomeType: string

  result: {
    projectedValue: number
    estimatedMonthlyIncome: number
    inflationAdjustedValue: number
    rsiScore: number
    readinessLevel: string
  } | null
}