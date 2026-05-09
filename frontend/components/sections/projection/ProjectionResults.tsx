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
import ModelConfidenceBadge from "@/components/sections/shared/ModelConfidenceBadge"

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

export interface ProjectionMeta {
  growthModel: string
  incomeType: string
  savingBehavior: string
  annualReturnRate: number
  adjustedContribution: number
  engine: string
  mlStatus?: string
  mlWarnings?: string[]
  mlRisk?: string
  mlRequestId?: string | null
  mlConfidence?: number | null
  mlPrediction?: number | null
  mlReadinessPercentage?: number | null
  mlFactorsCount?: number
  mlExplanation?: string | null
  mlAdvice?: string | null
}

export interface ProjectionResult {
  projectedSavings: number
  estimatedMonthlyIncome: number
  inflationAdjustedValue: number
  rsiScore: number
  meta?: ProjectionMeta
}

/* ===============================
   COMPONENT
================================ */

export default function ProjectionResults({
  results,
  isDirty,
  onSave,
  saveLabel,
  isBase = true,
  hasScenarios = false,
  onSaveWithScenarios
}: {
  results: ProjectionResult | null
  isDirty?: boolean
  onSave: (data: ProjectionResult) => void | Promise<void>
  saveLabel?: string
  isBase?: boolean
  hasScenarios?: boolean
  onSaveWithScenarios?: (data: ProjectionResult) => void | Promise<void>
}) {

  const isEmpty = !results

  /* ===============================
     CHART DATA (SAFE)
  ================================= */

  const chartData = results
    ? [
        {
          name: "Projection",
          Savings: results.projectedSavings,
          AnnualIncome: results.estimatedMonthlyIncome * 12,
          InflationAdjusted: results.inflationAdjustedValue
        }
      ]
    : []

  return (
    <div className="w-full max-w-[900px] mx-auto space-y-6">

      {/* ================= EMPTY STATE ================= */}
      {isEmpty ? (
        <div className="flex items-center justify-center h-64 text-sm border border-dashed text-muted-foreground rounded-xl">
          Run a simulation to view results
        </div>
      ) : (
        <>

          {/* ================= WARNING ================= */}
          {isDirty && (
            <div className="p-3 text-sm border rounded-md bg-amber-500/10 text-amber-500 border-amber-500/20">
              ⚠️ Inputs have changed. Recalculate to see updated results.
            </div>
          )}

          {results.meta?.mlWarnings?.includes("ML_FALLBACK_RULE_ENGINE") && (
            <div className="p-3 text-sm border rounded-md bg-amber-500/10 text-amber-600 border-amber-500/20">
              ML response was delayed or unavailable. A safe fallback engine was used for this result.
            </div>
          )}

          {/* ================= RESULT CARDS ================= */}
          <div className="grid gap-4 sm:grid-cols-2">

            <ResultCard
              icon={<Wallet className="w-5 h-5 text-primary" />}
              label="Projected Savings"
              value={`MWK ${results.projectedSavings.toLocaleString()}`}
            />

            <ResultCard
              icon={<Banknote className="w-5 h-5 text-muted-foreground" />}
              label="Monthly Income"
              value={`MWK ${results.estimatedMonthlyIncome.toLocaleString()}`}
            />

            <ResultCard
              icon={<TrendingDown className="w-5 h-5 text-muted-foreground" />}
              label="Inflation Adjusted"
              value={`MWK ${results.inflationAdjustedValue.toLocaleString()}`}
            />

            <ResultCard
              icon={<Gauge className="w-5 h-5 text-muted-foreground" />}
              label="RSI Score"
              value={`${results.rsiScore.toFixed(1)}%`}
            />

          </div>

          {/* ================= RSI BAR ================= */}
          <RsiBar score={results.rsiScore} />

          {/* ================= META ================= */}
          {results.meta && (
            <div className="p-4 space-y-3 border rounded-xl bg-muted/30">

              <p className="text-sm font-semibold text-foreground">
                Strategy Breakdown
              </p>
              <ModelConfidenceBadge confidence={results.meta.mlConfidence} />

              <div className="grid grid-cols-2 gap-3 text-sm">

                <div>
                  <span className="text-muted-foreground">Growth Model:</span>
                  <p className="font-medium capitalize">
                    {results.meta.growthModel}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground">Income Type:</span>
                  <p className="font-medium capitalize">
                    {results.meta.incomeType}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground">Saving Behavior:</span>
                  <p className="font-medium capitalize">
                    {results.meta.savingBehavior}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground">Return Rate:</span>
                  <p className="font-medium">
                    {(results.meta.annualReturnRate * 100).toFixed(1)}%
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground">Engine:</span>
                  <p className="font-medium">
                    {results.meta.engine === "ml-v1" ? "ZikoML" : "Rule Fallback"}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground">ML Status:</span>
                  <p className="font-medium capitalize">
                    {results.meta.mlStatus ?? "not_checked"}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground">ML Confidence:</span>
                  <p className="font-medium">
                    {typeof results.meta.mlConfidence === "number"
                      ? `${(results.meta.mlConfidence * 100).toFixed(1)}%`
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground">ML Risk:</span>
                  <p className="font-medium">
                    {results.meta.mlRisk ?? "UNKNOWN"}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground">ML Factors:</span>
                  <p className="font-medium">
                    {typeof results.meta.mlFactorsCount === "number"
                      ? results.meta.mlFactorsCount
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground">ML Request ID:</span>
                  <p className="font-medium break-all">
                    {results.meta.mlRequestId ?? "N/A"}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground">Adjusted Contribution:</span>
                  <p className="font-medium">
                    MWK {results.meta.adjustedContribution.toLocaleString()}
                  </p>
                </div>

              </div>

              {results.meta.mlExplanation && (
                <div className="pt-2 text-sm">
                  <p className="font-semibold text-foreground">ML Explanation</p>
                  <p className="text-muted-foreground">{results.meta.mlExplanation}</p>
                </div>
              )}

            </div>
          )}

          {/* ================= INSIGHTS ================= */}
          {results.meta && (
            <div className="text-xs text-muted-foreground">

              {results.meta.growthModel === "high" &&
                "Higher growth model increases potential returns but comes with more variability."}

              {results.meta.growthModel === "stable" &&
                "Stable growth prioritizes consistency over aggressive returns."}

              {results.meta.incomeType === "seasonal" &&
                "Seasonal income reduces projection confidence due to irregular cash flow."}

              {results.meta.savingBehavior === "opportunistic" &&
                "Opportunistic saving boosts long-term growth when extra funds are available."}

            </div>
          )}

          {/* ================= CHART ================= */}
          <div className="p-5 border border-border/60 rounded-xl bg-card">

            <div className="mb-4">
              <p className="text-sm font-semibold text-foreground">
                Projection Overview
              </p>
              <p className="text-xs text-muted-foreground">
                Savings vs annual income vs inflation impact
              </p>
            </div>

            <div className="w-full min-h-[260px]">
              <ResponsiveContainer width="100%" height={260}>

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
                    tickFormatter={(value: number) =>
                      `${(value / 1000000).toFixed(1)}M`
                    }
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.9 0 0)",
                      borderRadius: "12px"
                    }}
                    formatter={(value: unknown) => {
                      const safeValue =
                        typeof value === "number"
                          ? value
                          : Number(value ?? 0)

                      return [`MWK ${safeValue.toLocaleString()}`, ""]
                    }}
                  />

                  <Legend />

                  <Bar
                    dataKey="Savings"
                    fill="oklch(0.45 0.25 264)"
                    radius={[6, 6, 0, 0]}
                  />

                  <Bar
                    dataKey="AnnualIncome"
                    fill="oklch(0.55 0.15 264)"
                    radius={[6, 6, 0, 0]}
                  />

                  <Bar
                    dataKey="InflationAdjusted"
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
              {hasScenarios ? "Save Simulation & All Scenarios" : "Save Simulation"}
            </Button>

          </div>

        </>
      )}

    </div>
  )
}