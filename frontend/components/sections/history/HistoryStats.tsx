import {
  Card,
  CardContent
} from "@/components/ui/card"

import {
  HistorySimulation
} from "./types"

export default function HistoryStats({
  simulations
}: {
  simulations: HistorySimulation[]
}) {

  /* TOTAL SIMULATIONS */

  const totalSimulations =
    simulations.length

  /* FINAL PROJECTED VALUE */

  const finalProjectedValue =
    simulations[
      simulations.length - 1
    ]?.result?.projectedValue ?? 0

  /* TOTAL MONTHLY INCOME */

  const totalMonthlyIncome =
    simulations.reduce(
      (sum, sim) =>
        sum + sim.monthlyIncome,
      0
    )

  /* LAST RSI SCORE */

  const latestRsi =
    simulations[
      simulations.length - 1
    ]?.result?.rsiScore ?? 0

  return (

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

      {/* TOTAL SIMULATIONS */}

      <Card>

        <CardContent className="p-6">

          <p className="text-sm text-muted-foreground">
            Total Simulations
          </p>

          <p className="mt-1 text-3xl font-bold">
            {totalSimulations}
          </p>

        </CardContent>

      </Card>

      {/* FINAL PROJECTED VALUE */}

      <Card>

        <CardContent className="p-6">

          <p className="text-sm text-muted-foreground">
            Final Projected Value
          </p>

          <p className="mt-1 text-3xl font-bold">

            MWK{" "}
            {finalProjectedValue.toLocaleString()}

          </p>

        </CardContent>

      </Card>

      {/* TOTAL MONTHLY INCOME */}

      <Card>

        <CardContent className="p-6">

          <p className="text-sm text-muted-foreground">
            Total Monthly Income
          </p>

          <p className="mt-1 text-3xl font-bold">

            MWK{" "}
            {totalMonthlyIncome.toLocaleString()}

          </p>

        </CardContent>

      </Card>

      {/* LATEST RSI */}

      <Card>

        <CardContent className="p-6">

          <p className="text-sm text-muted-foreground">
            Latest RSI Score
          </p>

          <p className="mt-1 text-3xl font-bold">

            {latestRsi.toFixed(1)}%

          </p>

        </CardContent>

      </Card>

    </div>

  )
}