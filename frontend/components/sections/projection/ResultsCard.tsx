"use client"

import { ReactNode } from "react"

interface ResultCardProps {
  icon: ReactNode
  label: string
  value: ReactNode
}

export default function ResultCard({
  icon,
  label,
  value
}: ResultCardProps) {
  return (
    <div className="p-4 space-y-2 border rounded-xl bg-card">

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>

      <div className="text-lg font-semibold text-primary">
        {value}
      </div>

    </div>
  )
}