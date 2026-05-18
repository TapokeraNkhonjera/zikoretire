"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Toggle } from "./toggle"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, RotateCcw, ChevronDown, AlertTriangle, Info } from "lucide-react"
import InfoTooltip from "./infotooltip"
import { useSettings } from "@/contexts/SettingsContext"

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
  const [contributionMode, setContributionMode] = useState<"amount" | "percentage">("amount")
  const [contributionPercentage, setContributionPercentage] = useState<string>("10")

  const { settings } = useSettings()

  /* ================= COMPLIANCE VALIDATION ================= */

  // Strategy classification for compliance
  const classifyStrategy = (strategy: string): "formal" | "informal" => {
    const formalStrategies = [
      "conservative", "balanced", "aggressive", "contribution_growth", 
      "sustainability", "early_retirement", "inflation_stress"
    ]
    const informalStrategies = ["informal", "seasonal"]
    
    if (formalStrategies.includes(strategy)) return "formal"
    if (informalStrategies.includes(strategy)) return "informal"
    
    // Default to formal for unknown strategies
    return "formal"
  }

  // Calculate early retirement penalty
  const calculateEarlyRetirementPenalty = (retirementAge: number): { 
    penaltyRate: number; 
    complianceWarning?: string 
  } => {
    const statutoryRetirementAge = 50
    
    // Only apply penalty if retirement age is below statutory age
    if (retirementAge >= statutoryRetirementAge) {
      return { 
        penaltyRate: 0 
      }
    }
    
    // Calculate penalty: 3% per year below 50
    const yearsBelowStatutory = statutoryRetirementAge - retirementAge
    const penaltyRate = 1 - Math.pow(1 - 0.03, yearsBelowStatutory)
    
    const complianceWarning = `Retiring before the statutory age of 50 in the formal sector results in a 3% annual benefit reduction per the Pension Act. Total reduction: ${(penaltyRate * 100).toFixed(1)}%`
    
    return { 
      penaltyRate, 
      complianceWarning 
    }
  }

  // Get real-time compliance warning
  const getComplianceWarning = () => {
    if (!inputs.retirementAge || !inputs.projectionStrategy) {
      return null
    }

    const isFormalSector = classifyStrategy(inputs.projectionStrategy) === "formal"
    
    if (!isFormalSector) {
      return null // No penalty for informal sector
    }

    const penaltyResult = calculateEarlyRetirementPenalty(Number(inputs.retirementAge))
    
    if (penaltyResult.penaltyRate > 0) {
      return {
        type: "warning" as const,
        message: penaltyResult.complianceWarning,
        penalty: penaltyResult.penaltyRate
      }
    }

    return null
  }

  const complianceWarning = getComplianceWarning()

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

      {/* ================= STRATEGY ================= */}
      <div>
        <div className="flex items-center mb-2">
          <Label>Projection Strategy</Label>
          <InfoTooltip
            title="Projection Strategy"
            description="Select a projection mode tailored to Malawi pension realities. The deterministic engine always runs; ML enhances scoring and transparency where available."
          />
        </div>

        <select
          value={inputs.projectionStrategy}
          onChange={(e) =>
            updateField(
              "projectionStrategy",
              e.target.value as ProjectionInputs["projectionStrategy"]
            )
          }
          className="w-full h-12 px-3 text-sm border rounded-lg bg-background"
        >
          <option value="conservative">Conservative</option>
          <option value="balanced">Balanced (Default)</option>
          <option value="aggressive">Aggressive Growth</option>
          <option value="informal">Informal Worker</option>
          <option value="seasonal">Seasonal Income</option>
          <option value="inflation_stress">Inflation Stress</option>
          <option value="contribution_growth">Contribution Growth</option>
          <option value="early_retirement">Early Retirement</option>
          <option value="sustainability">Pension Sustainability</option>
        </select>

        <p className="mt-2 text-xs text-muted-foreground">
          {inputs.projectionStrategy === "conservative" &&
            "Lower growth, higher inflation sensitivity, safer stability."}
          {inputs.projectionStrategy === "balanced" &&
            "Moderate assumptions (current default behavior)."}
          {inputs.projectionStrategy === "aggressive" &&
            "Higher growth assumptions with increased risk/volatility."}
          {inputs.projectionStrategy === "informal" &&
            "Supports missed months and contribution consistency scoring."}
          {inputs.projectionStrategy === "seasonal" &&
            "Contributions fluctuate by season (peak vs weak months)."}
          {inputs.projectionStrategy === "inflation_stress" &&
            "Simulates high inflation shock and purchasing power erosion."}
          {inputs.projectionStrategy === "contribution_growth" &&
            "Simulates annual salary growth and rising contributions."}
          {inputs.projectionStrategy === "early_retirement" &&
            "Higher pressure: shorter accumulation and earlier retirement timeline."}
          {inputs.projectionStrategy === "sustainability" &&
            "Estimates how long retirement income may last after retirement."}
        </p>
        
        {inputs.projectionStrategy && (
          <div className="mt-1 text-xs">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              classifyStrategy(inputs.projectionStrategy) === "formal" 
                ? "bg-blue-100 text-blue-700" 
                : "bg-green-100 text-green-700"
            }`}>
              {classifyStrategy(inputs.projectionStrategy) === "formal" ? "Formal Sector" : "Informal Sector"}
              {classifyStrategy(inputs.projectionStrategy) === "formal" && " • Pension Act applies"}
            </span>
          </div>
        )}
        
        <div className="mt-1">
          <Link 
            href="/dashboard/strategies" 
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            Read more about strategies
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
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

        {/* ================= COMPLIANCE WARNING ================= */}
        {settings.inlineNudgesEnabled && complianceWarning && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="font-semibold mb-1">Early Retirement Penalty Warning</div>
              <div className="text-sm">{complianceWarning.message}</div>
              <div className="text-xs mt-2 font-medium">
                Strategy: {classifyStrategy(inputs.projectionStrategy)} Sector • 
                Your projection will be reduced by {(complianceWarning.penalty * 100).toFixed(1)}%
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Contribution */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Monthly Contribution</Label>
          </div>

          <Tabs
            value={contributionMode}
            onValueChange={(val) => {
              setContributionMode(val as "amount" | "percentage")
              if (val === "percentage") {
                 const amount = (Number(contributionPercentage) / 100) * (Number(inputs.monthlyIncome) || 0);
                 updateField("monthlyContribution", amount.toString());
              }
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="amount">Fixed Amount</TabsTrigger>
              <TabsTrigger value="percentage">% of Income</TabsTrigger>
            </TabsList>
          </Tabs>

          {contributionMode === "amount" ? (
            <div className="space-y-2 pt-2">
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
          ) : (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={contributionPercentage}
                  onChange={(e) => {
                    setContributionPercentage(e.target.value)
                    const amount = (Number(e.target.value) / 100) * (Number(inputs.monthlyIncome) || 0);
                    updateField("monthlyContribution", amount.toString());
                  }}
                  placeholder="e.g. 10"
                />
                <span className="text-sm font-medium">%</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Equivalent to: MK {((Number(contributionPercentage) / 100) * (Number(inputs.monthlyIncome) || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================= FINANCIAL BASE ================= */}
      <div className="space-y-4">

        <div className="space-y-2">
          <Label>Monthly Income (MK)</Label>
          <Input
            type="number"
            value={inputs.monthlyIncome}
            onChange={(e) => {
              const newIncome = e.target.value;
              if (contributionMode === "percentage" && contributionPercentage !== "") {
                const amount = (Number(contributionPercentage) / 100) * (Number(newIncome) || 0);
                setInputs({
                  ...inputs,
                  monthlyIncome: newIncome,
                  monthlyContribution: amount.toString(),
                });
              } else {
                updateField("monthlyIncome", newIncome);
              }
            }}
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