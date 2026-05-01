"use client"

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

import { AnalyticsData } from "@/types/analytics"

interface Props {
  data: AnalyticsData
}

export default function ComparisonChart({ data }: Props) {

  /* ================= TIME SCALE ================= */

  const years = [0, 5, 10, 15, 20]

  /* ================= HELPER (SMOOTH GROWTH) ================= */

  const projectGrowth = (finalValue: number, year: number) => {
    const totalYears = 20

    // exponential curve (better than linear)
    const growthFactor = Math.pow(year / totalYears, 1.5)

    return finalValue * growthFactor
  }

  /* ================= BUILD DATA ================= */

  const chartData = years.map((year) => {

    const entry: Record<string, number> = {
      year,
      "Base Plan": projectGrowth(data.result.projectedValue, year),
    }

    data.scenarios.forEach((s) => {
      entry[s.name] = projectGrowth(s.result.projectedValue, year)
    })

    return entry
  })

  /* ================= COLORS ================= */

  const scenarioColors = [
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // purple
    "#14b8a6", // teal
  ]

  /* ================= TOOLTIP ================= */

  const formatValue = (value: unknown) => {
    let num = 0

    if (typeof value === "number") num = value
    else if (typeof value === "string") num = Number(value)

    return `MWK ${num.toLocaleString()}`
  }

  /* ================= UI ================= */

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-2xl">

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-black">
          Growth Comparison
        </h3>

        <p className="text-sm text-gray-600">
          Compare how different scenarios grow over time
        </p>
      </div>

      <div className="w-full min-h-[320px]">

        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="year" />

            <YAxis
              tickFormatter={(v) =>
                `${(v / 1000000).toFixed(1)}M`
              }
            />

            <Tooltip formatter={formatValue} />

            <Legend />

            {/* BASE PLAN */}
            <Area
              type="monotone"
              dataKey="Base Plan"
              stroke="#2563eb"
              fill="#2563eb33"
              strokeWidth={2}
            />

            {/* SCENARIOS */}
            {data.scenarios.map((s, i) => (

              <Area
                key={s.name}
                type="monotone"
                dataKey={s.name}
                stroke={scenarioColors[i % scenarioColors.length]}
                fill={`${scenarioColors[i % scenarioColors.length]}33`}
                strokeWidth={2}
              />

            ))}

          </AreaChart>
        </ResponsiveContainer>

      </div>

    </div>
  )
}