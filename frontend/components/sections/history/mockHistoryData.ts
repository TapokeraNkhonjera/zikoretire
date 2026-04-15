import { HistorySimulation } from "./types"

export const mockHistoryData: HistorySimulation[] = [

  {
    id: "1",
    createdAt: new Date("2026-04-13"),
    monthlyIncome: 250000,
    result: {
      projectedValue: 8500000,
      rsiScore: 72.5,
      readinessLevel: "Ready"
    }
  },

  {
    id: "2",
    createdAt: new Date("2026-03-18"),
    monthlyIncome: 180000,
    result: {
      projectedValue: 5200000,
      rsiScore: 55.2,
      readinessLevel: "Moderate"
    }
  },

  {
    id: "3",
    createdAt: new Date("2026-02-02"),
    monthlyIncome: 95000,
    result: {
      projectedValue: 2100000,
      rsiScore: 34.8,
      readinessLevel: "At Risk"
    }
  }

]