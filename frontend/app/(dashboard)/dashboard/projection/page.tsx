"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { withSaveLock } from "@/utils/saveLock"
import ProjectionForm from "@/components/sections/projection/ProjectionForm"
import ProjectionResults, { ProjectionResult } from "@/components/sections/projection/ProjectionResults"
import ScenarioTabs from "@/components/sections/scenarios/ScenarioTabs"
import ScenarioPanel from "@/components/sections/scenarios/ScenarioPanel"
import NamingDialog from "@/components/ui/NamingDialog"
import ComprehensiveNamingDialog from "@/components/ui/ComprehensiveNamingDialog"
import { Button } from "@/components/ui/button"
import { ProjectionInputs } from "@/types/ProjectionInputs"
import { ScenarioItem } from "@/types/scenario"

/* ================= STORAGE ================= */

const getStorageKey = (userId?: string) =>
  userId ? `projection_state_${userId}` : "projection_state_guest"

/* ================= DEFAULT STATE ================= */

const defaultInputs: ProjectionInputs = {
  currentAge: "35",
  retirementAge: "65",

  monthlyIncome: "500000",
  currentSavings: "1500000",

  monthlyContribution: "50000",

  projectionStrategy: "balanced",

  incomeType: "stable",
  savingBehavior: "consistent",
  growthModel: "balanced",

  inflationRate: "8",

  includeIrregular: false,
  extraContribution: ""
}

/* ================= SAFE STORAGE ================= */

const asGrowthModel = (value: string): ProjectionInputs["growthModel"] => {
  const v = value.toLowerCase()
  if (v === "stable" || v === "balanced" || v === "high") return v
  return "balanced"
}

const asIncomeType = (value: string): ProjectionInputs["incomeType"] => {
  const v = value.toLowerCase()
  if (v === "stable" || v === "flexible" || v === "seasonal") return v
  return "stable"
}

const asSavingBehavior = (value: string): ProjectionInputs["savingBehavior"] => {
  const v = value.toLowerCase()
  if (v === "consistent" || v === "flexible" || v === "opportunistic") return v
  return "consistent"
}

const getStoredState = (userId?: string) => {
  if (typeof window === "undefined") return null

  try {
    const saved = sessionStorage.getItem(getStorageKey(userId))
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export default function SimulationPage() {

  /* ================= STATE LOADING ================= */

  const router = useRouter()
  const { data: session, status } = useSession()
  const userId = session?.user?.id

  const [inputs, setInputs] = useState<ProjectionInputs>(defaultInputs)
  const [results, setResults] = useState<ProjectionResult | null>(null)
  
  const lastCalculatedInputs = useRef<ProjectionInputs | null>(null)

  useEffect(() => {
    if (status === "loading") return

    const storageKey = getStorageKey(userId)
    const searchParams = new URLSearchParams(window.location.search)
    const loadId = searchParams.get("load")

    if (loadId) {
      // Load from Backend if ?load= is present
      fetch(`/api/simulation/get?id=${loadId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            const sim = data.data
            
            const historicInputs: ProjectionInputs = {
              currentAge: sim.age.toString(),
              retirementAge: sim.retirementAge.toString(),
              monthlyIncome: sim.monthlyIncome.toString(),
              monthlyContribution: sim.monthlyContribution.toString(),
              currentSavings: sim.currentSavings?.toString() || "0",
              inflationRate: sim.inflationRate.toString(),
              projectionStrategy: "balanced",
              growthModel: asGrowthModel(sim.growthModel),
              incomeType: asIncomeType(sim.incomeType),
              savingBehavior: asSavingBehavior(sim.savingBehavior),
              includeIrregular: sim.includeIrregular,
              extraContribution: sim.extraContribution?.toString() || ""
            }

            setInputs(historicInputs)
            lastCalculatedInputs.current = historicInputs

            if (sim.result) {
               setResults({
                  projectedSavings: sim.result.projectedSavings,
                  estimatedMonthlyIncome: sim.result.estimatedMonthlyIncome,
                  inflationAdjustedValue: sim.result.inflationAdjustedValue,
                  rsiScore: sim.result.rsiScore
               })
            }

            // Clean the URL so refresh doesn't trigger API fetch again
            window.history.replaceState(null, '', window.location.pathname)
            setCurrentSimulationId(loadId)
          }
        })
        .catch(console.error)
    } else {
      // Load from Session Storage using correct user context
      try {
        const saved = sessionStorage.getItem(storageKey)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.inputs) {
            setInputs(parsed.inputs)
            lastCalculatedInputs.current = parsed.inputs
          }
          if (parsed.results) {
            setResults(parsed.results)
          }
        }
      } catch {
        console.error("Failed to load session storage")
      }
    }
  }, [status, userId])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [mlOnline, setMlOnline] = useState<boolean | null>(null)
  
  // Scenario management
  const [active, setActive] = useState<string>("base")
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([])
  const [currentSimulationId, setCurrentSimulationId] = useState<string | null>(null)

  // Naming dialog state
  const [namingDialogOpen, setNamingDialogOpen] = useState(false)
  const [namingDialogTitle, setNamingDialogTitle] = useState("")
  const [namingDialogDescription, setNamingDialogDescription] = useState("")
  const [namingDialogDefaultName, setNamingDialogDefaultName] = useState("")
  const [namingDialogCallback, setNamingDialogCallback] = useState<((name: string) => void) | null>(null)

  // Comprehensive naming dialog state
  const [comprehensiveNamingOpen, setComprehensiveNamingOpen] = useState(false)
  const [comprehensiveNamingCallback, setComprehensiveNamingCallback] = useState<((simName: string, scenarioNames: Record<string, string>) => void) | null>(null)
  const isSavingRef = useRef(false)
  
  // Global save lock - shared across all save operations
  const globalSaveLockRef = useRef(false)

  /* ================= PERSIST ================= */

  useEffect(() => {
    if (status === "loading" || !userId) return

    const storageKey = getStorageKey(userId)
    const payload = {
      version: 1,
      inputs,
      results
    }

    sessionStorage.setItem(
      storageKey,
      JSON.stringify(payload)
    )
  }, [inputs, results, userId, status])

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

  /* ================= CALCULATE ================= */

  const handleCalculate = async () => {

    if (!userId) {
      setError("User session not found.")
      return
    }

    setLoading(true)
    setError(null)

    try {

      const res = await fetch("/api/simulation/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({

          userId,

          age: Number(inputs.currentAge),
          retirementAge: Number(inputs.retirementAge),

          monthlyIncome: Number(inputs.monthlyIncome),
          monthlyContribution: Number(inputs.monthlyContribution),

          currentSavings: Number(inputs.currentSavings || 0),
          inflationRate: Number(inputs.inflationRate || 0),

          projectionStrategy: inputs.projectionStrategy,

          growthModel: inputs.growthModel,
          incomeType: inputs.incomeType,
          savingBehavior: inputs.savingBehavior,

          lifestyle: "moderate"
        })
      })

      const data = await res.json()

      if (!data.success) {
        console.log("API RESPONSE:", data)

        throw new Error(
          data.message ||
          JSON.stringify(data) ||
          "Simulation failed"
        )
      }

      const mappedResults: ProjectionResult = {

        projectedSavings:
          data.data.projectedSavings,

        estimatedMonthlyIncome:
          data.data.estimatedMonthlyIncome,

        inflationAdjustedValue:
          data.data.inflationAdjustedValue,

        rsiScore:
          data.data.rsiScore,

        meta: data.data.meta
      }

      setResults(mappedResults)

      // ✅ store snapshot of inputs used
      lastCalculatedInputs.current = inputs

      setIsDirty(false)

    } catch (err) {

      console.error(err)

      setError(
        "Failed to run simulation. Please try again."
      )

    } finally {

      setLoading(false)

    }

  }

  /* ================= RESET ================= */

  const handleReset = () => {

    setInputs(defaultInputs)
    setResults(null)
    setError(null)
    setIsDirty(false)

    lastCalculatedInputs.current = null
    setCurrentSimulationId(null)
    setScenarios([])
    setActive("base")

    sessionStorage.removeItem(getStorageKey(userId))
  }

  /* ================= SAVE ================= */

  const handleAddScenario = async () => {
    if (!results) {
      alert("Please run a base simulation first before creating scenarios.")
      return
    }

    const MAX_SCENARIOS = 3
    
    if (scenarios.length >= MAX_SCENARIOS) {
      alert("You can only create up to 3 scenarios to keep things organized.")
      return
    }

    const newScenario: ScenarioItem = {
      id: crypto.randomUUID(),
      name: `Scenario ${scenarios.length + 1}`,
      inputs: { ...inputs }, // Clone base inputs
      results: null
    }

    setScenarios(prev => [...prev, newScenario])
    setActive(newScenario.id)
  }

  const handleDeleteScenario = (scenarioId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this scenario?\n\nThis action cannot be undone."
    );

    if (confirmDelete) {
      setScenarios(prev => prev.filter(s => s.id !== scenarioId));

      // If we deleted the active scenario, switch to base
      if (active === scenarioId) {
        setActive("base");
      }
    }
  }

  const handleRenameScenario = (scenarioId: string, newName: string) => {
    setScenarios(prev => prev.map(s => s.id === scenarioId ? { ...s, name: newName } : s));
  }

  const showNamingDialog = (
    title: string,
    description: string,
    defaultName: string,
    callback: (name: string) => void
  ) => {
    setNamingDialogTitle(title)
    setNamingDialogDescription(description)
    setNamingDialogDefaultName(defaultName)
    setNamingDialogCallback(() => callback)
    setNamingDialogOpen(true)
  }

  const generateDefaultName = (type: "base" | "scenario", index: number = 0): string => {
    const date = new Date().toLocaleDateString()
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (type === "base") {
      return `Base Simulation - ${date} ${time}`
    } else {
      return `Scenario ${index + 1} - ${date} ${time}`
    }
  }

  
  /* ================= UI ================= */

  return (

    <div className="flex flex-col gap-6 pt-12 lg:gap-8 max-w-7xl">

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
            Retirement Projection
          </h2>

          <p className="mt-1 text-muted-foreground">
            Simulate your pension growth
            and estimate future income.
          </p>
        </div>
        
        <Button variant="outline" onClick={handleReset}>Start New Simulation</Button>
      </div>

      <div
        className={`p-3 text-sm border rounded-md ${
          mlOnline
            ? "bg-blue-50 text-blue-700 border-blue-200"
            : "bg-amber-50 text-amber-700 border-amber-200"
        }`}
      >
        {mlOnline
          ? "ZikoML is online. You are using ML-powered retirement scoring."
          : "ZikoML is currently offline or delayed. Safe fallback engine will be used automatically."}
      </div>

      {error && (
        <div className="p-3 text-sm border rounded-md bg-destructive/10 text-destructive border-destructive/30">
          {error}
        </div>
      )}

      {/* ================= SCENARIO TABS ================= */}
      <ScenarioTabs
        scenarios={scenarios}
        active={active}
        onChange={setActive}
        onAdd={handleAddScenario}
        onDelete={handleDeleteScenario}
        onRename={handleRenameScenario}
        canDelete={!currentSimulationId}
      />

      {/* ================= CONTENT PANEL ================= */}
      <ScenarioPanel
        isBase={active === "base"}
        hasScenarios={scenarios.length > 0}
        baseInputs={inputs}
        scenario={active === "base" ? null : scenarios.find(s => s.id === active) || null}
        onChange={(id, data) => {
          setScenarios(prev => prev.map(s => s.id === id ? { ...s, inputs: data } : s))
        }}
        onUpdateResult={(id, result) => {
          setScenarios(prev => prev.map(s => s.id === id ? { ...s, results: result } : s))
        }}
        onBaseInputChange={(data) => {
          setInputs(data)
        }}
        onBaseResultUpdate={(result: ProjectionResult) => {
          setResults(result)
        }}
        onSave={async () => {
          // Check if we have results to save
          console.log("[SAVE TRACE] onSave called, active:", active)
          const hasResults = active === "base" ? results : scenarios.find(s => s.id === active)?.results

          if (!hasResults) {
            alert("Please run a simulation first before saving.")
            return
          }

          setComprehensiveNamingCallback(() => async (simName: string, scenarioNames: Record<string, string>) => {
            const doSave = async (force: boolean) => {
              console.log("[SAVE TRACE] Callback executing, simName:", simName, "type:", typeof simName)
              console.log("[SAVE TRACE] scenarioNames:", scenarioNames)
              console.log("[SAVE FLOW] Naming dialog confirmed, starting save...")
              
              // Prevent double execution with global lock
              if (isSavingRef.current || globalSaveLockRef.current) {
                console.log("[SAVE TRACE] Blocked - already saving, isSavingRef:", isSavingRef.current, "global:", globalSaveLockRef.current)
                return
              }
              isSavingRef.current = true
              globalSaveLockRef.current = true
              
              const dataToSave = lastCalculatedInputs.current || inputs

              if (!dataToSave.currentAge || !dataToSave.retirementAge) {
                alert("Missing age details. Please fill out the form and run a projection first.")
                isSavingRef.current = false
                globalSaveLockRef.current = false
                return
              }

              if (!results) {
                alert("Please run a simulation first before saving.")
                isSavingRef.current = false
                globalSaveLockRef.current = false
                return
              }

              if (!userId) {
                alert("You must be logged in to save simulations.")
                isSavingRef.current = false
                globalSaveLockRef.current = false
                return
              }

              try {
                // Use user-provided names directly (validation in dialog ensures they're not empty)
                if (!simName || typeof simName !== 'string') {
                  console.error("[SAVE ERROR] simName is invalid:", simName)
                  alert("Invalid simulation name provided. Please try again.")
                  isSavingRef.current = false
                  globalSaveLockRef.current = false
                  return
                }
                const simulationName = simName.trim()

                // Update scenario names with user-provided names or defaults if empty
                const updatedScenarios = scenarios.map((scenario, index) => ({
                  ...scenario,
                  name: (scenarioNames[scenario.id] && typeof scenarioNames[scenario.id] === 'string' && scenarioNames[scenario.id].trim() !== "") 
                    ? scenarioNames[scenario.id].trim() 
                    : generateDefaultName("scenario", index)
                }))

                // Flatten the data structure to match API expectations
                console.log("[SAVE FLOW] Sending API request [PROJECTION PAGE]...")
                let res;
                try {
                  res = await withSaveLock(async () => {
                  const response = await fetch("/api/simulation/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      userId,
                      name: simulationName,
                      age: Number(dataToSave.currentAge),
                      retirementAge: Number(dataToSave.retirementAge),
                      monthlyIncome: Number(dataToSave.monthlyIncome),
                      monthlyContribution: Number(dataToSave.monthlyContribution),
                      currentSavings: Number(dataToSave.currentSavings || 0),
                      inflationRate: Number(dataToSave.inflationRate || 0),
                      growthModel: dataToSave.growthModel,
                      incomeType: dataToSave.incomeType,
                      savingBehavior: dataToSave.savingBehavior,
                      includeIrregular: dataToSave.includeIrregular || false,
                      extraContribution: dataToSave.extraContribution || "",
                      lifestyle: "moderate",
                      results: results,
                      scenarios: updatedScenarios,
                      forceSave: force
                    })
                  });
                  return response;
                });
                } catch (error) {
                  console.log("[SAVE FLOW] Save blocked by global lock (expected behavior)")
                  // Early return if save is blocked by global lock
                  isSavingRef.current = false
                  globalSaveLockRef.current = false
                  return;
                }

                const data = await res.json()

                if (!data.success) {
                  if (data.isDuplicate) {
                    isSavingRef.current = false
                    globalSaveLockRef.current = false
                    const confirmSave = window.confirm(data.message + "\n\nDo you want to save it anyway?");
                    if (confirmSave) {
                      // Retry save
                      doSave(true);
                    }
                    return;
                  }
                  throw new Error(data.message)
                }

                alert(`"${simulationName}" saved successfully with ${updatedScenarios.length} scenario(s)!`)
                console.log("[SAVE FLOW] Save completed successfully [PROJECTION PAGE]")
                handleReset()

              } catch (err) {
                console.error(err)
                alert("Failed to save simulation")
              } finally {
                // Reset both saving locks
                isSavingRef.current = false
                globalSaveLockRef.current = false
              }
            }
            doSave(false);
          })

          // Open naming dialog immediately after setting the callback
          setComprehensiveNamingOpen(true)
        }}
      />

      {/* Comprehensive Naming Dialog */}
      <ComprehensiveNamingDialog
        isOpen={comprehensiveNamingOpen}
        onClose={() => setComprehensiveNamingOpen(false)}
        onConfirm={(simName, scenarioNames) => {
          console.log("[SAVE TRACE] Dialog onConfirm called with:", { simName, scenarioNames })
          if (comprehensiveNamingCallback) {
            console.log("[SAVE TRACE] Calling comprehensiveNamingCallback")
            comprehensiveNamingCallback(simName, scenarioNames)
          } else {
            console.log("[SAVE TRACE] No callback found!")
          }
        }}
        defaultSimulationName={generateDefaultName("base")}
        scenarios={scenarios}
      />

    </div>

  )
}