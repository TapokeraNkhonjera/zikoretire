"use client"

import { useState } from "react"

import { AnalyticsData } from "@/types/analytics"

import SimulationSelector from "@/components/sections/analytics/SimulationSelector"
import AnalyticsOverview from "@/components/sections/analytics/AnalyticsOverview"
import ComparisonChart from "@/components/sections/analytics/ComparisonChart"
import ScenarioComparisonTable from "@/components/sections/analytics/ScenarioComparisonTable"
import RsiAnalysis from "@/components/sections/analytics/RsiAnalysis"
import RecommendationPanel from "@/components/sections/analytics/RecommendationPanel"

export default function AnalyticsPage() {

  const simulations: AnalyticsData[] = [
    {
      id: "1",
      name: "Base Plan",
      result: {
        projectedValue: 15000000,
        monthlyRetirementIncome: 250000,
        rsiScore: 68,
      },
      scenarios: [
        {
          name: "Aggressive",
          result: {
            projectedValue: 22000000,
            monthlyRetirementIncome: 320000,
            rsiScore: 82,
          },
        },
        {
          name: "Conservative",
          result: {
            projectedValue: 11000000,
            monthlyRetirementIncome: 180000,
            rsiScore: 55,
          },
        },
      ],
      recommendations: [
        {
          message: "Increase contributions by 10%",
          type: "improvement",
        },
      ],
    },
  ]

  const [selectedId, setSelectedId] = useState<string>("")

  const selectedSimulation =
    simulations.find((s) => s.id === selectedId) || null

  return (
    <div className="flex flex-col gap-6 pt-12 lg:gap-8">

      {/* HEADER — MATCH DASHBOARD */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          Simulation Analytics
        </h2>

        <p className="mt-1 text-muted-foreground">
          Analyze your simulations and compare different retirement strategies.
        </p>
      </div>

      {/* SELECT SIMULATION */}
      <SimulationSelector
        simulations={simulations}
        selectedId={selectedId}
        onChange={setSelectedId}
      />

      {!selectedSimulation ? (
        <p className="text-muted-foreground">
          Select a simulation to begin analysis.
        </p>
      ) : (
        <>
          <AnalyticsOverview data={selectedSimulation} />

          <ComparisonChart data={selectedSimulation} />

          <div className="grid gap-6 lg:grid-cols-2">
            <ScenarioComparisonTable data={selectedSimulation} />
            <RsiAnalysis data={selectedSimulation} />
          </div>

          <RecommendationPanel data={selectedSimulation} />
        </>
      )}

    </div>
  )
}