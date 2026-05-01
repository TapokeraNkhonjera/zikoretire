import { ProjectionInputs } from "./ProjectionInputs"
import { ProjectionResult } from "@/components/sections/projection/ProjectionResults"

export interface ScenarioItem {
  id: string
  name: string
  inputs: ProjectionInputs
  results: ProjectionResult | null
}