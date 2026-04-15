export interface HistoryResult {
  projectedValue: number
  rsiScore: number
  readinessLevel: string
}

export interface HistorySimulation {
  id: string
  createdAt: Date   // IMPORTANT: keep Date only
  monthlyIncome: number
  result?: HistoryResult | null
}