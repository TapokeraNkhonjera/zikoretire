import {
  TableRow,
  TableCell
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"
import { HistorySimulation } from "./types"

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

  /* ===============================
     INCOME TYPE LABEL
  ================================ */

  const getIncomeLabel = () => {
    switch (simulation.incomeType) {
      case "stable":
        return "Stable"
      case "flexible":
        return "Flexible"
      case "seasonal":
        return "Seasonal"
      default:
        return "Unknown"
    }
  }

  /* ===============================
     RSI COLOR
  ================================ */

  const getRsiColor = () => {
    if (!result?.rsiScore) return "text-muted-foreground"
    if (result.rsiScore >= 70) return "text-primary"
    if (result.rsiScore >= 40) return "text-amber-500"
    return "text-destructive"
  }

  return (

    <TableRow className="hover:bg-muted/40 transition">

      {/* DATE */}
      <TableCell className="text-sm text-muted-foreground">
        {formattedDate}
      </TableCell>

      {/* INCOME TYPE */}
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {getIncomeLabel()}
        </Badge>
      </TableCell>

      {/* MONTHLY INCOME */}
      <TableCell className="text-right font-medium">
        MWK {simulation.monthlyIncome.toLocaleString()}
      </TableCell>

      {/* PROJECTED VALUE */}
      <TableCell className="text-right font-semibold">
        {result?.projectedValue
          ? `MWK ${result.projectedValue.toLocaleString()}`
          : "-"}
      </TableCell>

      {/* RSI */}
      <TableCell className={`text-right font-semibold ${getRsiColor()}`}>
        {result?.rsiScore
          ? `${result.rsiScore.toFixed(1)}%`
          : "-"}
      </TableCell>

      {/* STATUS */}
      <TableCell className="text-right">

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