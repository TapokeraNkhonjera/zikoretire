"use client"

import { useState } from "react"

import ProjectionForm, {
  ProjectionInputs
} from "@/components/sections/projection/ProjectionForm"

import ProjectionResults, {
  ProjectionResult
} from "@/components/sections/projection/ProjectionResults"

export default function SimulationPage() {

  const [inputs, setInputs] = useState<ProjectionInputs>({
    currentAge: "",
    retirementAge: "",
    monthlyContribution: "",
    frequency: "monthly",
    expectedReturn: "",
    inflationRate: "",
    includeVoluntary: false
  })

  const [results, setResults] =
    useState<ProjectionResult | null>(null)

  const handleCalculate = () => {

    const mockResults: ProjectionResult = {
      projectedSavings: 12500000,
      estimatedMonthlyIncome: 250000,
      inflationAdjustedValue: 8200000,
      rsiScore: 78
    }

    setResults(mockResults)
  }

  const handleReset = () => {
    setInputs({
      currentAge: "",
      retirementAge: "",
      monthlyContribution: "",
      frequency: "monthly",
      expectedReturn: "",
      inflationRate: "",
      includeVoluntary: false
    })

    setResults(null)
  }

  const handleSaveSimulation = (
    data: ProjectionResult
  ) => {
    console.log("Saving:", data)
  }

  const handleAddScenario = () => {
    console.log("Add Scenario clicked")
  }

  return (

    <div className="flex flex-col gap-6 pt-12 lg:gap-8">

      {/* HEADER (MATCH DASHBOARD) */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          Retirement Projection
        </h2>

        <p className="mt-1 text-muted-foreground">
          Simulate your pension growth and estimate your future income.
        </p>
      </div>

      {/* CONTENT */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* FORM */}
        <div className="p-6 border bg-card rounded-2xl">
          <ProjectionForm
            inputs={inputs}
            setInputs={setInputs}
            onCalculate={handleCalculate}
            onReset={handleReset}
          />
        </div>

        {/* RESULTS */}
        <div className="p-6 border bg-card rounded-2xl">
          <ProjectionResults
            results={results}
            onSave={handleSaveSimulation}
            onAddScenario={handleAddScenario}
          />
        </div>

      </div>

    </div>

  )
}