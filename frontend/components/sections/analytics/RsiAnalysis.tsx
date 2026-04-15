"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsData } from "@/types/analytics"

interface Props {
  data: AnalyticsData
}

export default function RsiAnalysis({ data }: Props) {

  const rows = [
    { name: "Base", rsi: data.result.rsiScore ?? 0 },
    ...data.scenarios.map((s) => ({
      name: s.name,
      rsi: s.result.rsiScore ?? 0,
    })),
  ]

  return (
    <Card>

      <CardHeader>
        <CardTitle>RSI Analysis</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">

        {rows.map((row, i) => (

          <div key={i}>

            <div className="flex justify-between mb-1 text-xs">
              <span>{row.name}</span>
              <span>{row.rsi}%</span>
            </div>

            <div className="w-full h-3 rounded bg-muted">
              <div
                className="h-full rounded bg-primary"
                style={{ width: `${row.rsi}%` }}
              />
            </div>

          </div>

        ))}

      </CardContent>

    </Card>
  )
}