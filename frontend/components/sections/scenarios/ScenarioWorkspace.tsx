"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

import ScenarioTabs from "./ScenarioTabs"
import ScenarioPanel from "./ScenarioPanel"
import { getOverrides } from "./scenario-utils"

import { ProjectionInputs } from "@/types/ProjectionInputs"
import { ScenarioItem } from "@/types/scenario"
import { ProjectionResult } from "../projection/ProjectionResults"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()

  /* ================= STATE ================= */

  const [active, setActive] = useState<string>("base")

  const [scenarios, setScenarios] = useState<ScenarioItem[]>([])
  const [localResults, setLocalResults] = useState<ProjectionResult | null>(null)

  /* ================= ADD SCENARIO ================= */

  const MAX_SCENARIOS = 3

  const handleAddScenario = () => {

    if (scenarios.length >= MAX_SCENARIOS) {
      toast({
        title: "Limit Reached",
        description: "You can only create up to 3 scenarios to keep things organized.",
        variant: "destructive"
      });
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
      toast({
        title: "Save Base Simulation",
        description: "Would you like to save changes to the base simulation?",
        duration: 10000,
        action: {
          label: "Save",
          onClick: async () => {
            if (!localResults) {
              toast({ title: "Action Required", description: "Please run the simulation first before saving.", variant: "destructive" });
              return
            }

            if (!userId) {
              toast({ title: "Authentication Required", description: "Please log in to save simulations.", variant: "destructive" });
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

              toast({ title: "Saved", description: "Base simulation saved successfully!" });
            } catch (err) {
              console.error(err)
              toast({ title: "Error", description: "Failed to save base simulation.", variant: "destructive" });
            }
          }
        }
      });
      return
    }

    // For scenarios - existing logic
    if (!activeScenario) return
    if (!activeScenario.results) {
      toast({ title: "Action Required", description: "Please run simulation for this scenario before saving.", variant: "destructive" });
      return
    }

    if (!userId) {
      toast({ title: "Authentication Required", description: "Please log in to save scenarios.", variant: "destructive" });
      return
    }

    const overrides = getOverrides(baseInputs, activeScenario.inputs)

    if (Object.keys(overrides).length === 0) {
      toast({ title: "No Changes", description: "No changes detected. Modify at least one field to save as a scenario.", variant: "destructive" });
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

      toast({ title: "Saved", description: "Scenario saved successfully!" });
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Failed to save scenario.", variant: "destructive" });
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