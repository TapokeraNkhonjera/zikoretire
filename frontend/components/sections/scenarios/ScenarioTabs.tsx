"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScenarioItem } from "@/types/scenario"
import { X, Edit2 } from "lucide-react"

interface ScenarioTabsProps {
  scenarios: ScenarioItem[]
  active: string
  onChange: (id: string) => void
  onAdd: () => void
  onBaseClick?: () => void
  onDelete?: (id: string) => void
  onRename?: (id: string, newName: string) => void
  canDelete?: boolean
}

export default function ScenarioTabs({
  scenarios,
  active,
  onChange,
  onAdd,
  onBaseClick,
  onDelete,
  onRename,
  canDelete = true
}: ScenarioTabsProps) {

  const handleDeleteScenario = (scenarioId: string, scenarioName: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${scenarioName}"?\n\nThis action cannot be undone.`
    );

    if (confirmDelete && onDelete) {
      onDelete(scenarioId);
    }
  };

  const handleRenameScenario = (scenarioId: string, currentName: string) => {
    const newName = prompt(`Rename "${currentName}":`, currentName);
    if (newName && newName.trim() !== "" && newName !== currentName) {
      if (onRename) {
        onRename(scenarioId, newName.trim());
      }
    }
  };

  return (
    <div className="flex items-center gap-2 pb-2 overflow-x-auto">
      
      <Tabs value={active} onValueChange={onChange} className="w-auto">
        <TabsList>
          
          <TabsTrigger 
            value="base"
            onClick={onBaseClick}
          >
            Base Simulation
          </TabsTrigger>

          {scenarios.map((scenario, index) => (
            <div key={scenario.id} className="relative group flex items-center">
              <TabsTrigger
                value={scenario.id}
                className="relative pr-8 pl-4 transition-all duration-300"
              >
                <span className="flex-1 truncate">{scenario.name}</span>
              </TabsTrigger>
              {/* Rename button for scenarios */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleRenameScenario(scenario.id, scenario.name);
                }}
                className="absolute top-1/2 -translate-y-1/2 right-6 w-5 h-5 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center hover:bg-blue-600 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 cursor-pointer shadow-sm scale-90 hover:scale-100"
                title={`Rename ${scenario.name}`}
                role="button"
                tabIndex={0}
                aria-label={`Rename ${scenario.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    handleRenameScenario(scenario.id, scenario.name);
                  }
                }}
              >
                <Edit2 className="w-3 h-3" />
              </div>
              {/* Delete button for scenarios - positioned inside relative container */}
              {canDelete && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteScenario(scenario.id, scenario.name);
                  }}
                  className="absolute top-1/2 -translate-y-1/2 right-1 w-5 h-5 bg-red-100 text-red-600 rounded-md flex items-center justify-center hover:bg-red-600 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 cursor-pointer shadow-sm scale-90 hover:scale-100"
                  title={`Delete ${scenario.name} scenario`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Delete ${scenario.name} scenario`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      handleDeleteScenario(scenario.id, scenario.name);
                    }
                  }}
                >
                  <X className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}
          
        </TabsList>
      </Tabs>

      {scenarios.length < 3 && (
        <Button
          variant="ghost"
          onClick={onAdd}
          className="h-11"
        >
          + Add Scenario
        </Button>
      )}

    </div>
  )
}