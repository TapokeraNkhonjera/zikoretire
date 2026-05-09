"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"

import { AnalyticsData } from "@/types/analytics"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import SimulationSelector from "@/components/sections/analytics/SimulationSelector"
import EnhancedSimulationSelector from "@/components/sections/analytics/EnhancedSimulationSelector"
import AnalyticsOverview from "@/components/sections/analytics/AnalyticsOverview"
import ComparisonChart from "@/components/sections/analytics/ComparisonChart"
import ScenarioComparisonTable from "@/components/sections/analytics/ScenarioComparisonTable"
import RsiAnalysis from "@/components/sections/analytics/RsiAnalysis"
import RecommendationPanel from "@/components/sections/analytics/RecommendationPanel"
import SimulationComparison from "@/components/sections/analytics/SimulationComparison"

export default function AnalyticsPage() {

  const { data: session } = useSession()
  const userId = session?.user?.id

  const searchParams = useSearchParams()
  const preselectedId = searchParams.get("simulationId") || ""

  const [simulations, setSimulations] = useState<AnalyticsData[]>([])
  const [selectedId, setSelectedId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [mlOnline, setMlOnline] = useState<boolean | null>(null)
  const [comparisonMode, setComparisonMode] = useState<boolean>(false)

  /* ================= FETCH REAL DATA ================= */

  useEffect(() => {

    if (!userId) return

    const fetchData = async () => {

      try {

        const res = await fetch(
          `/api/simulation/history?userId=${userId}`
        )

        const data = await res.json()

        if (!data.success) return

        /* ================= MAP HISTORY → ANALYTICS ================= */

        const mapped: AnalyticsData[] = data.data.map((sim: {
          id: string
          createdAt: string
          name?: string
          result: {
            projectedValue?: number
            estimatedMonthlyIncome?: number
            monthlyIncome?: number
            rsiScore?: number
            riskScore?: number | null
            confidenceScore?: number | null
          } | null
          scenarios?: {
            id: string
            name: string
            result?: {
              projectedValue?: number
              estimatedMonthlyIncome?: number
              monthlyIncome?: number
              rsiScore?: number
              riskScore?: number | null
              confidenceScore?: number | null
            } | null
          }[]
          recommendations?: {
            message: string
            type: string
          }[]
        }) => ({

          id: sim.id,

          name: sim.name || `Simulation ${sim.id.slice(-4)}`,

          result: {
            projectedValue:
              sim.result?.projectedValue ?? 0,

            monthlyRetirementIncome:
              sim.result?.estimatedMonthlyIncome ??
              sim.result?.monthlyIncome ??
              0,

            rsiScore:
              sim.result?.rsiScore ?? 0,

            riskScore:
              sim.result?.riskScore ?? null,

            confidenceScore:
              sim.result?.confidenceScore ?? null
          },

          scenarios: (sim.scenarios ?? []).map((s) => ({
            name: s.name,
            result: {
              projectedValue:
                s.result?.projectedValue ?? 0,

              monthlyRetirementIncome:
                s.result?.estimatedMonthlyIncome ??
                s.result?.monthlyIncome ??
                0,

              rsiScore:
                s.result?.rsiScore ?? 0,

              riskScore:
                s.result?.riskScore ?? null,

              confidenceScore:
                s.result?.confidenceScore ?? null
            }
          })),

          recommendations:
            sim.recommendations ?? []

        }))

        setSimulations(mapped)

      } catch (err) {

        console.error("Analytics fetch error:", err)

      } finally {

        setLoading(false)

      }

    }

    fetchData()

  }, [userId])

  useEffect(() => {
    let ignore = false

    const checkMLStatus = async () => {
      try {
        const res = await fetch("/api/ml/status", { cache: "no-store" })
        const data = await res.json()
        if (!ignore) {
          setMlOnline(Boolean(data?.online))
        }
      } catch {
        if (!ignore) {
          setMlOnline(false)
        }
      }
    }

    checkMLStatus()
    return () => {
      ignore = true
    }
  }, [])

  /* ================= AUTO SELECT FROM HISTORY ================= */

  useEffect(() => {

    if (preselectedId) {
      setSelectedId(preselectedId)
    }

  }, [preselectedId])

  /* ================= SELECTED SIM ================= */

  const selectedSimulation = useMemo(
    () =>
      simulations.find((s) => s.id === selectedId) || null,
    [selectedId, simulations]
  )

  /* ================= UI ================= */

  return (

    <div className="flex flex-col gap-6 pt-12 lg:gap-8">

      {/* HEADER */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
              Simulation Analytics
            </h2>

            <p className="mt-1 text-muted-foreground">
              {comparisonMode 
                ? "Compare multiple simulations or analyze scenarios." 
                : "Analyze your simulations and compare different retirement strategies."
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="comparison-mode"
              checked={comparisonMode}
              onCheckedChange={setComparisonMode}
            />
            <Label htmlFor="comparison-mode" className="text-sm font-medium">
              Comparison Mode
            </Label>
          </div>
        </div>
      </div>

      <div
        className={`p-3 text-sm border rounded-md ${
          mlOnline
            ? "bg-blue-50 text-blue-700 border-blue-200"
            : "bg-amber-50 text-amber-700 border-amber-200"
        }`}
      >
        {mlOnline
          ? "ZikoML is online for analytics-backed scoring."
          : "ZikoML is currently unavailable. Analytics may include fallback-engine results."}
      </div>

      {/* LOADING */}
      {loading ? (
        <p className="text-muted-foreground">
          Loading analytics...
        </p>
      ) : (

        <>
          {/* SELECTOR - Only show in single simulation mode */}
          {!comparisonMode && (
            <EnhancedSimulationSelector
              simulations={simulations}
              selectedId={selectedId}
              onChange={setSelectedId}
              onFilterChange={(filters) => {
                console.log("Filters changed:", filters)
              }}
            />
          )}

          {comparisonMode ? (
          <SimulationComparison simulations={simulations} />
        ) : (
          <>
            {!selectedSimulation ? (
              <p className="text-muted-foreground">
                Select a simulation to begin analysis.
              </p>
            ) : (
              <>
                <AnalyticsOverview
                  data={selectedSimulation}
                />

                <ComparisonChart
                  data={selectedSimulation}
                />

                <div className="grid gap-6 lg:grid-cols-2">

                  <ScenarioComparisonTable
                    data={selectedSimulation}
                  />

                  <RsiAnalysis
                    data={selectedSimulation}
                  />

                </div>

                <RecommendationPanel
                  data={selectedSimulation}
                />

              </>
            )}
          </>
        )}

        </>
      )}

    </div>
  )
}