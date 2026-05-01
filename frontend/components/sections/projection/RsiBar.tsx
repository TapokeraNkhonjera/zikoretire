"use client"

export default function RsiBar({
  score,
  readinessLevel
}: {
  score: number
  readinessLevel?: string
}) {

  /* ===============================
     SAFETY
  =============================== */
  const safeScore = Math.max(0, Math.min(100, score || 0))

  /* ===============================
     COLOR SYSTEM (aligned)
  =============================== */
  const getColor = () => {
    if (readinessLevel === "Ready") return "bg-primary"
    if (readinessLevel === "Moderate") return "bg-[oklch(0.55_0.15_264)]"
    if (readinessLevel === "At Risk") return "bg-destructive"

    // fallback (if API not yet wired)
    if (safeScore >= 70) return "bg-primary"
    if (safeScore >= 40) return "bg-[oklch(0.55_0.15_264)]"
    return "bg-destructive"
  }

  const getLabel = () => {
    if (readinessLevel) return readinessLevel

    if (safeScore >= 70) return "Good Readiness"
    if (safeScore >= 40) return "Moderate Readiness"
    return "Low Readiness"
  }

  const getTextColor = () => {
    if (safeScore >= 40) return "text-primary-foreground"
    return "text-white"
  }

  return (

    <div className="p-5 space-y-4 border border-border/60 rounded-xl bg-card">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm font-semibold text-foreground">
            Retirement Sustainability Index
          </p>
          <p className="text-xs text-muted-foreground">
            Measures how sustainable your retirement plan is
          </p>
        </div>

        <span
          className={`
            px-2.5 py-1 text-xs rounded-md font-medium
            ${getColor()}
            ${getTextColor()}
          `}
        >
          {getLabel()}
        </span>

      </div>

      {/* SCALE MARKERS (important upgrade) */}
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>0%</span>
        <span>40%</span>
        <span>70%</span>
        <span>100%</span>
      </div>

      {/* BAR */}
      <div className="relative w-full h-3 overflow-hidden rounded-full bg-muted">

        <div
          className={`
            h-full rounded-full transition-all duration-700 ease-out
            ${getColor()}
          `}
          style={{ width: `${safeScore}%` }}
        />

      </div>

      {/* VALUE */}
      <div className="flex items-center justify-between">

        <span className="text-xs text-muted-foreground">
          RSI Score
        </span>

        <span className="text-sm font-semibold text-primary">
          {safeScore.toFixed(1)}%
        </span>

      </div>

    </div>
  )
}