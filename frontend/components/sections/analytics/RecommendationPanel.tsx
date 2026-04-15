"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsData } from "@/types/analytics"

interface Props {
  data: AnalyticsData
}

export default function RecommendationPanel({ data }: Props) {

  return (
    <Card>

      <CardHeader>
        <CardTitle>Recommendations</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">

        {data.recommendations && data.recommendations.length > 0 ? (

          data.recommendations.map((rec, i) => (

            <div
              key={i}
              className="p-3 border rounded-lg"
            >
              <p className="text-sm">{rec.message}</p>
              <p className="text-xs text-muted-foreground">
                {rec.type}
              </p>
            </div>

          ))

        ) : (

          <p className="text-sm text-muted-foreground">
            No recommendations available
          </p>

        )}

      </CardContent>

    </Card>
  )
}