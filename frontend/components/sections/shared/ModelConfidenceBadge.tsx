"use client"

import { Badge } from "@/components/ui/badge"

type Props = {
  confidence?: number | null
  showLabel?: boolean
}

function getConfidenceStyle(confidence?: number | null) {
  if (typeof confidence !== "number") {
    return {
      label: "N/A",
      className: "bg-muted text-muted-foreground border-border",
    }
  }

  if (confidence >= 0.8) {
    return {
      label: `High ${(confidence * 100).toFixed(1)}%`,
      className: "bg-blue-100 text-blue-700 border-blue-200",
    }
  }

  if (confidence >= 0.6) {
    return {
      label: `Medium ${(confidence * 100).toFixed(1)}%`,
      className: "bg-amber-100 text-amber-700 border-amber-200",
    }
  }

  return {
    label: `Low ${(confidence * 100).toFixed(1)}%`,
    className: "bg-red-100 text-red-700 border-red-200",
  }
}

export default function ModelConfidenceBadge({
  confidence,
  showLabel = true,
}: Props) {
  const style = getConfidenceStyle(confidence)

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          Model confidence
        </span>
      )}
      <Badge variant="outline" className={style.className}>
        {style.label}
      </Badge>
    </div>
  )
}
