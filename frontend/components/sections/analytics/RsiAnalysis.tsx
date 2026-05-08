"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import ModelConfidenceBadge from "@/components/sections/shared/ModelConfidenceBadge"

import { AnalyticsData } from "@/types/analytics"

interface Props {
  data: AnalyticsData
}

export default function RsiAnalysis({ data }: Props) {

  /* ================= MERGE ================= */

  const rows = [
    {
      name: "Base Plan",
      rsi: data.result.rsiScore ?? 0,
      confidence: data.result.confidenceScore ?? null,
    },
    ...data.scenarios.map((s) => ({
      name: s.name,
      rsi: s.result.rsiScore ?? 0,
      confidence: s.result.confidenceScore ?? null,
    }))
  ]

  /* ================= HELPERS ================= */

  const getRsiState = (rsi: number) => {
    if (rsi >= 70) return "Strong"
    if (rsi >= 40) return "Moderate"
    return "At Risk"
  }

  const getRsiColor = (rsi: number) => {
    if (rsi >= 70) return "bg-blue-600"
    if (rsi >= 40) return "bg-amber-500"
    return "bg-red-500"
  }

  const getTextColor = (rsi: number) => {
    if (rsi >= 70) return "text-blue-600"
    if (rsi >= 40) return "text-amber-600"
    return "text-red-600"
  }

  /* ================= BEST & WORST ================= */

  const best = rows.reduce((prev, curr) =>
    curr.rsi > prev.rsi ? curr : prev
  )

  const worst = rows.reduce((prev, curr) =>
    curr.rsi < prev.rsi ? curr : prev
  )

  /* ================= RECOMMENDATION ENGINE ================= */

  const getRecommendation = (rsi: number) => {

    if (rsi >= 70) {
      return {
        title: "Strong Plan",
        message: "Your retirement plan is on track and financially sustainable.",
        action: "Maintain consistency and avoid unnecessary risk changes."
      }
    }

    if (rsi >= 40) {
      return {
        title: "Moderate Plan",
        message: "Your plan is viable but may fall short under certain conditions.",
        action: "Increase contributions or adjust growth strategy to strengthen outcomes."
      }
    }

    return {
      title: "High Risk Plan",
      message: "Your current plan is unlikely to meet retirement needs.",
      action: "Increase savings rate, extend retirement age, or adopt a more aggressive growth model."
    }
  }

  const recommendation = getRecommendation(best.rsi)

  /* ================= UI ================= */

  return (
    <Card className="border-border/60">

      <CardHeader>
        <CardTitle className="text-base font-semibold text-black">
          RSI Analysis
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">

        {/* ================= RSI BARS ================= */}

        <div className="space-y-4">

          {rows.map((row, i) => {

            const isBest = row.name === best.name
            const isWorst = row.name === worst.name

            return (
              <div key={i} className="space-y-1">

                <div className="flex justify-between text-sm font-medium text-black">

                  <span>
                    {row.name}
                    {isBest && (
                      <span className="ml-2 text-xs text-blue-600">
                        (Best)
                      </span>
                    )}
                    {isWorst && (
                      <span className="ml-2 text-xs text-red-600">
                        (Risk)
                      </span>
                    )}
                  </span>

                  <span className={getTextColor(row.rsi)}>
                    {row.rsi.toFixed(1)}%
                  </span>

                </div>

                <div className="w-full h-3 rounded bg-muted">
                  <div
                    className={`h-full rounded ${getRsiColor(row.rsi)}`}
                    style={{ width: `${row.rsi}%` }}
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  {getRsiState(row.rsi)}
                </p>

              </div>
            )
          })}

        </div>

        {/* ================= INSIGHT ================= */}

        <div className="p-4 space-y-2 border rounded-xl bg-muted/30 border-border/60">

          <p className="text-sm font-semibold text-black">
            Key Insight
          </p>

          <p className="text-sm text-black">
            {best.name === worst.name
              ? "All strategies perform similarly with minimal variation."
              : `${best.name} significantly outperforms ${worst.name} in retirement readiness.`
            }
          </p>

        </div>

        {/* ================= RECOMMENDATION ================= */}

        <div className="p-4 space-y-2 border rounded-xl border-border/60">

          <p className="text-sm font-semibold text-black">
            {recommendation.title}
          </p>

          <p className="text-sm text-black">
            {recommendation.message}
          </p>

          <p className="text-sm font-medium text-blue-600">
            {recommendation.action}
          </p>

        </div>

        <div className="p-4 text-sm text-black border rounded-xl bg-muted/20 border-border/60">
          <p className="font-semibold">ML Confidence Transparency</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Confidence shows model certainty when ML was used. Fallback runs display N/A.
          </p>
          <div className="mt-3 space-y-1">
            {rows.map((row) => (
              <div key={row.name} className="flex items-center justify-between">
                <p className="text-xs">{row.name}</p>
                <ModelConfidenceBadge confidence={row.confidence} showLabel={false} />
              </div>
            ))}
          </div>
        </div>

      </CardContent>

    </Card>
  )
}