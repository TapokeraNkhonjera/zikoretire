"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

import { ChartPoint } from "@/types/dashboard"

export function ProjectionChart({
  data
}: {
  data: ChartPoint[]
}) {
  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-semibold">
          Savings Growth Projection
        </CardTitle>
        <CardDescription>
          Growth of your retirement savings over time
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="w-full min-h-[320px]">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="year" />
              <YAxis
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
              />

<Tooltip
  formatter={(value) => {
    let safeValue = 0

    if (typeof value === "number") {
      safeValue = value
    } else if (typeof value === "string") {
      safeValue = Number(value)
    } else if (Array.isArray(value)) {
      safeValue = Number(value[0] ?? 0)
    }

    return [`MK ${safeValue.toLocaleString()}`, ""]
  }}
/>

              <Legend />

              <Area
                type="monotone"
                dataKey="savings"
                stroke="#6366f1"
                fill="#6366f133"
              />

              <Area
                type="monotone"
                dataKey="inflationAdjusted"
                stroke="#10b981"
                fill="#10b98133"
              />

            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}