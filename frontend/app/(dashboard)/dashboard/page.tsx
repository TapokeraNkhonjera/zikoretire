"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

import { DashboardStats } from "@/components/sections/dashboard/dashboard-stats"
import { ProjectionChart } from "@/components/sections/dashboard/projection-chart"
import { RecentActivity } from "@/components/sections/dashboard/recent-activity"
import { usePriorityUpdates } from "@/hooks/usePriorityUpdates"

import { DashboardOverview } from "@/types/dashboard"

export default function DashboardPage() {

  const { data: session } = useSession()
  const userId = session?.user?.id

  const [data, setData] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const { lastPriorityChange } = usePriorityUpdates()

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/dashboard/overview?userId=${userId}`)
      const json = await res.json()

      console.log("API RESPONSE:", json)

      if (json.success) {
        setData(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

useEffect(() => {
  console.log("EFFECT TRIGGERED", userId)

  if (!userId) return

  fetchData()
}, [userId])

// Listen for priority changes and refresh dashboard data
useEffect(() => {
  if (lastPriorityChange && userId) {
    console.log("Priority changed, refreshing dashboard:", lastPriorityChange)
    fetchData()
  }
}, [lastPriorityChange, userId])

  if (loading) {
    return <p className="p-6 pt-12">Loading dashboard...</p>
  }

  if (!data) {
    return <p className="p-6 pt-12">No data available</p>
  }

  console.log("FETCHING USER:", userId)

  return (
    <div className="flex flex-col gap-4 pt-16 sm:pt-20 lg:gap-8 lg:pt-20">

      <div className="px-4 sm:px-0">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight lg:text-3xl">
          Dashboard Overview
        </h2>

        <p className="mt-1 text-sm sm:text-base text-muted-foreground">
          Here&apos;s an overview of your retirement projection.
        </p>
      </div>

      <div className="px-4 sm:px-0">
        <DashboardStats stats={data.stats} />
      </div>

      <div className="px-4 sm:px-0">
        <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProjectionChart data={data.chartData} />
          </div>

          <div>
            <RecentActivity activity={data.activity} />
          </div>
        </div>
      </div>

    </div>
  )
}