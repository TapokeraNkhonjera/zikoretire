"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScenarioItem } from "@/types/scenario"

interface ScenarioTabsProps {
  scenarios: ScenarioItem[]
  active: string
  onChange: (id: string) => void
  onAdd: () => void
}

export default function ScenarioTabs({
  scenarios,
  active,
  onChange,
  onAdd
}: ScenarioTabsProps) {

  return (
    <div className="flex items-center gap-2 pb-2 overflow-x-auto">
      
      <Tabs value={active} onValueChange={onChange} className="w-auto">
        {/* We use a custom blue styling instead of the default gray/muted */}
        <TabsList className="flex h-11 items-center justify-start rounded-lg bg-blue-100/50 p-1 text-blue-900 w-max">
          
          <TabsTrigger 
            value="base"
            className="px-4 py-2 rounded-md transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            Base
          </TabsTrigger>

          {scenarios.map((scenario) => (
            <TabsTrigger
              key={scenario.id}
              value={scenario.id}
              className="px-4 py-2 rounded-md transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              {scenario.name}
            </TabsTrigger>
          ))}
          
        </TabsList>
      </Tabs>

      {scenarios.length < 3 && (
        <Button
          variant="ghost"
          onClick={onAdd}
          className="whitespace-nowrap text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-11"
        >
          + Add Scenario
        </Button>
      )}

    </div>
  )
}