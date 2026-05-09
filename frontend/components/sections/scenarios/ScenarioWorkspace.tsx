"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

import ScenarioTabs from "./ScenarioTabs"
import ScenarioPanel from "./ScenarioPanel"
import { getOverrides } from "./scenario-utils"

import { ProjectionInputs } from "@/types/ProjectionInputs"
import { ScenarioItem } from "@/types/scenario"
import { ProjectionResult } from "../projection/ProjectionResults"

/* ================= TYPES ================= */

interface ScenarioWorkspaceProps {
  simulationId: string
  baseInputs: ProjectionInputs
}

/* ================= COMPONENT ================= */

export default function ScenarioWorkspace({
  simulationId,
  baseInputs
}: ScenarioWorkspaceProps) {

  /* ================= SESSION ================= */
  
  const { data: session } = useSession()
  const userId = session?.user?.id

  /* ================= STATE ================= */

  const [active, setActive] = useState<string>("base")

  const [scenarios, setScenarios] = useState<ScenarioItem[]>([])
  const [localResults, setLocalResults] = useState<ProjectionResult | null>(null)

  /* ================= ADD SCENARIO ================= */

  const MAX_SCENARIOS = 3

  const handleAddScenario = () => {

    if (scenarios.length >= MAX_SCENARIOS) {
      alert("You can only create up to 3 scenarios to keep things organized.")
      return
    }

    const newScenario: ScenarioItem = {
      id: crypto.randomUUID(),

      name: `Scenario ${scenarios.length + 1}`,

      // 🔥 CRITICAL: clone base (avoid shared reference bug)
      inputs: { ...baseInputs },

      results: null
    }

    setScenarios((prev) => [...prev, newScenario])

    setActive(newScenario.id)
  }

  /* ================= UPDATE SCENARIO ================= */

  const updateScenario = (
    id: string,
    data: ProjectionInputs
  ) => {

    setScenarios((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              inputs: { ...data } // 🔥 ensure immutability
            }
          : s
      )
    )
  }

  /* ================= UPDATE SCENARIO RESULT ================= */

  const updateScenarioResult = (
    id: string,
    result: ProjectionResult
  ) => {
    setScenarios((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              results: result
            }
          : s
      )
    )
  }

  /* ================= SAVE SCENARIO ================= */

  const handleSaveScenario = async () => {
    if (active === "base") {
      // For base simulation, show confirmation dialog
      const confirmSave = window.confirm(
        "Would you like to save changes to the base simulation?\n\n" +
        "Click 'OK' to save the base simulation, or 'Cancel' to go back and add scenarios instead."
      )
      
      if (!confirmSave) {
        // User cancelled - redirect to add scenario
        handleAddScenario()
        return
      }
      
      // User confirmed - save base simulation
      if (!localResults) {
        alert("Please run the simulation first before saving.")
        return
      }

      if (!userId) {
        alert("Please log in to save simulations.")
        return
      }

      try {
        const res = await fetch("/api/simulation/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            name: `Base Simulation - ${new Date().toLocaleDateString()}`,
            age: Number(baseInputs.currentAge),
            retirementAge: Number(baseInputs.retirementAge),
            monthlyIncome: Number(baseInputs.monthlyIncome),
            monthlyContribution: Number(baseInputs.monthlyContribution),
            currentSavings: Number(baseInputs.currentSavings || 0),
            inflationRate: Number(baseInputs.inflationRate || 0),
            lifestyle: "moderate",
            growthModel: baseInputs.growthModel,
            incomeType: baseInputs.incomeType,
            savingBehavior: baseInputs.savingBehavior,
            results: localResults,
            forceSave: true
          })
        })

        const data = await res.json()
        if (!data.success) throw new Error(data.message)

        alert("Base simulation saved successfully!")
      } catch (err) {
        console.error(err)
        alert("Failed to save base simulation.")
      }
      return
    }

    // For scenarios - existing logic
    if (!activeScenario) return
    if (!activeScenario.results) {
      alert("Please run simulation for this scenario before saving.")
      return
    }

    if (!userId) {
      alert("Please log in to save scenarios.")
      return
    }

    const overrides = getOverrides(baseInputs, activeScenario.inputs)

    if (Object.keys(overrides).length === 0) {
      alert("No changes detected. Modify at least one field to save as a scenario.")
      return
    }

    try {
      const res = await fetch("/api/simulation/scenario/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          simulationId,
          name: activeScenario.name,
          overrides,
          results: activeScenario.results
        })
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.message)

      alert("Scenario saved successfully!")
    } catch (err) {
      console.error(err)
      alert("Failed to save scenario.")
    }
  }

  /* ================= GET ACTIVE ================= */

  const activeScenario =
    active === "base"
      ? null
      : scenarios.find((s) => s.id === active) || null

  /* ================= UI ================= */

  return (

    <div className="space-y-6">

      {/* ================= TABS ================= */}
      <ScenarioTabs
        scenarios={scenarios}
        active={active}
        onChange={setActive}
        onAdd={handleAddScenario}
        onBaseClick={() => window.location.href = '/dashboard/projection'}
      />

      {/* ================= PANEL ================= */}
      <ScenarioPanel
        isBase={active === "base"}
        baseInputs={baseInputs}
        scenario={activeScenario}
        onChange={updateScenario}
        onUpdateResult={updateScenarioResult}
        onAddScenario={handleAddScenario}
        onSave={handleSaveScenario}
      />

    </div>

  )
}