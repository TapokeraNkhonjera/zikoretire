"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import ScenarioForm from "./ScenarioForm"

/* ================= TYPES ================= */

type BaseSimulationData = {
  inputs: {
    currentAge: string
    retirementAge: string
    monthlyContribution: string
    expectedReturn: string
    inflationRate: string
  }
}

type ScenarioManagerProps = {
  baseData: BaseSimulationData | null
}

/* ================= COMPONENT ================= */

export default function ScenarioManager({
  baseData
}: ScenarioManagerProps) {

  return (

    <Card>

      <CardHeader>
        <CardTitle>
          Scenario Analysis
        </CardTitle>
      </CardHeader>

      <CardContent>

        {!baseData ? (

          <p className="text-sm text-muted-foreground">
            Run a simulation first to enable scenarios.
          </p>

        ) : (

          <ScenarioForm
            baseData={baseData}
          />

        )}

      </CardContent>

    </Card>

  )
}