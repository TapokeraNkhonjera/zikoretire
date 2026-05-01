"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Wallet,
  TrendingUp,
  Banknote,
  Gauge,
  LucideIcon
} from "lucide-react"

import { DashboardStatsData } from "@/types/dashboard"

type StatItem = {
  title: string
  value: string
  description: string
  progress: number
  icon: LucideIcon
  highlight?: boolean
}

export function DashboardStats({
  stats,
}: {
  stats: DashboardStatsData
}) {
  const [animate, setAnimate] = useState(false)

  // ✅ trigger AFTER first paint (no React warning)
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 50)
    return () => clearTimeout(t)
  }, [])

  const getRsiColor = () => {
    if (stats.rsi >= 70) return "text-primary"
    if (stats.rsi >= 40) return "text-amber-500"
    return "text-destructive"
  }

  const getRsiBarColor = () => {
    if (stats.rsi >= 70) return "bg-primary"
    if (stats.rsi >= 40) return "bg-amber-500"
    return "bg-destructive"
  }

  const items: StatItem[] = [
    {
      title: "Total Contributions",
      value: `MWK ${stats.totalContributions.toLocaleString()}`,
      description: "Lifetime contributions",
      progress: 75,
      icon: Wallet,
    },
    {
      title: "Projected Fund",
      value: `MWK ${stats.projectedFund.toLocaleString()}`,
      description: "At retirement",
      progress: 82,
      icon: TrendingUp,
    },
    {
      title: "Monthly Pension",
      value: `MWK ${stats.monthlyIncome.toLocaleString()}`,
      description: "Estimated income",
      progress: 68,
      icon: Banknote,
    },
    {
      title: "RSI Score",
      value: `${stats.rsi.toFixed(1)}%`,
      description:
        stats.rsi >= 70
          ? "Healthy"
          : stats.rsi >= 40
          ? "Moderate"
          : "At Risk",
      progress: stats.rsi,
      icon: Gauge,
      highlight: true,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((stat, index) => {
        const Icon = stat.icon

        return (
          <Card
            key={stat.title}
            className={`
              border border-border/60 bg-card
              transition-all duration-300 ease-out

              hover:border-primary/40
              hover:shadow-sm
              hover:-translate-y-1

              animate-in fade-in slide-in-from-bottom-2
            `}
            style={{
              animationDelay: `${index * 80}ms`,
              animationFillMode: "both",
            }}
          >
            <CardContent className="p-5">

              {/* TOP ROW */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-medium tracking-wide text-muted-foreground">
                  {stat.title}
                </p>

                <div className="flex items-center justify-center border rounded-md w-9 h-9 bg-muted/40 border-border/60">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
              </div>

              {/* VALUE */}
              <div className="space-y-3">
                <p
                  className={`text-2xl font-semibold tracking-tight ${
                    stat.highlight
                      ? getRsiColor()
                      : "text-foreground"
                  }`}
                >
                  {stat.value}
                </p>

                {/* PROGRESS BAR */}
                <div className="w-full h-2 overflow-hidden rounded-full bg-muted/70">
                  <div
                    className={`
                      h-full rounded-full
                      transition-all duration-1000 ease-out
                      ${stat.highlight
                        ? getRsiBarColor()
                        : "bg-primary"}
                    `}
                    style={{
                      width: animate ? `${stat.progress}%` : "0%",
                    }}
                  />
                </div>

                {/* SUBTEXT */}
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>

            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}