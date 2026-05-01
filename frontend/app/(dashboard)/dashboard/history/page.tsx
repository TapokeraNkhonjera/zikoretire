"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

import HistoryClient from "@/components/sections/history/HistoryClient"
import { HistorySimulation } from "@/components/sections/history/types"

export default function HistoryPage() {

  const { data: session } = useSession()
  const userId = session?.user?.id

  const [simulations, setSimulations] = useState<HistorySimulation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `/api/simulation/history?userId=${userId}`
        )

        const data = await res.json()

        if (data.success) {
          setSimulations(data.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [userId])

  return (
    <div className="flex flex-col gap-6 pt-12 lg:gap-8">

      <div>
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Simulation History
        </h2>

        <p className="mt-1 text-muted-foreground">
          Review past projections and track your retirement readiness over time.
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <HistoryClient simulations={simulations} />
      )}

    </div>
  )
}