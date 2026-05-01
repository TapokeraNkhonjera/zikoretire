"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { AnalyticsData } from "@/types/analytics"

interface Props {
  data: AnalyticsData
}

export default function ScenarioComparisonTable({ data }: Props) {

  const hasScenarios = data.scenarios.length > 0

  /* ================= MERGE ================= */

  const rows = [
    {
      name: "Base Plan",
      ...data.result
    },
    ...data.scenarios.map((s) => ({
      name: s.name,
      ...s.result
    }))
  ]

  /* ================= BEST ================= */

  const best = rows.reduce((prev, curr) =>
    curr.rsiScore > prev.rsiScore ? curr : prev
  )

  /* ================= RSI COLOR ================= */

  const getRsiColor = (value: number) => {
    if (value >= 70) return "text-blue-600"
    if (value >= 40) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <Card className="border-border/60">

      <CardHeader>
        <CardTitle className="text-base font-semibold text-black">
          Scenario Comparison
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* EMPTY STATE */}
        {!hasScenarios && (
          <div className="p-6 text-sm text-center text-black border rounded-lg bg-muted/30 border-border/60">
            No scenarios available for this simulation.
            <p className="mt-1 text-xs text-muted-foreground">
              Create scenarios to compare different retirement strategies.
            </p>
          </div>
        )}

        {/* LIST VIEW (BETTER THAN RAW TABLE) */}
        {rows.map((row, i) => {

          const isBest = row.name === best.name

          return (
            <div
              key={i}
              className={`p-4 border rounded-xl transition ${
                isBest
                  ? "border-blue-500 bg-blue-50"
                  : "border-border/60 bg-white"
              }`}
            >

              {/* HEADER */}
              <div className="flex items-center justify-between mb-3">

                <p className="text-sm font-semibold text-black">
                  {row.name}
                </p>

                {isBest && (
                  <span className="text-xs font-medium text-blue-600">
                    Best Option
                  </span>
                )}

              </div>

              {/* METRICS */}
              <div className="grid grid-cols-3 gap-4 text-sm">

                {/* PROJECTED */}
                <div>
                  <p className="text-xs text-muted-foreground">
                    Projection
                  </p>
                  <p className="font-semibold text-black">
                    MWK {row.projectedValue.toLocaleString()}
                  </p>
                </div>

                {/* MONTHLY */}
                <div>
                  <p className="text-xs text-muted-foreground">
                    Monthly Income
                  </p>
                  <p className="font-semibold text-black">
                    {row.monthlyRetirementIncome
                      ? `MWK ${row.monthlyRetirementIncome.toLocaleString()}`
                      : "-"}
                  </p>
                </div>

                {/* RSI */}
                <div>
                  <p className="text-xs text-muted-foreground">
                    RSI Score
                  </p>
                  <p className={`font-semibold ${getRsiColor(row.rsiScore)}`}>
                    {row.rsiScore.toFixed(1)}%
                  </p>
                </div>

              </div>

            </div>
          )
        })}

      </CardContent>

    </Card>
  )
}