"use client"

import { Info } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"

export default function InfoTooltip({
  title,
  description
}: {
  title: string
  description: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="ml-2 text-muted-foreground hover:text-foreground"
        >
          <Info className="w-4 h-4" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-64 text-sm">
        <p className="mb-1 font-semibold">{title}</p>
        <p className="text-muted-foreground">
          {description}
        </p>
      </PopoverContent>
    </Popover>
  )
}