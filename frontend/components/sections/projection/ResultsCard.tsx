"use client"

import { ReactNode } from "react"

interface ResultCardProps {
  icon: ReactNode
  label: string
  value: ReactNode
  highlight?: boolean
}

export default function ResultCard({
  icon,
  label,
  value,
  highlight = false
}: ResultCardProps) {
  return (
    <div
      className={`
        relative p-5 rounded-xl border bg-card
        transition-all duration-200

        ${
          highlight
            ? "border-primary/70 bg-primary/5 shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.08)]"
            : "border-border/60 hover:border-border hover:bg-muted/30"
        }
      `}
    >



      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2 text-[11px] tracking-wider uppercase text-muted-foreground">
          <span className={highlight ? "text-primary" : ""}>
            {icon}
          </span>
          <span>{label}</span>
        </div>

      </div>

      {/* VALUE */}
      <div
        className={`
          mt-4 text-2xl font-semibold tracking-tight

          ${highlight
            ? "text-foreground"
            : "text-primary"
          }
        `}
      >
        {value}
      </div>

      {/* SUBTLE BOTTOM LINE (industrial feel) */}
      <div className="w-full h-px mt-4 bg-border/50" />

    </div>
  )
}