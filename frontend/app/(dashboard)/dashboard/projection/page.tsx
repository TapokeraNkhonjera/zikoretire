"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import ProjectionForm from "@/components/sections/projection/ProjectionForm"

import ProjectionResults, {
  ProjectionResult
} from "@/components/sections/projection/ProjectionResults"

import { ProjectionInputs } from "@/types/ProjectionInputs"

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

    sessionStorage.removeItem(getStorageKey(userId))
  }

  /* ================= SAVE ================= */

  const handleSaveSimulation =
    async (resultData: ProjectionResult, forceSave = false) => {

    const dataToSave = lastCalculatedInputs.current || inputs

    if (!dataToSave.currentAge || !dataToSave.retirementAge) {
      alert("Missing age details. Please fill out the form and run a projection first.")
      return
    }

    try {

      if (!userId) return

      const res = await fetch(
        "/api/simulation/save",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            userId,

            age:
              Number(dataToSave.currentAge),

            retirementAge:
              Number(dataToSave.retirementAge),

            monthlyIncome:
              Number(dataToSave.monthlyIncome),

            monthlyContribution:
              Number(dataToSave.monthlyContribution),

            currentSavings:
              Number(dataToSave.currentSavings || 0),

            inflationRate:
              Number(dataToSave.inflationRate || 0),

            lifestyle: "moderate",

            growthModel:
              dataToSave.growthModel,

            incomeType:
              dataToSave.incomeType,

            savingBehavior:
              dataToSave.savingBehavior,

            results: resultData,
            forceSave
          })

        }
      )

      const data = await res.json()

      if (!data.success) {
        if (data.isDuplicate) {
          const confirmSave = window.confirm(data.message + "\n\nDo you want to save it anyway?");
          if (confirmSave) {
            handleSaveSimulation(resultData, true);
          }
          return;
        }
        throw new Error(data.message)
      }

      alert("Simulation saved!")

    } catch (err) {

      console.error(err)

      alert("Failed to save simulation")

    }

  }

  const handleAddScenario = async (forceSave = false) => {
    if (!results) {
      alert("Please run a simulation first")
      return
    }

    const dataToSave = lastCalculatedInputs.current || inputs

    if (!dataToSave.currentAge || !dataToSave.retirementAge) {
      alert("Missing age details. Please fill out the form and run a projection first.")
      return
    }

    try {
      if (!userId) return

      setLoading(true)

      const res = await fetch("/api/simulation/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          age: Number(dataToSave.currentAge),
          retirementAge: Number(dataToSave.retirementAge),
          monthlyIncome: Number(dataToSave.monthlyIncome),
          monthlyContribution: Number(dataToSave.monthlyContribution),
          currentSavings: Number(dataToSave.currentSavings || 0),
          inflationRate: Number(dataToSave.inflationRate || 0),
          lifestyle: "moderate",
          growthModel: dataToSave.growthModel,
          incomeType: dataToSave.incomeType,
          savingBehavior: dataToSave.savingBehavior,
          results: results,
          forceSave
        })
      })

      const data = await res.json()

      if (!data.success) {
        if (data.isDuplicate) {
          const confirmSave = window.confirm(data.message + "\n\nDo you want to create a scenario from it anyway?");
          if (confirmSave) {
            handleAddScenario(true);
          }
          return;
        }
        throw new Error(data.message)
      }

      router.push(`/dashboard/simulation/${data.data.simulationId}`)

    } catch (err) {
      console.error(err)
      alert("Failed to create scenario workspace")
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */

  return (

    <div className="flex flex-col gap-6 pt-12 lg:gap-8 max-w-7xl">

      <div>
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Retirement Projection
        </h2>

        <p className="mt-1 text-muted-foreground">
          Simulate your pension growth
          and estimate future income.
        </p>
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

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="p-6 border bg-card rounded-2xl">
          <ProjectionForm
            inputs={inputs}
            setInputs={setInputs}
            onCalculate={handleCalculate}
            onReset={handleReset}
            isLoading={loading}
          />
        </div>

        <div className="p-6 border bg-card rounded-2xl">

          {loading ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Processing your form with ML and fail-safe checks...
            </div>
          ) : (
            <ProjectionResults
              results={results}
              isDirty={isDirty}
              onSave={handleSaveSimulation}
              onAddScenario={handleAddScenario}
            />
          )}

        </div>

      </div>

    </div>

  )
}