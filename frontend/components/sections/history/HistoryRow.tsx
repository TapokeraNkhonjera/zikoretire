import {
  TableRow,
  TableCell
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"

import {
  HistorySimulation
} from "./types"

export default function HistoryRow({
  simulation
}: {
  simulation: HistorySimulation
}) {

  const result = simulation.result

  const formattedDate =
    new Date(simulation.createdAt)
      .toISOString()
      .split("T")[0]

  return (

    <TableRow>

      <TableCell>
        {formattedDate}
      </TableCell>

      <TableCell>
        MWK {simulation.monthlyIncome.toLocaleString()}
      </TableCell>

      <TableCell>
        MWK {result?.projectedValue?.toLocaleString() ?? "-"}
      </TableCell>

      <TableCell>
        {result?.rsiScore?.toFixed(1) ?? "-"}%
      </TableCell>

      <TableCell>

        <Badge
          variant={
            result?.readinessLevel === "Ready"
              ? "default"
              : result?.readinessLevel === "Moderate"
              ? "secondary"
              : "destructive"
          }
        >
          {result?.readinessLevel ?? "Unknown"}
        </Badge>

      </TableCell>

    </TableRow>

  )
}