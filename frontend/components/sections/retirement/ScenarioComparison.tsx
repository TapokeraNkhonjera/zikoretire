"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ScenarioComparison() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Comparison</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">
          Compare projected outcomes across different scenarios.
        </p>

        {/* later: table/chart */}
      </CardContent>
    </Card>
  )
}