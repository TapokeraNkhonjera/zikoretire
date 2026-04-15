export interface AnalyticsScenario {
  name: string
  result: {
    projectedValue: number
    monthlyRetirementIncome?: number
    rsiScore: number
  }
}

export interface AnalyticsData {
  id: string
  name?: string

  result: {
    projectedValue: number
    monthlyRetirementIncome?: number
    rsiScore: number
  }

  scenarios: AnalyticsScenario[]

  recommendations?: {
    message: string
    type: string
  }[]
}