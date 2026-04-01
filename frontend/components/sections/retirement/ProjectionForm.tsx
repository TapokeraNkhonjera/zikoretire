"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calculator, RotateCcw, Wallet, Banknote, TrendingDown, Gauge } from "lucide-react"

interface ProjectionResult {
  projectedSavings: number
  estimatedMonthlyIncome: number
  inflationAdjustedValue: number
  rsiScore: number
}

export default function ProjectionPage() {

  const [currentAge, setCurrentAge] = useState("35")
  const [retirementAge, setRetirementAge] = useState("60")
  const [monthlyContribution, setMonthlyContribution] = useState("50000")
  const [frequency, setFrequency] = useState("monthly")
  const [expectedReturn, setExpectedReturn] = useState("8")
  const [inflationRate, setInflationRate] = useState("5")
  const [includeVoluntary, setIncludeVoluntary] = useState(false)

  const [results, setResults] = useState<ProjectionResult | null>(null)

  const handleCalculate = () => {

    const years = parseInt(retirementAge) - parseInt(currentAge)
    const monthly = parseInt(monthlyContribution)

    const returnRate = parseFloat(expectedReturn) / 100
    const inflation = parseFloat(inflationRate) / 100

    const totalContributions = monthly * 12 * years

    const projectedSavings =
      totalContributions * Math.pow(1 + returnRate, years / 2)

    const inflationAdjustedValue =
      projectedSavings / Math.pow(1 + inflation, years)

    const estimatedMonthlyIncome =
      inflationAdjustedValue / (25 * 12)

    const rsiScore =
      Math.min(
        100,
        Math.max(
          0,
          (inflationAdjustedValue / (monthly * 12 * 25)) * 100
        )
      )

    setResults({
      projectedSavings: Math.round(projectedSavings),
      estimatedMonthlyIncome: Math.round(estimatedMonthlyIncome),
      inflationAdjustedValue: Math.round(inflationAdjustedValue),
      rsiScore: Math.round(rsiScore)
    })
  }

  const handleReset = () => {

    setCurrentAge("35")
    setRetirementAge("60")
    setMonthlyContribution("50000")
    setFrequency("monthly")
    setExpectedReturn("8")
    setInflationRate("5")
    setIncludeVoluntary(false)

    setResults(null)
  }

  const getRsiColor = (score: number) => {

    if (score >= 70) return "bg-secondary"
    if (score >= 40) return "bg-accent"
    return "bg-destructive"
  }

  const getRsiLabel = (score: number) => {

    if (score >= 70) return "Good Readiness"
    if (score >= 40) return "Moderate Readiness"
    return "Low Readiness"
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          New Projection
        </h2>
        <p className="mt-1 text-muted-foreground">
          Enter your details to calculate your retirement projection.
        </p>
      </div>

      {/* GRID LAYOUT */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* FORM SECTION */}
        <Card>

          <CardHeader>
            <CardTitle>Contribution Details</CardTitle>
            <CardDescription>
              Provide your personal and financial information
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* Personal Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">
                Personal Information
              </h4>

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="space-y-2">
                  <Label htmlFor="currentAge">Current Age</Label>
                  <Input
                    id="currentAge"
                    type="number"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retirementAge">Retirement Age</Label>
                  <Input
                    id="retirementAge"
                    type="number"
                    value={retirementAge}
                    onChange={(e) => setRetirementAge(e.target.value)}
                    className="h-12"
                  />
                </div>

              </div>
            </div>

            {/* Contribution */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">
                Contribution Details
              </h4>

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="space-y-2">
                  <Label>Monthly Contribution (MK)</Label>
                  <Input
                    type="number"
                    value={monthlyContribution}
                    onChange={(e) =>
                      setMonthlyContribution(e.target.value)
                    }
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contribution Frequency</Label>
                  <Select
                    value={frequency}
                    onValueChange={setFrequency}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="irregular">Irregular</SelectItem>
                    </SelectContent>

                  </Select>
                </div>

              </div>
            </div>

            {/* Financial */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">
                Financial Assumptions
              </h4>

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="space-y-2">
                  <Label>Expected Annual Return (%)</Label>
                  <Input
                    type="number"
                    value={expectedReturn}
                    onChange={(e) =>
                      setExpectedReturn(e.target.value)
                    }
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Inflation Rate (%)</Label>
                  <Input
                    type="number"
                    value={inflationRate}
                    onChange={(e) =>
                      setInflationRate(e.target.value)
                    }
                    className="h-12"
                  />
                </div>

              </div>
            </div>

            {/* Voluntary */}
            <div className="flex items-center space-x-3">

              <Checkbox
                checked={includeVoluntary}
                onCheckedChange={(checked) =>
                  setIncludeVoluntary(checked === true)
                }
              />

              <Label className="text-sm font-medium">
                Include voluntary contributions
              </Label>

            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row">

              <Button
                onClick={handleCalculate}
                className="flex-1 h-12 gap-2"
              >
                <Calculator className="w-5 h-5" />
                Calculate Projection
              </Button>

              <Button
                variant="outline"
                onClick={handleReset}
                className="h-12 gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </Button>

            </div>

          </CardContent>

        </Card>

        {/* RESULTS SECTION */}
        <Card className={results ? "border-secondary/30 bg-secondary/5" : ""}>

          <CardHeader>
            <CardTitle>Projection Results</CardTitle>
            <CardDescription>

              {results
                ? "Your retirement projection summary"
                : "Complete the form and calculate to see results"}

            </CardDescription>
          </CardHeader>

          <CardContent>

            {results ? (

              <div className="space-y-6">

                <div className="grid gap-4 sm:grid-cols-2">

                  <ResultCard
                    icon={<Wallet className="w-5 h-5 text-primary" />}
                    label="Projected Savings"
                    value={`MK ${results.projectedSavings.toLocaleString()}`}
                  />

                  <ResultCard
                    icon={<Banknote className="w-5 h-5 text-secondary" />}
                    label="Monthly Income"
                    value={`MK ${results.estimatedMonthlyIncome.toLocaleString()}`}
                  />

                  <ResultCard
                    icon={<TrendingDown className="w-5 h-5 text-accent-foreground" />}
                    label="Inflation Adjusted"
                    value={`MK ${results.inflationAdjustedValue.toLocaleString()}`}
                  />

                  <ResultCard
                    icon={<Gauge className="w-5 h-5 text-secondary" />}
                    label="RSI Score"
                    value={`${results.rsiScore}%`}
                  />

                </div>

                {/* RSI BAR */}
                <div className="p-4 border shadow-sm rounded-xl bg-card">

                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-medium">
                      Retirement Sustainability Index
                    </span>

                    <span className={`px-2 py-1 text-xs text-white rounded ${getRsiColor(results.rsiScore)}`}>
                      {getRsiLabel(results.rsiScore)}
                    </span>

                  </div>

                  <div className="w-full h-4 rounded-full bg-muted">

                    <div
                      className={`h-full rounded-full ${getRsiColor(results.rsiScore)}`}
                      style={{ width: `${results.rsiScore}%` }}
                    />

                  </div>

                </div>

              </div>

            ) : (

              <div className="flex flex-col items-center justify-center py-16 text-center">

                <Calculator className="w-10 h-10 mb-3 text-muted-foreground" />

                <p className="text-muted-foreground">
                  Fill in your contribution details and calculate
                  to see your retirement projection.
                </p>

              </div>

            )}

          </CardContent>

        </Card>

      </div>
    </div>
  )
}

/* RESULT CARD COMPONENT */

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
    <div className="p-4 border shadow-sm rounded-xl bg-card">

      <div className="flex items-center gap-3">

        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
          {icon}
        </div>

        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>

      </div>

    </div>
  )
}