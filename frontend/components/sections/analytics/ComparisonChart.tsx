"use client"

import {
  LineChart,
  Line,
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

  const years = [1, 5, 10, 20]

  const chartData = years.map((year) => {
    const entry: Record<string, number> = {
      year,
      Base: data.result.projectedValue * (year / 20),
    }

    data.scenarios.forEach((s) => {
      entry[s.name] = s.result.projectedValue * (year / 20)
    })

    return entry
  })

  return (
    <div className="p-4 border rounded-xl bg-card">

      <h3 className="mb-4 font-semibold">
        Growth Comparison
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>

          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />

          <Line dataKey="Base" strokeWidth={2} />

          {data.scenarios.map((s, i) => (
            <Line
              key={i}
              dataKey={s.name}
              strokeWidth={2}
            />
          ))}

        </LineChart>
      </ResponsiveContainer>

    </div>
  )
}