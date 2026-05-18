"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  data,
  resolution = "2",
  onResolutionChange
}: {
  data: ChartPoint[]
  resolution?: string
  onResolutionChange?: (val: string) => void
}) {
  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">
            Savings Growth Projection
          </CardTitle>
          <CardDescription>
            Growth of your retirement savings over time
          </CardDescription>
        </div>
        
        {onResolutionChange && (
          <Tabs value={resolution} onValueChange={onResolutionChange} className="hidden sm:block">
            <TabsList>
              <TabsTrigger value="0.08333333333333333">Monthly</TabsTrigger>
              <TabsTrigger value="1">Yearly</TabsTrigger>
              <TabsTrigger value="10">10 Years</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
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
                type="linear"
                dataKey="savings"
                stroke="#6366f1"
                fill="#6366f133"
              />

              <Area
                type="linear"
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