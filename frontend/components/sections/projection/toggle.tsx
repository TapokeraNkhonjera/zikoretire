"use client"

export function Toggle({
  checked,
  onChange
}: {
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 flex items-center rounded-full transition ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  )
}