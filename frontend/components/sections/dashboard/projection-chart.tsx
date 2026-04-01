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

const chartData = [
  { year: "2024", savings: 2450000, inflationAdjusted: 2450000 },
  { year: "2026", savings: 3200000, inflationAdjusted: 2950000 },
  { year: "2028", savings: 4100000, inflationAdjusted: 3500000 },
  { year: "2030", savings: 5200000, inflationAdjusted: 4100000 },
  { year: "2032", savings: 6500000, inflationAdjusted: 4750000 },
  { year: "2034", savings: 8000000, inflationAdjusted: 5400000 },
  { year: "2036", savings: 8750000, inflationAdjusted: 5800000 },
]

export function ProjectionChart() {
  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-semibold">
          Savings Growth Projection
        </CardTitle>
        <CardDescription className="text-sm">
          Growth of your retirement savings over time (adjusted for inflation)
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* FIXED CONTAINER */}
        <div className="w-full min-h-[320px]">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              
              {/* Gradients */}
              <defs>
                <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.55 0.18 250)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="oklch(0.55 0.18 250)" stopOpacity={0} />
                </linearGradient>

                <linearGradient id="inflationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.7 0.15 160)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.7 0.15 160)" stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Grid */}
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border/50"
              />

              {/* X Axis */}
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                className="text-xs text-muted-foreground"
              />

              {/* Y Axis */}
              <YAxis
                tickLine={false}
                axisLine={false}
                className="text-xs text-muted-foreground"
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />

              {/* Tooltip */}
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(1 0 0)",
                  border: "1px solid oklch(0.92 0.01 240)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
                }}
                labelStyle={{ fontWeight: 600 }}
                formatter={(value, name) => {
                  const amount = Number(value)
                  const label =
                    name === "savings"
                      ? "Projected Savings"
                      : "Inflation Adjusted"

                  return [`MK ${amount.toLocaleString()}`, label]
                }}
              />

              {/* Legend */}
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-foreground">
                    {value === "savings"
                      ? "Projected Savings"
                      : "Inflation Adjusted"}
                  </span>
                )}
              />

              {/* Areas */}
              <Area
                type="monotone"
                dataKey="savings"
                stroke="oklch(0.55 0.18 250)"
                strokeWidth={2.5}
                fill="url(#savingsGradient)"
                name="savings"
              />

              <Area
                type="monotone"
                dataKey="inflationAdjusted"
                stroke="oklch(0.7 0.15 160)"
                strokeWidth={2.5}
                fill="url(#inflationGradient)"
                name="inflationAdjusted"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}