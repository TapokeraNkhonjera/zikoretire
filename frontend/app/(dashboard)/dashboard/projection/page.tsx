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

const STORAGE_KEY = "projection_state_v1"

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

const getStoredState = () => {
  if (typeof window === "undefined") return null

  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export default function SimulationPage() {

  /* ================= SESSION ================= */

  const router = useRouter()
  const { data: session } = useSession()
  const userId = session?.user?.id

  /* ================= STATE ================= */

  const [inputs, setInputs] = useState<ProjectionInputs>(defaultInputs)
  const [results, setResults] = useState<ProjectionResult | null>(null)

  /* ================= LOAD PERSISTED STATE ================= */

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const loadId = searchParams.get("load")

    if (loadId) {
      // 1. Load from Backend if ?load= is present
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
              growthModel: sim.growthModel.toLowerCase() as any,
              incomeType: sim.incomeType.toLowerCase() as any,
              savingBehavior: sim.savingBehavior.toLowerCase() as any,
              includeIrregular: sim.includeIrregular,
              extraContribution: sim.extraContribution?.toString() || ""
            }

            setInputs(historicInputs)
            lastCalculatedInputs.current = historicInputs

            if (sim.result) {
               const historicResult: ProjectionResult = {
                  projectedSavings: sim.result.projectedSavings,
                  estimatedMonthlyIncome: sim.result.estimatedMonthlyIncome,
                  inflationAdjustedValue: sim.result.inflationAdjustedValue,
                  rsiScore: sim.result.rsiScore
               }
               setResults(historicResult)
            }

            // Clean the URL so refresh doesn't trigger API fetch again
            window.history.replaceState(null, '', window.location.pathname)
          }
        })
        .catch(console.error)
    } else {
      // 2. Otherwise load from Session Storage
      const stored = getStoredState()
      if (stored) {
        if (stored.inputs) {
          setInputs(stored.inputs)
          lastCalculatedInputs.current = stored.inputs
        }
        if (stored.results) {
          setResults(stored.results)
        }
      }
    }
  }, [])

  const [loading, setLoading] = useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const [isDirty, setIsDirty] = useState(false)

  /* ================= TRACK LAST CALCULATED INPUTS ================= */

  const lastCalculatedInputs = useRef<ProjectionInputs | null>(null)

  /* ================= PERSIST ================= */

  useEffect(() => {
    const payload = {
      version: 1,
      inputs,
      results
    }

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(payload)
    )
  }, [inputs, results])

  /* ================= DIRTY CHECK ================= */

  useEffect(() => {
    if (!results || !lastCalculatedInputs.current) return

    const isSame =
      JSON.stringify(inputs) ===
      JSON.stringify(lastCalculatedInputs.current)

    setIsDirty(!isSame)

  }, [inputs, results])

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

    sessionStorage.removeItem(STORAGE_KEY)
  }

  /* ================= SAVE ================= */

  const handleSaveSimulation =
    async (resultData: ProjectionResult) => {

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

            results: resultData
          })

        }
      )

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.message)
      }

      alert("Simulation saved!")

    } catch (err) {

      console.error(err)

      alert("Failed to save simulation")

    }

  }

  const handleAddScenario = async () => {
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
          results: results
        })
      })

      const data = await res.json()

      if (!data.success) {
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
          />
        </div>

        <div className="p-6 border bg-card rounded-2xl">

          {loading ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Running simulation...
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