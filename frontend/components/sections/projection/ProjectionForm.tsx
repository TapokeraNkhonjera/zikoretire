"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toggle } from "./toggle"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, RotateCcw, ChevronDown } from "lucide-react"
import InfoTooltip from "./infotooltip"

import { ProjectionInputs } from "@/types/ProjectionInputs"

export default function ProjectionForm({
  inputs,
  setInputs,
  onCalculate,
  onReset,
  isLoading = false,
}: {
  inputs: ProjectionInputs
  setInputs: (data: ProjectionInputs) => void
  onCalculate: () => void
  onReset: () => void
  isLoading?: boolean
}) {

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* ================= SAFE UPDATE ================= */

  const updateField = <K extends keyof ProjectionInputs>(
    field: K,
    value: ProjectionInputs[K]
  ) => {
    setInputs({
      ...inputs,
      [field]: value,
    })
  }

  /* ================= VALIDATION ================= */

  const validateInputs = () => {

    if (!inputs.currentAge || !inputs.retirementAge) {
      return "Please enter age details"
    }

    if (Number(inputs.retirementAge) <= Number(inputs.currentAge)) {
      return "Retirement age must be greater than current age"
    }

    if (!inputs.monthlyIncome || Number(inputs.monthlyIncome) <= 0) {
      return "Monthly income is required"
    }

    if (!inputs.monthlyContribution || Number(inputs.monthlyContribution) <= 0) {
      return "Contribution must be greater than 0"
    }

    return null
  }

  /* ================= HANDLE CALCULATE ================= */

  const handleSubmit = () => {

    const validationError = validateInputs()

    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)

    onCalculate()
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-8">

      {/* ERROR */}
      {error && (
        <div className="p-3 text-sm border rounded-lg bg-destructive/10 text-destructive border-destructive/20">
          {error}
        </div>
      )}

      {/* ================= MODEL ================= */}
      <div>
<div className="flex items-center mb-2">
  <Label>Growth Model</Label>

  <InfoTooltip
    title="Growth Model"
    description="Defines how your investments grow over time. Stable has lower risk and returns, balanced mixes growth and safety, while high aims for higher returns with more risk."
  />
</div>

        <Tabs
          value={inputs.growthModel}
          onValueChange={(val) =>
            updateField("growthModel", val as ProjectionInputs["growthModel"])
          }
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stable">Stable</TabsTrigger>
            <TabsTrigger value="balanced">Balanced</TabsTrigger>
            <TabsTrigger value="high">High</TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="mt-2 text-xs text-muted-foreground">
  {inputs.growthModel === "stable" &&
    "Lower risk, slower growth."}

  {inputs.growthModel === "balanced" &&
    "Balanced growth with moderate risk."}

  {inputs.growthModel === "high" &&
    "Higher potential returns with increased risk."}
</p>
      </div>

      {/* ================= SLIDERS ================= */}
      <div className="space-y-6">

        {/* Current Age */}
        <div className="space-y-2">
          <Label>Current Age</Label>

          <input
            type="range"
            min={18}
            max={65}
            value={inputs.currentAge || 18}
            onChange={(e) =>
              updateField("currentAge", e.target.value)
            }
            className="w-full h-2 rounded-lg accent-primary bg-muted"
          />

          <Input
            type="number"
            value={inputs.currentAge}
            onChange={(e) =>
              updateField("currentAge", e.target.value)
            }
          />
        </div>

        {/* Retirement Age */}
        <div className="space-y-2">
          <Label>Retirement Age</Label>

          <input
            type="range"
            min={40}
            max={75}
            value={inputs.retirementAge || 60}
            onChange={(e) =>
              updateField("retirementAge", e.target.value)
            }
            className="w-full h-2 rounded-lg accent-primary bg-muted"
          />

          <Input
            type="number"
            value={inputs.retirementAge}
            onChange={(e) =>
              updateField("retirementAge", e.target.value)
            }
          />
        </div>

        {/* Contribution */}
        <div className="space-y-2">
          <Label>Monthly Contribution (MK)</Label>

          <input
            type="range"
            min={0}
            max={200000}
            step={1000}
            value={inputs.monthlyContribution || 0}
            onChange={(e) =>
              updateField("monthlyContribution", e.target.value)
            }
            className="w-full h-2 rounded-lg accent-primary bg-muted"
          />

          <Input
            type="number"
            value={inputs.monthlyContribution}
            onChange={(e) =>
              updateField("monthlyContribution", e.target.value)
            }
          />
        </div>
      </div>

      {/* ================= FINANCIAL BASE ================= */}
      <div className="space-y-4">

        <div className="space-y-2">
          <Label>Monthly Income (MK)</Label>
          <Input
            type="number"
            value={inputs.monthlyIncome}
            onChange={(e) =>
              updateField("monthlyIncome", e.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Current Savings (MK)</Label>
          <Input
            type="number"
            value={inputs.currentSavings}
            onChange={(e) =>
              updateField("currentSavings", e.target.value)
            }
          />
        </div>

      </div>

      {/* ================= INCOME TYPE ================= */}
      <div>
<div className="flex items-center mb-2">
  <Label>Income Type</Label>

  <InfoTooltip
    title="Income Type"
    description="Represents how predictable your income is. Stable income is consistent, flexible income varies slightly, and seasonal income fluctuates significantly."
  />
</div>

        <Tabs
          value={inputs.incomeType}
          onValueChange={(val) =>
            updateField("incomeType", val as ProjectionInputs["incomeType"])
          }
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stable">Stable</TabsTrigger>
            <TabsTrigger value="flexible">Flexible</TabsTrigger>
            <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
          </TabsList>
        </Tabs>
        
      </div>

      {/* ================= SAVING ================= */}
      <div>
<div className="flex items-center mb-2">
  <Label>Saving Behavior</Label>

  <InfoTooltip
    title="Saving Behavior"
    description="Describes how consistently you save. Consistent means regular contributions, flexible varies over time, and opportunistic increases when possible."
  />
</div>

        <Tabs
          value={inputs.savingBehavior}
          onValueChange={(val) =>
            updateField("savingBehavior", val as ProjectionInputs["savingBehavior"])
          }
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="consistent">Consistent</TabsTrigger>
            <TabsTrigger value="flexible">Flexible</TabsTrigger>
            <TabsTrigger value="opportunistic">Opportunistic</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ================= IRREGULAR ================= */}
      <div className="flex items-center justify-between">
        <Label>Irregular Contributions</Label>

        <Toggle
          checked={inputs.includeIrregular}
          onChange={(val: boolean) =>
            updateField("includeIrregular", val)
          }
        />
      </div>

      {inputs.includeIrregular && (
        <Input
          placeholder="Extra contribution (MK)"
          value={inputs.extraContribution}
          onChange={(e) =>
            updateField("extraContribution", e.target.value)
          }
        />
      )}

      {/* ================= ADVANCED ================= */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          Advanced <ChevronDown className="w-4 h-4" />
        </button>

        {showAdvanced && (
          <div className="mt-4">
            <Label>Inflation Rate (%)</Label>
            <Input
              type="number"
              value={inputs.inflationRate}
              onChange={(e) =>
                updateField("inflationRate", e.target.value)
              }
            />
          </div>
        )}
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          className="flex-1 h-12 gap-2"
          disabled={isLoading}
        >
          <Calculator className="w-5 h-5" />
          {isLoading ? "Processing with ML..." : "Run Projection"}
        </Button>

        <Button
          variant="outline"
          onClick={onReset}
          className="h-12 gap-2"
          disabled={isLoading}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

    </div>
  )
}