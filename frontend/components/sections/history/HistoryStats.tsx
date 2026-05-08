"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { HistorySimulation } from "./types"

import {
  Layers,
  TrendingUp,
  Wallet,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react"

import { useCountUp } from "@/hooks/useCountUp"

/* ================= ANIMATION ================= */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
}

/* ================= COMPONENT ================= */

export default function HistoryStats({
  simulations
}: {
  simulations: HistorySimulation[]
}) {

  const totalSimulations = simulations.length
  const latestSimulation = simulations[0] || null

  const finalProjectedValue =
    latestSimulation?.result?.projectedValue ?? 0

  const latestRsi =
    latestSimulation?.result?.rsiScore ?? 0

  /* ================= CALCULATIONS ================= */

  const avgProjectedValue =
    totalSimulations > 0
      ? simulations.reduce(
          (sum, sim) =>
            sum + (sim.result?.projectedValue ?? 0),
          0
        ) / totalSimulations
      : 0

  const previousValue =
    simulations[1]?.result?.projectedValue ?? null

  const trendValue =
    previousValue !== null
      ? finalProjectedValue - previousValue
      : 0

  const trendDirection =
    trendValue > 0
      ? "up"
      : trendValue < 0
      ? "down"
      : "flat"

  const trendPercent =
    previousValue && previousValue !== 0
      ? (trendValue / previousValue) * 100
      : 0

  /* ================= RSI ================= */

  const getRsiState = () => {
    if (latestRsi >= 70) return "Healthy"
    if (latestRsi >= 40) return "Moderate"
    return "At Risk"
  }

  const getRsiColor = () => {
    if (latestRsi >= 70) return "text-blue-600"
    if (latestRsi >= 40) return "text-amber-600"
    return "text-red-600"
  }

  /* ================= STATS ================= */

  const stats = [
    {
      label: "Total Simulations",
      value: totalSimulations,
      icon: Layers,
      sub: "All recorded projections"
    },
    {
      label: "Final Projection",
      value: finalProjectedValue,
      icon: TrendingUp,
      prefix: "MWK",
      sub: "Compared to previous",
      trend: true
    },
    {
      label: "Average Projection",
      value: avgProjectedValue,
      icon: Wallet,
      prefix: "MWK",
      sub: "Across all simulations"
    },
    {
      label: "RSI Score",
      value: latestRsi,
      icon: Activity,
      suffix: "%",
      sub: getRsiState(),
      highlight: true
    }
  ]

  /* ================= ANIMATED VALUES ================= */

  const animatedValues = [
    useCountUp(stats[0].value, { duration: 1000 }),
    useCountUp(stats[1].value, { duration: 1150 }),
    useCountUp(stats[2].value, { duration: 1300 }),
    useCountUp(stats[3].value, { duration: 1450, decimals: 1 })
  ]

  /* ================= TREND BADGE ================= */

  const renderTrend = () => {

    const base =
      "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"

    const glowAnimation = {
      boxShadow: [
        "0 0 0px rgba(0,0,0,0)",
        "0 0 8px rgba(59,130,246,0.6)",
        "0 0 0px rgba(0,0,0,0)"
      ]
    }

    const transition = {
      duration: 1.2,
      ease: [0.42, 0, 0.58, 1] as const,
      repeat: Infinity,
      repeatDelay: 5
    }

    if (trendDirection === "up") {
      return (
        <motion.div
          animate={glowAnimation}
          transition={transition}
          className={`${base} bg-blue-100 text-blue-600`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          +{trendPercent.toFixed(1)}%
        </motion.div>
      )
    }

    if (trendDirection === "down") {
      return (
        <motion.div
          animate={{
            boxShadow: [
              "0 0 0px rgba(0,0,0,0)",
              "0 0 8px rgba(239,68,68,0.6)",
              "0 0 0px rgba(0,0,0,0)"
            ]
          }}
          transition={transition}
          className={`${base} bg-red-100 text-red-600`}
        >
          <ArrowDownRight className="w-3.5 h-3.5" />
          {trendPercent.toFixed(1)}%
        </motion.div>
      )
    }

    return (
      <div className={`${base} bg-gray-100 text-gray-500`}>
        <Minus className="w-3.5 h-3.5" />
        0%
      </div>
    )
  }

  /* ================= UI ================= */

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {stats.map((stat, i) => {

        const Icon = stat.icon

        return (
          <motion.div key={i} variants={cardVariants}>
            <Card className="h-full transition-all duration-300 border border-border/60 bg-card hover:-translate-y-1 hover:shadow-lg">

              <CardContent className="flex flex-col h-full p-5">

                {/* HEADER */}
                <div className="flex items-start justify-between">

                  {/* LEFT */}
                  <p className="text-xs font-medium text-muted-foreground">
                    {stat.label}
                  </p>

                  {/* RIGHT STACK */}
                  <div className="flex flex-col items-end gap-2">

                    {/* ICON */}
                    <div className="flex items-center justify-center border rounded-md w-9 h-9 bg-muted/40">
                      <Icon className="w-4 h-4 text-black" />
                    </div>

                    {/* TREND BELOW ICON */}
                    {stat.trend && renderTrend()}

                  </div>

                </div>

                {/* VALUE */}
                <div className="mt-auto space-y-1">

                  <p
                    className={`text-2xl sm:text-3xl font-semibold tabular-nums ${
                      stat.highlight
                        ? getRsiColor()
                        : "text-black"
                    }`}
                  >
                    {"prefix" in stat && stat.prefix && `${stat.prefix} `}
                    {animatedValues[i].toLocaleString()}
                    {"suffix" in stat && stat.suffix}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {stat.sub}
                  </p>

                </div>

              </CardContent>

            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}