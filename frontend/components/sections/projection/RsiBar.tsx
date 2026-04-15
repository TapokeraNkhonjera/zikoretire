export default function RsiBar({
  score
}: {
  score: number
}) {

  const getRsiColor = (score: number) => {
    if (score >= 70) return "bg-primary"
    if (score >= 40) return "bg-[oklch(0.55_0.15_264)]" // lighter blue
    return "bg-destructive"
  }

  const getRsiLabel = (score: number) => {
    if (score >= 70) return "Good Readiness"
    if (score >= 40) return "Moderate Readiness"
    return "Low Readiness"
  }

  const getTextColor = (score: number) => {
    if (score >= 40) return "text-primary-foreground"
    return "text-white"
  }

  return (

    <div className="p-4 space-y-3 border rounded-xl bg-card">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <span className="text-sm font-medium text-foreground">
          Retirement Sustainability Index
        </span>

        <span
          className={`
            px-2.5 py-1 text-xs rounded-md font-medium
            ${getRsiColor(score)}
            ${getTextColor(score)}
          `}
        >
          {getRsiLabel(score)}
        </span>

      </div>

      {/* BAR */}
      <div className="w-full h-3 overflow-hidden rounded-full bg-muted">

        <div
          className={`
            h-full rounded-full transition-all duration-500
            ${getRsiColor(score)}
          `}
          style={{ width: `${score}%` }}
        />

      </div>

      {/* VALUE */}
      <div className="flex justify-end">
        <span className="text-xs font-medium text-primary">
          {score}%
        </span>
      </div>

    </div>

  )
}