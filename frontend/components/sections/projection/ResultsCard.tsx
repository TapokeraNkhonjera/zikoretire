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
        relative p-5 rounded-xl border
        transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg
        overflow-hidden group
        ${
          highlight
            ? "border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 shadow-md"
            : "border-border/60 bg-card hover:border-primary/30"
        }
      `}
    >
      {/* Decorative gradient blob for highlighted cards */}
      {highlight && (
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/20 blur-2xl rounded-full pointer-events-none" />
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 text-[11px] tracking-wider uppercase text-muted-foreground font-medium">
          <span className={`p-1.5 rounded-lg ${highlight ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:text-primary transition-colors duration-300"}`}>
            {icon}
          </span>
          <span>{label}</span>
        </div>
      </div>

      {/* VALUE */}
      <div
        className={`
          mt-4 text-2xl font-bold tracking-tight relative z-10
          ${highlight ? "text-foreground" : "text-foreground group-hover:text-primary transition-colors duration-300"}
        `}
      >
        {value}
      </div>

      {/* SUBTLE BOTTOM LINE */}
      <div className={`w-full h-[2px] mt-4 rounded-full transition-all duration-300 ${highlight ? "bg-gradient-to-r from-primary/50 to-transparent" : "bg-border/50 group-hover:bg-primary/20"}`} />
    </div>
  )
}