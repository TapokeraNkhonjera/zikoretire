"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Recommendations() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendations</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">
          Personalized insights based on your retirement plan.
        </p>

        {/* later: recommendation list */}
      </CardContent>
    </Card>
  )
}
