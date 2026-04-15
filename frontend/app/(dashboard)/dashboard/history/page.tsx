import HistoryClient from "@/components/sections/history/HistoryClient"
import { HistorySimulation } from "@/components/sections/history/types"

const simulations: HistorySimulation[] = [
  {
    id: "1",
    createdAt: new Date("2026-04-13"),
    monthlyIncome: 250000,
    incomeType: "stable",
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
    incomeType: "flexible",
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
    incomeType: "seasonal",
    result: {
      projectedValue: 2100000,
      rsiScore: 34.8,
      readinessLevel: "At Risk"
    }
  }
]

export default function HistoryPage() {

  return (

    <div className="flex flex-col gap-6 pt-12 lg:gap-8">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          Simulation History
        </h2>

        <p className="mt-1 text-muted-foreground">
          Review past projections and track your retirement readiness over time.
        </p>
      </div>

      {/* CONTENT */}
      <HistoryClient simulations={simulations} />

    </div>

  )
}