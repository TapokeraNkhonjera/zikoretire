"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import {
  TableRow,
  TableCell
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HistorySimulation } from "./types"
import { Play, Star, StarOff } from "lucide-react"

export default function HistoryRow({
  simulation
}: {
  simulation: HistorySimulation
}) {

  const router = useRouter()
  const [isSettingPriority, setIsSettingPriority] = useState(false)

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

  const handleSetPriority = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (isSettingPriority) return
    
    setIsSettingPriority(true)
    
    try {
      const response = await fetch('/api/simulation/priority', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ simulationId: simulation.id }),
      })
      
      if (response.ok) {
        // Create a notification entry for priority change
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'create',
              notification: {
                title: 'Main Simulation Updated',
                message: `Simulation set as main projection: ${new Date(simulation.createdAt).toLocaleDateString()}`,
                type: 'success',
                priority: 'high',
                simulationId: simulation.id
              }
            })
          })
        } catch (notificationError) {
          console.error('Failed to create notification:', notificationError)
        }
        
        // Emit custom event for real-time updates
        window.dispatchEvent(new CustomEvent('simulationPriorityChanged', {
          detail: { 
            simulationId: simulation.id,
            isPriority: true 
          }
        }))
        
        // Optimistically update local state
        router.refresh()
      }
    } catch (error) {
      console.error('Error setting priority:', error)
    } finally {
      setIsSettingPriority(false)
    }
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
      className={`transition cursor-pointer hover:bg-muted/40 ${
        simulation.priority ? 'bg-primary/5' : ''
      }`}
    >

      <TableCell className="text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          {formattedDate}
          {simulation.priority && (
            <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
              <Star className="w-3 h-3 mr-1" />
              Main
            </Badge>
          )}
        </div>
      </TableCell>

      <TableCell>
        <Badge variant="outline" className="text-xs">
          {getIncomeLabel()}
        </Badge>
      </TableCell>

      {/* ✅ FIXED: use result monthly income */}
      <TableCell className="font-medium text-right">
        {result?.estimatedMonthlyIncome
          ? `MWK ${result.estimatedMonthlyIncome.toLocaleString()}`
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
        <div className="flex gap-1 justify-end">
          {!simulation.priority && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSetPriority}
              disabled={isSettingPriority}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              title="Set as main simulation"
            >
              <Star className="w-4 h-4 mr-1" />
              {isSettingPriority ? 'Setting...' : 'Main'}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoad}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Play className="w-4 h-4 mr-1" />
            Load
          </Button>
        </div>
      </TableCell>

    </TableRow>
  )
}