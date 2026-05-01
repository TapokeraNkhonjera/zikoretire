"use client"

import { useRouter } from "next/navigation"

import {
  TableRow,
  TableCell
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HistorySimulation } from "./types"
import { Play } from "lucide-react"

export default function HistoryRow({
  simulation
}: {
  simulation: HistorySimulation
}) {

  const router = useRouter()

  const result = simulation.result

  const formattedDate =
    new Date(simulation.createdAt)
      .toISOString()
      .split("T")[0]

  const handleClick = () => {
    router.push(`/dashboard/analytics?simulationId=${simulation.id}`)
  }

  const handleLoad = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/dashboard/projection?load=${simulation.id}`)
  }

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

  const getRsiColor = () => {
    if (!result?.rsiScore) return "text-muted-foreground"
    if (result.rsiScore >= 70) return "text-primary"
    if (result.rsiScore >= 40) return "text-amber-500"
    return "text-destructive"
  }

  return (

    <TableRow
      onClick={handleClick}
      className="transition cursor-pointer hover:bg-muted/40"
    >

      <TableCell className="text-sm text-muted-foreground">
        {formattedDate}
      </TableCell>

      <TableCell>
        <Badge variant="outline" className="text-xs">
          {getIncomeLabel()}
        </Badge>
      </TableCell>

      {/* ✅ FIXED: use result monthly income */}
      <TableCell className="font-medium text-right">
        {result?.monthlyIncome
          ? `MWK ${result.monthlyIncome.toLocaleString()}`
          : "-"}
      </TableCell>

      <TableCell className="font-semibold text-right">
        {result?.projectedValue
          ? `MWK ${result.projectedValue.toLocaleString()}`
          : "-"}
      </TableCell>

      <TableCell className={`text-right font-semibold ${getRsiColor()}`}>
        {result?.rsiScore
          ? `${result.rsiScore.toFixed(1)}%`
          : "-"}
      </TableCell>

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

      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLoad}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Play className="w-4 h-4 mr-1" />
          Load
        </Button>
      </TableCell>

    </TableRow>
  )
}