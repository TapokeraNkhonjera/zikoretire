"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { AnalyticsData } from "@/types/analytics"

interface Props {
  data: AnalyticsData
}

export default function RecommendationPanel({ data }: Props) {

  /* ================= MERGE ================= */

  const allOptions = [
    {
      name: "Base Plan",
      isBase: true,
      ...data.result
    },
    ...data.scenarios.map((s) => ({
      name: s.name,
      isBase: false,
      ...s.result
    }))
  ]

  /* ================= HELPERS ================= */

  const getRecommendation = (rsi: number) => {

    if (rsi >= 70) {
      return {
        label: "Strong Plan",
        message: "This plan is financially sustainable.",
        action: "Maintain contributions and avoid unnecessary risk."
      }
    }

    if (rsi >= 40) {
      return {
        label: "Moderate Plan",
        message: "This plan is viable but could underperform.",
        action: "Increase contributions or optimize growth strategy."
      }
    }

    return {
      label: "High Risk Plan",
      message: "This plan is unlikely to meet retirement needs.",
      action: "Increase savings, extend timeline, or adopt a higher growth model."
    }
  }

  /* ================= BEST ================= */

  const best = allOptions.reduce((prev, curr) =>
    curr.rsiScore > prev.rsiScore ? curr : prev
  )

  const base = allOptions.find(o => o.isBase)!

  const improvement =
    best.projectedValue - base.projectedValue

  /* ================= OVERALL INSIGHT ================= */

  const overallMessage = (() => {

    if (best.name === "Base Plan") {
      return "Your base plan remains the most effective strategy. Scenarios did not produce better outcomes."
    }

    if (best.rsiScore < 40) {
      return "All strategies show high risk. A major adjustment to your plan is required."
    }

    return `${best.name} provides a stronger retirement outcome compared to your base plan.`
  })()

  /* ================= UI ================= */

  return (
    <Card className="border-border/60">

      <CardHeader>
        <CardTitle className="text-base font-semibold text-black">
          Recommendations
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* ================= OVERALL ================= */}

        <div className="p-4 space-y-2 border rounded-xl bg-muted/30 border-border/60">

          <p className="text-sm font-semibold text-black">
            Overall Strategy
          </p>

          <p className="text-sm text-black">
            {overallMessage}
          </p>

          <p className="text-sm font-medium text-blue-600">
            {best.name === "Base Plan"
              ? "Continue with your current plan."
              : `Consider adopting "${best.name}" strategy for better outcomes.`}
          </p>

          {improvement > 0 && best.name !== "Base Plan" && (
            <p className="text-xs text-muted-foreground">
              Potential improvement: +MWK {improvement.toLocaleString()}
            </p>
          )}

        </div>

        {/* ================= BASE PLAN ================= */}

        <div className="space-y-3">

          <p className="text-sm font-semibold text-black">
            Base Plan Advice
          </p>

          <div className="p-4 border rounded-xl border-border/60">

            {(() => {
              const rec = getRecommendation(base.rsiScore)

              return (
                <div className="space-y-1">

                  <p className="text-sm font-semibold text-black">
                    {rec.label}
                  </p>

                  <p className="text-sm text-black">
                    {rec.message}
                  </p>

                  <p className="text-sm font-medium text-blue-600">
                    {rec.action}
                  </p>

                </div>
              )
            })()}

          </div>

        </div>

        {/* ================= SCENARIOS ================= */}

        {data.scenarios.length > 0 && (
          <div className="space-y-3">

            <p className="text-sm font-semibold text-black">
              Scenario Insights
            </p>

            {data.scenarios.map((scenario, i) => {

              const rec = getRecommendation(scenario.result.rsiScore)

              const isBest = scenario.name === best.name

              return (
                <div
                  key={i}
                  className={`p-4 border rounded-xl ${
                    isBest
                      ? "border-blue-500 bg-blue-50"
                      : "border-border/60"
                  }`}
                >

                  <div className="flex justify-between mb-2">

                    <p className="text-sm font-semibold text-black">
                      {scenario.name}
                    </p>

                    {isBest && (
                      <span className="text-xs text-blue-600">
                        Best Option
                      </span>
                    )}

                  </div>

                  <p className="text-sm text-black">
                    {rec.message}
                  </p>

                  <p className="text-sm font-medium text-blue-600">
                    {rec.action}
                  </p>

                </div>
              )
            })}

          </div>
        )}

        {/* ================= ML PLACEHOLDER ================= */}

        <div className="p-4 text-sm text-black border rounded-xl bg-muted/20 border-border/60">

          No AI-powered recommendations available yet.

          <p className="mt-1 text-xs text-muted-foreground">
            Future updates will include personalized insights based on predictive models.
          </p>

        </div>

      </CardContent>

    </Card>
  )
}