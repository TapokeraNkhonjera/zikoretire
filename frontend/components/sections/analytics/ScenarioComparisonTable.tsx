"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsData } from "@/types/analytics"

interface Props {
  data: AnalyticsData
}

export default function ScenarioComparisonTable({ data }: Props) {

  const rows = [
    { name: "Base", ...data.result },
    ...data.scenarios.map((s) => ({
      name: s.name,
      ...s.result,
    })),
  ]

  return (
    <Card>

      <CardHeader>
        <CardTitle>Scenario Comparison</CardTitle>
      </CardHeader>

      <CardContent>

        <table className="w-full text-sm">

          <thead>
            <tr className="text-left text-muted-foreground">
              <th>Scenario</th>
              <th>Projected</th>
              <th>Monthly</th>
              <th>RSI</th>
            </tr>
          </thead>

          <tbody>

            {rows.map((row, i) => (
              <tr key={i} className="border-t">

                <td>{row.name}</td>

                <td>
                  MK {(row.projectedValue ?? 0).toLocaleString()}
                </td>

                <td>
                  {row.monthlyRetirementIncome
                    ? `MK ${row.monthlyRetirementIncome.toLocaleString()}`
                    : "-"}
                </td>

                <td>{row.rsiScore ?? 0}%</td>

              </tr>
            ))}

          </tbody>

        </table>

      </CardContent>

    </Card>
  )
}