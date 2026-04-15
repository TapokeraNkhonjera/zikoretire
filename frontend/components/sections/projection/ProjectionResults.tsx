"use client"

import { Button } from "@/components/ui/button"
import {
  Wallet,
  Banknote,
  TrendingDown,
  Gauge
} from "lucide-react"

import ResultCard from "./ResultsCard"
import RsiBar from "./RsiBar"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"

/* ===============================
   TYPES
================================ */

export interface ProjectionResult {
  projectedSavings: number
  estimatedMonthlyIncome: number
  inflationAdjustedValue: number
  rsiScore: number
}

/* ===============================
   COMPONENT
================================ */

export default function ProjectionResults({
  results,
  onSave,
  onAddScenario
}: {
  results: ProjectionResult | null
  onSave: (data: ProjectionResult) => void
  onAddScenario: () => void
}) {

  if (!results) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Run a simulation to view results
      </div>
    )
  }

  /* ===============================
     CHART DATA
  ================================= */

  const chartData = [
    {
      name: "Projection",
      Savings: results.projectedSavings,
      Income: results.estimatedMonthlyIncome * 100,
      Inflation: results.inflationAdjustedValue
    }
  ]

  return (
    <div className="space-y-6">

      {/* ================= RESULT CARDS ================= */}
      <div className="grid gap-4 sm:grid-cols-2">

        <ResultCard
          icon={<Wallet className="w-5 h-5 text-primary" />}
          label="Projected Savings"
          value={`MK ${results.projectedSavings.toLocaleString()}`}
        />

        <ResultCard
          icon={<Banknote className="w-5 h-5 text-primary" />}
          label="Monthly Income"
          value={`MK ${results.estimatedMonthlyIncome.toLocaleString()}`}
        />

        <ResultCard
          icon={<TrendingDown className="w-5 h-5 text-primary" />}
          label="Inflation Adjusted"
          value={`MK ${results.inflationAdjustedValue.toLocaleString()}`}
        />

        <ResultCard
          icon={<Gauge className="w-5 h-5 text-primary" />}
          label="RSI Score"
          value={`${results.rsiScore}%`}
        />

      </div>

      {/* ================= RSI BAR ================= */}
      <RsiBar score={results.rsiScore} />

      {/* ================= CHART ================= */}
      <div className="p-4 border rounded-xl bg-card">

        <div className="mb-3">
          <p className="text-sm font-semibold text-foreground">
            Projection Overview
          </p>
          <p className="text-xs text-muted-foreground">
            Savings vs income vs inflation impact
          </p>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>

              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
              />

              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                className="text-xs fill-muted-foreground"
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                className="text-xs fill-muted-foreground"
                tickFormatter={(value) =>
                  `${(value / 1000000).toFixed(1)}M`
                }
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(1 0 0)",
                  border: "1px solid oklch(0.9 0 0)",
                  borderRadius: "12px"
                }}
                formatter={(value: unknown, name: string) => {
                  let safeValue = 0

                  if (typeof value === "number") {
                    safeValue = value
                  } else if (typeof value === "string") {
                    safeValue = Number(value)
                  } else if (Array.isArray(value)) {
                    safeValue = Number(value[0] ?? 0)
                  }

                  return [`MK ${safeValue.toLocaleString()}`, name]
                }}
              />

              <Legend />

              {/* 🔵 BRAND COLORS */}
              <Bar
                dataKey="Savings"
                fill="oklch(0.45 0.25 264)"
                radius={[6, 6, 0, 0]}
              />

              <Bar
                dataKey="Income"
                fill="oklch(0.55 0.15 264)"
                radius={[6, 6, 0, 0]}
              />

              <Bar
                dataKey="Inflation"
                fill="oklch(0.35 0.1 264)"
                radius={[6, 6, 0, 0]}
              />

            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= ACTION BUTTONS ================= */}
      <div className="flex gap-3 pt-2">

        <Button
          className="flex-1 h-11"
          onClick={() => onSave(results)}
        >
          Save Simulation
        </Button>

        <Button
          variant="outline"
          onClick={onAddScenario}
          className="h-11"
        >
          Add Scenario
        </Button>

      </div>

    </div>
  )
}