"use client"

import { useState } from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Calculator,
  Wallet,
  Gauge
} from "lucide-react"

/* ================= TYPES ================= */

interface BaseInputs {
  currentAge: string
  retirementAge: string
  monthlyContribution: string
}

interface ProjectionResult {
  inputs: BaseInputs
}

interface ScenarioResult {
  projected: number
  rsi: number
}

interface ScenarioFormProps {
  baseData?: ProjectionResult | null
}

/* ================= COMPONENT ================= */

export default function ScenarioForm({
  baseData
}: ScenarioFormProps) {

  /* ---------- Prefill from base simulation ---------- */

  const [age, setAge] = useState<number>(
    baseData
      ? Number(baseData.inputs.currentAge)
      : 35
  )

  const [retirementAge, setRetirementAge] = useState<number>(
    baseData
      ? Number(baseData.inputs.retirementAge)
      : 60
  )

  const [monthlyContribution, setMonthlyContribution] =
    useState<number>(
      baseData
        ? Number(baseData.inputs.monthlyContribution)
        : 50000
    )

  const [result, setResult] =
    useState<ScenarioResult | null>(null)

  /* ---------- Calculation ---------- */

  const runScenario = () => {

    const years = retirementAge - age

    const projected =
      monthlyContribution * 12 * years * 1.2

    const rsi =
      Math.min(
        100,
        (projected / 10000000) * 100
      )

    setResult({
      projected,
      rsi
    })
  }

  /* ================= UI ================= */

  return (

    <div className="grid gap-6 lg:grid-cols-2">

      {/* FORM */}

      <Card>

        <CardHeader>
          <CardTitle>
            Scenario Details
          </CardTitle>

          <CardDescription>
            Modify values to test alternative strategies
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">

          <div className="space-y-2">

            <Label>
              Current Age
            </Label>

            <Input
              type="number"
              value={age}
              onChange={(e) =>
                setAge(Number(e.target.value))
              }
            />

          </div>

          <div className="space-y-2">

            <Label>
              Retirement Age
            </Label>

            <Input
              type="number"
              value={retirementAge}
              onChange={(e) =>
                setRetirementAge(
                  Number(e.target.value)
                )
              }
            />

          </div>

          <div className="space-y-2">

            <Label>
              Monthly Contribution
            </Label>

            <Input
              type="number"
              value={monthlyContribution}
              onChange={(e) =>
                setMonthlyContribution(
                  Number(e.target.value)
                )
              }
            />

          </div>

          <Button
            onClick={runScenario}
            className="w-full gap-2"
          >

            <Calculator className="w-4 h-4" />

            Run Scenario

          </Button>

        </CardContent>

      </Card>

      {/* RESULTS CARD */}

      <Card
        className={
          result
            ? "border-secondary/30 bg-secondary/5"
            : ""
        }
      >

        <CardHeader>

          <CardTitle>
            Scenario Results
          </CardTitle>

          <CardDescription>

            {result
              ? "Scenario projection summary"
              : "Run scenario to view results"}

          </CardDescription>

        </CardHeader>

        <CardContent>

          {result ? (

            <div className="space-y-4">

              <ResultCard
                icon={
                  <Wallet className="w-5 h-5" />
                }
                label="Projected Savings"
                value={`MK ${result.projected.toLocaleString()}`}
              />

              <ResultCard
                icon={
                  <Gauge className="w-5 h-5" />
                }
                label="RSI Score"
                value={`${result.rsi.toFixed(0)}%`}
              />

            </div>

          ) : (

            <p className="py-10 text-sm text-center text-muted-foreground">
              Run scenario to view projection results.
            </p>

          )}

        </CardContent>

      </Card>

    </div>
  )
}

/* RESULT CARD */

function ResultCard({
  icon,
  label,
  value
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {

  return (

    <div className="p-4 border rounded-xl">

      <div className="flex items-center gap-3">

        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
          {icon}
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            {label}
          </p>

          <p className="text-lg font-bold">
            {value}
          </p>
        </div>

      </div>

    </div>

  )
}