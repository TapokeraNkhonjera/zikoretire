import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ScenarioWorkspace from "@/components/sections/scenarios/ScenarioWorkspace"
import { ProjectionInputs } from "@/types/ProjectionInputs"

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

export default async function SimulationDetailPage(props: {
  params: Promise<{ id: string }>
}) {

  const params = await props.params
  const simulationId = params.id

  const sim = await prisma.simulation.findUnique({
    where: { id: simulationId }
  })

  if (!sim) {
    notFound()
  }

  const baseInputs: ProjectionInputs = {
    currentAge: sim.age.toString(),
    retirementAge: sim.retirementAge.toString(),
    monthlyIncome: sim.monthlyIncome.toString(),
    monthlyContribution: sim.monthlyContribution.toString(),
    currentSavings: sim.currentSavings?.toString() || "0",
    inflationRate: sim.inflationRate.toString(),
    growthModel: asGrowthModel(sim.growthModel),
    projectionStrategy: "balanced",
    incomeType: asIncomeType(sim.incomeType),
    savingBehavior: asSavingBehavior(sim.savingBehavior),
    includeIrregular: sim.includeIrregular,
    extraContribution: sim.extraContribution?.toString() || ""
  }

  return (

    <div className="flex flex-col gap-6 pt-12 lg:gap-8 max-w-7xl">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Scenario Analysis
        </h2>

        <p className="mt-1 text-muted-foreground">
          Explore different outcomes by modifying key financial variables.
        </p>
      </div>

      {/* WORKSPACE */}
      <ScenarioWorkspace simulationId={simulationId} baseInputs={baseInputs} />

    </div>

  )
}