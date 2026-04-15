"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AnalyticsData } from "@/types/analytics"

interface Props {
  data: AnalyticsData
}

export default function AnalyticsOverview({ data }: Props) {

  const allOptions = [
    { name: "Base", ...data.result },
    ...data.scenarios.map((s) => ({
      name: s.name,
      ...s.result,
    })),
  ]

  const best = allOptions.reduce((prev, curr) =>
    curr.rsiScore > prev.rsiScore ? curr : prev
  )

  return (
    <div className="grid gap-4 sm:grid-cols-3">

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Best Scenario</p>
          <p className="text-lg font-bold">{best.name}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Highest RSI</p>
          <p className="text-lg font-bold">{best.rsiScore ?? 0}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Projected Value</p>
          <p className="text-lg font-bold">
            MK {(best.projectedValue ?? 0).toLocaleString()}
          </p>
        </CardContent>
      </Card>

    </div>
  )
}