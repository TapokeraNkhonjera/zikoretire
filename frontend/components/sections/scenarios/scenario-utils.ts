import { ProjectionInputs } from "@/types/ProjectionInputs"

export function getOverrides(
  base: ProjectionInputs,
  current: ProjectionInputs
): Partial<ProjectionInputs> {

  const overrides: Partial<ProjectionInputs> = {}

  const keys = Object.keys(current) as Array<keyof ProjectionInputs>
  
  keys.forEach(<K extends keyof ProjectionInputs>(k: K) => {
    if (current[k] !== base[k]) {
      overrides[k] = current[k]
    }
  })

  return overrides
}

export function hasOverrides(
  base: ProjectionInputs,
  current: ProjectionInputs
) {
  return Object.keys(getOverrides(base, current)).length > 0
}