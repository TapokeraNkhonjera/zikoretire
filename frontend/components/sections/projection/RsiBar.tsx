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
    <div className="relative p-5 space-y-5 border border-border/40 rounded-2xl bg-card shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      
      {/* Decorative background blur */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full pointer-events-none transition-colors duration-1000 ${getColor()}`} />

      {/* HEADER */}
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-sm font-bold tracking-tight text-foreground">
            Retirement Sustainability Index
          </p>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Measures plan sustainability
          </p>
        </div>

        <span
          className={`
            px-3 py-1 text-xs rounded-full font-bold tracking-wide shadow-sm
            ${getColor()}
            ${getTextColor()}
          `}
        >
          {getLabel()}
        </span>
      </div>

      {/* BAR CONTAINER */}
      <div className="relative pt-2 pb-1 z-10">
        {/* SCALE MARKERS */}
        <div className="flex justify-between text-[10px] font-medium text-muted-foreground/60 mb-2 px-1">
          <span>0%</span>
          <span>40%</span>
          <span>70%</span>
          <span>100%</span>
        </div>

        {/* BAR BACKGROUND */}
        <div className="relative w-full h-4 overflow-hidden rounded-full bg-muted/50 border border-border/50 shadow-inner">
          
          {/* BAR FILL */}
          <div
            className={`
              absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out
              ${getColor()}
            `}
            style={{ 
              width: `${safeScore}%`,
              boxShadow: "inset 0 2px 4px rgba(255,255,255,0.2)"
            }}
          >
            {/* Inner gradient shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full animate-[shimmer_2s_infinite]" style={{ backgroundSize: '200% 100%' }} />
          </div>
        </div>
      </div>

      {/* VALUE */}
      <div className="flex items-center justify-between pt-1 relative z-10">
        <span className="text-xs font-medium text-muted-foreground">
          RSI Score
        </span>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-black tracking-tighter ${getColor().replace('bg-', 'text-')}`}>
            {safeScore.toFixed(1)}
          </span>
          <span className="text-sm font-bold text-muted-foreground">%</span>
        </div>
      </div>
    </div>
  )
}