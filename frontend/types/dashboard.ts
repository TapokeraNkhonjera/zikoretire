export interface DashboardStatsData {
  totalContributions: number
  projectedFund: number
  monthlyIncome: number
  rsi: number
}

export interface ChartPoint {
  year: string
  savings: number
  inflationAdjusted: number
}

export interface ActivityItem {
  title: string
  description: string
  time: string
}

export interface DashboardOverview {
  stats: DashboardStatsData
  chartData: ChartPoint[]
  activity: ActivityItem[]
}