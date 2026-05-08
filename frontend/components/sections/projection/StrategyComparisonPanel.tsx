"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import ModelConfidenceBadge from "@/components/sections/shared/ModelConfidenceBadge"
import { ProjectionInputs } from "@/types/ProjectionInputs"

type ComparisonRow = {
  strategy: string
  rsiScore: number
  projectedSavings: number
  estimatedMonthlyIncome: number
  inflationAdjustedValue: number
  meta?: {
    engine?: string
    mlConfidence?: number | null
    mlRisk?: string
    mlWarnings?: string[]
  }
}

type Props = {
  inputs: ProjectionInputs
  baseRsiScore?: number | null
}

function formatStrategyLabel(strategy: string) {
  return strategy
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function StrategyComparisonPanel({ inputs, baseRsiScore }: Props) {
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<ComparisonRow[] | null>(null)
  const [best, setBest] = useState<ComparisonRow | null>(null)
  const [worst, setWorst] = useState<ComparisonRow | null>(null)
  const [error, setError] = useState<string | null>(null)

  const payload = useMemo(() => {
    return {
      age: Number(inputs.currentAge),
      retirementAge: Number(inputs.retirementAge),
      monthlyIncome: Number(inputs.monthlyIncome),
      monthlyContribution: Number(inputs.monthlyContribution),
      currentSavings: Number(inputs.currentSavings || 0),
      inflationRate: Number(inputs.inflationRate || 0),
      growthModel: inputs.growthModel,
      incomeType: inputs.incomeType,
      savingBehavior: inputs.savingBehavior,
      lifestyle: "moderate",
    }
  }, [inputs])

  const handleCompare = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/simulation/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!json.success) {
        throw new Error(json.message || "Comparison failed")
      }
      setRows(json.data.results)
      setBest(json.data.best ?? null)
      setWorst(json.data.worst ?? null)
    } catch (err) {
      setError("Failed to compare strategies. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-foreground">
          Strategy Comparison
        </CardTitle>
        <Button onClick={handleCompare} disabled={loading}>
          {loading ? "Comparing..." : "Compare Strategies"}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Runs multiple deterministic strategies side-by-side. If ZikoML is online, it enhances scoring and adds confidence.
        </p>

        {error && (
          <div className="p-3 text-sm border rounded-md bg-destructive/10 text-destructive border-destructive/30">
            {error}
          </div>
        )}

        {!rows ? (
          <div className="p-6 text-sm text-center border rounded-lg bg-muted/20 border-border/60 text-muted-foreground">
            Click “Compare Strategies” to see best/worst outcomes and deltas.
          </div>
        ) : (
          <div className="space-y-3">
            {best && worst && (
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="p-4 border rounded-xl border-blue-200 bg-blue-50">
                  <p className="text-xs font-semibold text-blue-700">Best case</p>
                  <p className="text-sm font-semibold">
                    {formatStrategyLabel(best.strategy)}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">RSI</p>
                      <p className="text-lg font-bold">{best.rsiScore.toFixed(1)}%</p>
                    </div>
                    <ModelConfidenceBadge confidence={best.meta?.mlConfidence ?? null} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Savings</p>
                      <p className="font-semibold">MWK {best.projectedSavings.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Monthly income</p>
                      <p className="font-semibold">MWK {best.estimatedMonthlyIncome.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-xl border-red-200 bg-red-50">
                  <p className="text-xs font-semibold text-red-700">Worst case</p>
                  <p className="text-sm font-semibold">
                    {formatStrategyLabel(worst.strategy)}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">RSI</p>
                      <p className="text-lg font-bold">{worst.rsiScore.toFixed(1)}%</p>
                    </div>
                    <ModelConfidenceBadge confidence={worst.meta?.mlConfidence ?? null} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Savings</p>
                      <p className="font-semibold">MWK {worst.projectedSavings.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Monthly income</p>
                      <p className="font-semibold">MWK {worst.estimatedMonthlyIncome.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {rows
              .slice()
              .sort((a, b) => b.rsiScore - a.rsiScore)
              .map((row) => {
                const isBest = best?.strategy === row.strategy
                const delta =
                  typeof baseRsiScore === "number"
                    ? row.rsiScore - baseRsiScore
                    : null
                const bestDelta =
                  best ? row.rsiScore - best.rsiScore : null

                return (
                  <div
                    key={row.strategy}
                    className={`p-4 border rounded-xl bg-card ${
                      isBest ? "border-blue-300 shadow-sm" : "border-border/60"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          {formatStrategyLabel(row.strategy)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Engine: {row.meta?.engine === "ml-v1" ? "ZikoML" : "Deterministic"}
                          {row.meta?.mlWarnings?.includes("ML_FALLBACK_RULE_ENGINE")
                            ? " (fallback)"
                            : ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <ModelConfidenceBadge confidence={row.meta?.mlConfidence ?? null} />
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">RSI</p>
                          <p className="text-lg font-bold">{row.rsiScore.toFixed(1)}%</p>
                          {delta !== null && (
                            <p className="text-xs text-muted-foreground">
                              Δ {delta >= 0 ? "+" : ""}
                              {delta.toFixed(1)}%
                            </p>
                          )}
                          {bestDelta !== null && bestDelta !== 0 && (
                            <p className="text-xs text-muted-foreground">
                              vs best {bestDelta >= 0 ? "+" : ""}
                              {bestDelta.toFixed(1)}%
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Savings</p>
                        <p className="font-semibold">
                          MWK {row.projectedSavings.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Monthly income</p>
                        <p className="font-semibold">
                          MWK {row.estimatedMonthlyIncome.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

