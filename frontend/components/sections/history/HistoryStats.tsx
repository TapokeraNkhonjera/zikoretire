"use client"

import {
  Card,
  CardContent
} from "@/components/ui/card"

import { HistorySimulation } from "./types"

import {
  Layers,
  TrendingUp,
  Wallet,
  Activity
} from "lucide-react"

export default function HistoryStats({
  simulations
}: {
  simulations: HistorySimulation[]
}) {

  const totalSimulations = simulations.length

  const finalProjectedValue =
    simulations[simulations.length - 1]?.result?.projectedValue ?? 0

  const totalMonthlyIncome =
    simulations.reduce(
      (sum, sim) => sum + sim.monthlyIncome,
      0
    )

  const latestRsi =
    simulations[simulations.length - 1]?.result?.rsiScore ?? 0

  /* RSI STATE */
  const getRsiState = () => {
    if (latestRsi >= 70) return "Healthy"
    if (latestRsi >= 40) return "Moderate"
    return "At Risk"
  }

  const getRsiColor = () => {
    if (latestRsi >= 70) return "text-primary"
    if (latestRsi >= 40) return "text-amber-500"
    return "text-destructive"
  }

  const stats = [
    {
      label: "Total Simulations",
      value: totalSimulations,
      icon: Layers,
      suffix: "",
      sub: "All recorded projections"
    },
    {
      label: "Final Projection",
      value: finalProjectedValue,
      icon: TrendingUp,
      prefix: "MWK",
      sub: "Latest simulation outcome"
    },
    {
      label: "Monthly Income",
      value: totalMonthlyIncome,
      icon: Wallet,
      prefix: "MWK",
      sub: "Combined expected income"
    },
    {
      label: "RSI Score",
      value: latestRsi.toFixed(1),
      icon: Activity,
      suffix: "%",
      sub: getRsiState(),
      highlight: true
    }
  ]

  return (

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

      {stats.map((stat, i) => {

        const Icon = stat.icon

        return (

          <Card
            key={i}
            className="border border-border/60 bg-card hover:border-border transition"
          >
            <CardContent className="p-5">

              {/* TOP ROW */}
              <div className="flex items-center justify-between mb-4">

                <p className="text-xs font-medium tracking-wide text-muted-foreground">
                  {stat.label}
                </p>

                <div className="flex items-center justify-center w-9 h-9 border rounded-md bg-muted/40 border-border/60">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>

              </div>

              {/* VALUE */}
              <div className="space-y-1">

                <p
                  className={`text-2xl font-semibold tracking-tight ${
                    stat.highlight ? getRsiColor() : "text-foreground"
                  }`}
                >
                  {stat.prefix && `${stat.prefix} `}
                  {typeof stat.value === "number"
                    ? stat.value.toLocaleString()
                    : stat.value}
                  {stat.suffix}
                </p>

                {/* SUBTEXT */}
                <p className="text-xs text-muted-foreground">
                  {stat.sub}
                </p>

              </div>

            </CardContent>
          </Card>

        )

      })}

    </div>

  )
}