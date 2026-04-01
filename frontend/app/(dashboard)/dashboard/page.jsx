import { DashboardStats } from "@/components/sections/dashboard/dashboard-stats"
import { ProjectionChart } from "@/components/sections/dashboard/projection-chart"
import { RecentActivity } from "@/components/sections/dashboard/recent-activity"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 lg:gap-8">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          Welcome Back
        </h2>

        <p className="mt-1 text-muted-foreground">
          Here&apos;s an overview of your retirement projection.
        </p>
      </div>

      <DashboardStats />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProjectionChart />
        </div>

        <div>
          <RecentActivity />
        </div>
      </div>

    </div>
  )
}