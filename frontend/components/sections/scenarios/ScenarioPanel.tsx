"use client"

import { useState } from "react"

import ProjectionForm from "../projection/ProjectionForm"
import ProjectionResults, {
  ProjectionResult
} from "../projection/ProjectionResults"

import { ProjectionInputs } from "@/types/ProjectionInputs"
import { ScenarioItem } from "@/types/scenario"
import { hasOverrides } from "./scenario-utils"

interface ScenarioPanelProps {
  isBase: boolean
  baseInputs: ProjectionInputs
  scenario: ScenarioItem | null
  onChange: (id: string, data: ProjectionInputs) => void
  onUpdateResult: (id: string, result: ProjectionResult) => void
  onAddScenario: () => void
  onSave: () => void
}

export default function ScenarioPanel({
  isBase,
  baseInputs,
  scenario,
  onChange,
  onUpdateResult,
  onAddScenario,
  onSave
}: ScenarioPanelProps) {

  const [localResults, setLocalResults] =
    useState<ProjectionResult | null>(null)

  const [error, setError] =
    useState<string | null>(null)

  const [loading, setLoading] = useState(false)

  /* ================= CURRENT INPUTS ================= */

  const currentInputs: ProjectionInputs =
    isBase
      ? baseInputs
      : scenario?.inputs || baseInputs

  /* ================= CURRENT RESULTS ================= */

  const currentResults =
    isBase
      ? localResults
      : scenario?.results || null

  /* ================= RUN ================= */

  const handleRun = async () => {

    if (!isBase) {

      const valid = hasOverrides(
        baseInputs,
        currentInputs
      )

      if (!valid) {
        setError("Modify at least one field to create a scenario.")
        return
      }
    }

    setError(null)
    setLoading(true)

    try {

      const res = await fetch("/api/simulation/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({

          age: Number(currentInputs.currentAge),
          retirementAge: Number(currentInputs.retirementAge),

          monthlyIncome: Number(currentInputs.monthlyIncome),
          monthlyContribution: Number(currentInputs.monthlyContribution),

          currentSavings: Number(currentInputs.currentSavings || 0),
          inflationRate: Number(currentInputs.inflationRate || 0),

          growthModel: currentInputs.growthModel,
          incomeType: currentInputs.incomeType,
          savingBehavior: currentInputs.savingBehavior,

          lifestyle: "moderate"
        })
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error()
      }

      const result: ProjectionResult = {
        projectedSavings: data.data.projectedSavings,
        estimatedMonthlyIncome: data.data.estimatedMonthlyIncome,
        inflationAdjustedValue: data.data.inflationAdjustedValue,
        rsiScore: data.data.rsiScore,
        meta: data.data.meta
      }

      if (isBase) {
        setLocalResults(result)
      } else if (scenario) {
        onUpdateResult(scenario.id, result)
      }

    } catch (err) {

      console.error(err)
      setError("Failed to run simulation")

    } finally {
      setLoading(false)
    }
  }

  /* ================= CHANGE ================= */

  const handleChange = (data: ProjectionInputs) => {

    if (!isBase && scenario) {
      onChange(scenario.id, data)
    }
  }

  /* ================= UI ================= */

  return (

    <div className="grid gap-6 lg:grid-cols-2">

      {/* LEFT: FORM */}
      <div className="p-6 border bg-card rounded-2xl">

        <ProjectionForm
          inputs={currentInputs}
          setInputs={handleChange}
          onCalculate={handleRun}
          onReset={() => {}}
          isLoading={loading}
        />

        {!isBase && (
          <p className="mt-3 text-xs text-muted-foreground">
            Only modified values override the base simulation.
          </p>
        )}

        {error && (
          <p className="mt-3 text-sm text-destructive">
            {error}
          </p>
        )}

      </div>

      {/* RIGHT: RESULTS */}
      <div className="p-6 border bg-card rounded-2xl">

        {loading ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Processing scenario with ML and fail-safe checks...
          </div>
        ) : (
          <ProjectionResults
            results={currentResults}
            isDirty={false}
            onSave={onSave}
            saveLabel={isBase ? "Update Base Simulation" : "Save Scenario"}
            onAddScenario={onAddScenario}
          />
        )}

      </div>

    </div>

  )
}