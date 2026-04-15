"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toggle } from "./toggle"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, RotateCcw, ChevronDown } from "lucide-react"

/* =============================== TYPES ================================ */

export interface ProjectionInputs {
  currentAge: string
  retirementAge: string
  monthlyContribution: string

  incomeType: "stable" | "flexible" | "seasonal"
  savingBehavior: "consistent" | "flexible" | "opportunistic"

  growthModel: "stable" | "balanced" | "high"

  inflationRate: string

  includeIrregular: boolean
  extraContribution: string
}

/* =============================== COMPONENT ================================ */

export default function ProjectionForm({
  inputs,
  setInputs,
  onCalculate,
  onReset,
}: {
  inputs: ProjectionInputs
  setInputs: (data: ProjectionInputs) => void
  onCalculate: () => void
  onReset: () => void
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  /* =============================== SAFE UPDATE ================================ */

  const updateField = <K extends keyof ProjectionInputs>(
    field: K,
    value: ProjectionInputs[K]
  ) => {
    setInputs({
      ...inputs,
      [field]: value,
    })
  }

  /* =============================== PRESETS ================================ */

  const applyPreset = (
    type: "low" | "normal" | "high"
  ) => {
    const map: Record<
      "low" | "normal" | "high",
      {
        contribution: string
        model: ProjectionInputs["growthModel"]
      }
    > = {
      low: {
        contribution: "20000",
        model: "stable",
      },
      normal: {
        contribution: "50000",
        model: "balanced",
      },
      high: {
        contribution: "100000",
        model: "high",
      },
    }

    const preset = map[type]

    setInputs({
      ...inputs,
      monthlyContribution: preset.contribution,
      growthModel: preset.model,
    })
  }

  /* =============================== UI ================================ */

  return (
    <div className="space-y-8">

      {/* ================= PRESETS ================= */}
      <div className="grid grid-cols-3 gap-2">
        {(["low", "normal", "high"] as const).map((t) => (
          <Button
            key={t}
            variant="outline"
            size="sm"
            onClick={() => applyPreset(t)}
          >
            {t.toUpperCase()}
          </Button>
        ))}
      </div>

      {/* ================= MODEL TABS ================= */}
      <div>
        <Label className="block mb-2">Growth Model</Label>

        <Tabs
          value={inputs.growthModel}
          onValueChange={(val) =>
            updateField(
              "growthModel",
              val as ProjectionInputs["growthModel"]
            )
          }
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stable">Stable</TabsTrigger>
            <TabsTrigger value="balanced">Balanced</TabsTrigger>
            <TabsTrigger value="high">High</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ================= SLIDERS ================= */}
      <div className="space-y-6">

        {/* Retirement Age */}
        <div className="space-y-2">
          <Label>Retirement Age</Label>

<input
  type="range"
  min={40}
  max={75}
  value={inputs.retirementAge}
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
  value={inputs.monthlyContribution}
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

      {/* ================= INCOME TYPE ================= */}
<div>
  <Label className="block mb-2">Income Type</Label>

  <Tabs
    value={inputs.incomeType}
    onValueChange={(val) =>
      updateField(
        "incomeType",
        val as ProjectionInputs["incomeType"]
      )
    }
  >
    <TabsList className="grid w-full grid-cols-3">
      <TabsTrigger value="stable">Stable</TabsTrigger>
      <TabsTrigger value="flexible">Flexible</TabsTrigger>
      <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
    </TabsList>
  </Tabs>
</div>

      {/* ================= SAVING BEHAVIOR ================= */}
<div>
  <Label className="block mb-2">Saving Behavior</Label>

  <Tabs
    value={inputs.savingBehavior}
    onValueChange={(val) =>
      updateField(
        "savingBehavior",
        val as ProjectionInputs["savingBehavior"]
      )
    }
  >
    <TabsList className="grid w-full grid-cols-3">
      <TabsTrigger value="consistent">Consistent</TabsTrigger>
      <TabsTrigger value="flexible">Flexible</TabsTrigger>
      <TabsTrigger value="opportunistic">Opportunistic</TabsTrigger>
    </TabsList>
  </Tabs>
</div>

      {/* ================= TOGGLE ================= */}
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
        <Button onClick={onCalculate} className="flex-1 h-12 gap-2">
          <Calculator className="w-5 h-5" />
          Run Projection
        </Button>

        <Button
          variant="outline"
          onClick={onReset}
          className="h-12 gap-2"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}