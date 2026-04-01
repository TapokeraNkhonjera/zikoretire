"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GrowthChartProps {
  data: {
    yearsToRetirement: number;
    estimatedSavings: number;
  };
}

export default function GrowthChart({ data }: GrowthChartProps) {

  const chartData = [];

  for (let i = 1; i <= data.yearsToRetirement; i++) {

    chartData.push({
      year: i,
      savings:
        (data.estimatedSavings /
          data.yearsToRetirement) *
        i,
    });

  }

  return (
    <Card>

      <CardHeader>
        <CardTitle>
          Savings Growth Projection
        </CardTitle>
      </CardHeader>

      <CardContent className="h-[300px]">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={chartData}>

            <XAxis dataKey="year" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="savings"
            />

          </LineChart>

        </ResponsiveContainer>

      </CardContent>

    </Card>
  );
}