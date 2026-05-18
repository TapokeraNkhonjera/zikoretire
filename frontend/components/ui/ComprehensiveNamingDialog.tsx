"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ScenarioItem } from "@/types/scenario"

interface ComprehensiveNamingDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (simulationName: string, scenarioNames: Record<string, string>) => void
  defaultSimulationName?: string
  scenarios: ScenarioItem[]
}

export default function ComprehensiveNamingDialog({
  isOpen,
  onClose,
  onConfirm,
  defaultSimulationName = "",
  scenarios
}: ComprehensiveNamingDialogProps) {
  const { toast } = useToast()
  const [simulationName, setSimulationName] = useState("")
  const [scenarioNames, setScenarioNames] = useState<Record<string, string>>({})
  const savingRef = useRef(false)
  
  // Global save lock to prevent any double execution
  const globalSaveRef = useRef(false)
  
  // Unique dialog instance ID to track if same dialog is called multiple times
  const dialogIdRef = useRef(Math.random().toString(36).substr(2, 9))
  
  // Callback execution lock to prevent double execution
  const callbackExecutedRef = useRef(false)

  useEffect(() => {
    if (isOpen) {
      savingRef.current = false
      callbackExecutedRef.current = false
      setSimulationName(defaultSimulationName || "") 
      const defaultScenarioNames: Record<string, string> = {}
      scenarios.forEach((scenario, index) => {
        defaultScenarioNames[scenario.id] = scenario.name || ""
      })
      setScenarioNames(defaultScenarioNames)
    }
  }, [defaultSimulationName, scenarios, isOpen])

  const handleScenarioNameChange = (scenarioId: string, name: string) => {
    setScenarioNames(prev => ({
      ...prev,
      [scenarioId]: name
    }))
  }

  const handleConfirm = () => {
    console.log("[DIALOG] handleConfirm called, ID:", dialogIdRef.current, "savingRef:", savingRef.current, "global:", globalSaveRef.current, "callbackExecuted:", callbackExecutedRef.current)
    console.log("[DIALOG] simulationName:", simulationName, "type:", typeof simulationName)
    console.log("[DIALOG] scenarioNames:", scenarioNames)
    if (savingRef.current || globalSaveRef.current || callbackExecutedRef.current) {
      console.log("[DIALOG] Blocked - already saving or callback executed")
      return
    }

    // Validate that user provided a simulation name
    if (!simulationName || simulationName.trim() === "") {
      toast({
        title: "Name Required",
        description: "Please enter a name for your simulation before saving.",
        variant: "destructive"
      });
      return
    }

    // Additional guard to prevent execution if dialog isn't properly opened
    if (!isOpen) {
      console.log("[DIALOG] Blocked - dialog is not open")
      return
    }

    savingRef.current = true
    globalSaveRef.current = true
    callbackExecutedRef.current = true
    console.log("[DIALOG] Proceeding with save...")
    console.log("[DIALOG] About to call onConfirm with:", { simulationName, scenarioNames })
    onConfirm(simulationName, scenarioNames)
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  const hasScenarios = scenarios.length > 0
  const dialogTitle = hasScenarios
    ? "Name Your Simulation & Scenarios"
    : "Name Your Simulation"

  const dialogDescription = hasScenarios
    ? "Give your simulation and scenarios names for easier identification and analysis."
    : "Give your simulation a name for easier identification and analysis."

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Base Simulation Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="simulation-name" className="text-right font-semibold">
              Simulation *
            </Label>
            <Input
              id="simulation-name"
              value={simulationName}
              onChange={(e) => setSimulationName(e.target.value)}
              placeholder="Enter simulation name..."
              className="col-span-3"
            />
          </div>

          {/* Scenarios Section - Only show if scenarios exist */}
          {hasScenarios && (
            <div className="border-t pt-4">
              <Label className="text-sm font-semibold mb-3 block">
                {scenarios.length === 1 ? "Scenario" : "Scenarios"}
              </Label>

              {scenarios.map((scenario, index) => (
                <div key={scenario.id} className="grid grid-cols-4 items-center gap-4 mb-3">
                  <Label htmlFor={`scenario-${scenario.id}`} className="text-right">
                    {scenario.name}
                  </Label>
                  <Input
                    id={`scenario-${scenario.id}`}
                    value={scenarioNames[scenario.id] || ""}
                    onChange={(e) => handleScenarioNameChange(scenario.id, e.target.value)}
                    placeholder={`Enter scenario name (optional)...`}
                    className="col-span-3"
                  />
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            * Simulation name is required. Scenario names are optional - leave blank to use default naming convention.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            {hasScenarios ? "Save All Names" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
