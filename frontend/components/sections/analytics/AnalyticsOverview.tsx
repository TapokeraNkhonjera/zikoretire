"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AnalyticsData } from "@/types/analytics"
import {
  Trophy,
  Gauge,
  TrendingUp,
  Sparkles
} from "lucide-react"

interface Props {
  data: AnalyticsData
}

export default function AnalyticsOverview({ data }: Props) {

  const allOptions = [
    {
      name: "Base Plan",
      ...data.result,
    },
    ...data.scenarios.map((s) => ({
      name: s.name,
      ...s.result,
    })),
  ]

  const base = allOptions[0]

  const best = allOptions.reduce((prev, curr) =>
    curr.rsiScore > prev.rsiScore ? curr : prev
  )

  /* ================= LOGIC ================= */

  const allLow = allOptions.every(o => o.rsiScore < 40)

  const bestLabel = (() => {
    if (allLow) return "No viable strategy"
    if (best.name === "Base Plan") return "Base plan is optimal"
    return best.name
  })()

  const bestSub = (() => {
    if (allLow) return "All scenarios are high risk"
    if (best.name === "Base Plan") return "Scenarios did not improve outcome"
    return "Highest sustainability outcome"
  })()

  /* ================= CALCULATIONS ================= */

  const improvement =
    best.projectedValue - base.projectedValue

  const improvementPercent =
    base.projectedValue > 0
      ? (improvement / base.projectedValue) * 100
      : 0

  const rsi = best.rsiScore

  const getRsiState = () => {
    if (rsi >= 70) return "Strong"
    if (rsi >= 40) return "Moderate"
    return "At Risk"
  }

  const getRsiColor = () => {
    if (rsi >= 70) return "text-blue-600"
    if (rsi >= 40) return "text-amber-600"
    return "text-red-600"
  }

  /* ================= UI ================= */

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

      {/* BEST STRATEGY */}
      <Card className="transition border border-border/60 bg-card hover:shadow-sm">
        <CardContent className="p-5">

          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-muted-foreground">
              Best Strategy
            </p>

            <div className="flex items-center justify-center rounded-md w-9 h-9 bg-blue-50 dark:bg-blue-900/50">
              <Trophy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <p className="text-lg font-semibold text-foreground">
            {bestLabel}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {bestSub}
          </p>

        </CardContent>
      </Card>

      {/* RSI SCORE */}
      <Card className="transition border border-border/60 bg-card hover:shadow-sm">
        <CardContent className="p-5">

          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-muted-foreground">
              Retirement Score
            </p>

            <div className="flex items-center justify-center rounded-md w-9 h-9 bg-blue-50 dark:bg-blue-900/50">
              <Gauge className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <p className={`text-2xl font-bold ${getRsiColor()}`}>
            {rsi.toFixed(1)}%
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {getRsiState()} readiness
          </p>

        </CardContent>
      </Card>

      {/* PROJECTION */}
      <Card className="transition border border-border/60 bg-card hover:shadow-sm">
        <CardContent className="p-5">

          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-muted-foreground">
              Best Projection
            </p>

            <div className="flex items-center justify-center rounded-md w-9 h-9 bg-blue-50 dark:bg-blue-900/50">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <p className="text-2xl font-bold text-foreground">
            MWK {best.projectedValue.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            At retirement
          </p>

        </CardContent>
      </Card>

      {/* IMPACT */}
      <Card className="transition border border-border/60 bg-card hover:shadow-sm">
        <CardContent className="p-5">

          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-muted-foreground">
              Scenario Impact
            </p>

            <div className="flex items-center justify-center rounded-md w-9 h-9 bg-blue-50 dark:bg-blue-900/50">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <p className={`text-2xl font-bold ${
            improvement > 0 ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
          }`}>
            {improvement > 0
              ? `+MWK ${improvement.toLocaleString()}`
              : "No improvement"}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {improvement > 0
              ? `${improvementPercent.toFixed(1)}% better than base`
              : "Scenarios did not improve outcome"}
          </p>

        </CardContent>
      </Card>

    </div>
  )
}