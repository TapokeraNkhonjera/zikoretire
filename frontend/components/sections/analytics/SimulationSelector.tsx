"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { AnalyticsData } from "@/types/analytics"

interface SimulationSelectorProps {
  simulations: AnalyticsData[]
  selectedId: string
  onChange: (id: string) => void
}

export default function SimulationSelector({
  simulations,
  selectedId,
  onChange,
}: SimulationSelectorProps) {
  return (
    <div className="w-full max-w-md">
      <Select value={selectedId} onValueChange={onChange}>
        <SelectTrigger className="h-12">
          <SelectValue placeholder="Select Simulation" />
        </SelectTrigger>

        <SelectContent>
          {simulations.map((sim) => {
            const displayName =
              sim.name && sim.name.trim().length > 0
                ? sim.name
                : `Simulation ${sim.id.slice(0, 6)}`

            return (
              <SelectItem key={sim.id} value={sim.id}>
                {displayName}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}