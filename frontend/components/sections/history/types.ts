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

  createdAt: Date   // keep as Date (good call)

  monthlyIncome: number

  incomeType: IncomeType   // ✅ NEW (used in table)

  result?: HistoryResult | null
}