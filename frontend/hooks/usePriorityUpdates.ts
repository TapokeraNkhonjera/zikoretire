"use client"

import { useEffect, useState } from "react"

export interface PriorityChangeEvent {
  simulationId: string
  isPriority: boolean
}

export function usePriorityUpdates() {
  const [lastPriorityChange, setLastPriorityChange] = useState<PriorityChangeEvent | null>(null)

  useEffect(() => {
    const handlePriorityChange = (event: CustomEvent<PriorityChangeEvent>) => {
      setLastPriorityChange(event.detail)
      
      // Auto-clear after 5 seconds
      setTimeout(() => {
        setLastPriorityChange(null)
      }, 5000)
    }

    // Add event listener
    window.addEventListener('simulationPriorityChanged', handlePriorityChange as EventListener)
    
    // Cleanup
    return () => {
      window.removeEventListener('simulationPriorityChanged', handlePriorityChange as EventListener)
    }
  }, [])

  return {
    lastPriorityChange,
    clearPriorityChange: () => setLastPriorityChange(null)
  }
}
