"use client"

import { useState } from "react"

import ProjectionForm,
{
  ProjectionInputs
}
from "@/components/sections/projection/ProjectionForm"

import ProjectionResults,
{
  ProjectionResult
}
from "@/components/sections/projection/ProjectionResults"



export default function SimulationPage() {

  /* ===============================
     INPUT STATE
  ================================ */

  const [inputs, setInputs] =
    useState<ProjectionInputs>({

      currentAge: "",
      retirementAge: "",

      monthlyContribution: "",
      frequency: "monthly",

      expectedReturn: "",
      inflationRate: "",

      includeVoluntary: false

    })


  /* ===============================
     RESULTS STATE
  ================================ */

  const [results, setResults] =
    useState<ProjectionResult | null>(
      null
    )


  /* ===============================
     CALCULATE
  ================================ */

  const handleCalculate = () => {

    const mockResults: ProjectionResult = {

      projectedSavings: 12500000,

      estimatedMonthlyIncome: 250000,

      inflationAdjustedValue: 8200000,

      rsiScore: 78

    }

    setResults(mockResults)

  }


  /* ===============================
     RESET
  ================================ */

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


  /* ===============================
     SAVE
  ================================ */

  const handleSaveSimulation = (

    data: ProjectionResult

  ) => {

    console.log("Saving:", data)

  }


  /* ===============================
     ADD SCENARIO
  ================================ */

  const handleAddScenario = () => {

    console.log("Add Scenario clicked")

  }


  /* ===============================
     UI
  ================================ */

  return (

    <div className="p-6 pt-12 space-y-6">

      {/* PAGE TITLE */}

      <h1 className="text-2xl font-bold">

        Retirement Simulation

      </h1>


      {/* TWO COLUMN LAYOUT */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* LEFT — FORM */}

        <div className="p-6 border shadow-sm bg-card rounded-2xl">

          <ProjectionForm

            inputs={inputs}

            setInputs={setInputs}

            onCalculate={handleCalculate}

            onReset={handleReset}

          />

        </div>


        {/* RIGHT — RESULTS */}

        <div className="p-6 border shadow-sm bg-card rounded-2xl">

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