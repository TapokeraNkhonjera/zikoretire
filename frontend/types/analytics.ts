export interface AnalyticsScenario {
  name: string
  result: {
    projectedValue: number
    estimatedMonthlyIncome: number
    rsiScore: number
    riskScore: number | null
    confidenceScore: number | null
  }
}

export interface AnalyticsData {
  id: string
  name: string

  result: {
    projectedValue: number
    estimatedMonthlyIncome: number
    rsiScore: number
    riskScore: number | null
    confidenceScore: number | null
  }

  scenarios: AnalyticsScenario[]

  recommendations: {
    message: string
    type: string
  }[]
}