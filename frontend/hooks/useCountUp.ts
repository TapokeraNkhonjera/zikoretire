"use client"

import { useEffect, useState } from "react"

interface CountUpOptions {
  duration?: number
  decimals?: number
}

export function useCountUp(
  target: number,
  { duration = 1000, decimals = 0 }: CountUpOptions = {}
) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    let frame: number

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp

      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = easeOutCubic(progress)

      const current = target * eased
      setValue(Number(current.toFixed(decimals)))

      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frame)
  }, [target, duration, decimals])

  return value
}