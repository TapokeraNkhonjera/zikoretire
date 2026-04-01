import { Card, CardContent } from "@/components/ui/card"
import { Wallet, TrendingUp, Banknote, Gauge } from "lucide-react"

const stats = [
  {
    title: "Total Contributions",
    value: "MK 2,450,000",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: Wallet,
    description: "Lifetime contributions",
  },
  {
    title: "Projected Retirement Fund",
    value: "MK 8,750,000",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "At age 60",
  },
  {
    title: "Estimated Monthly Pension",
    value: "MK 72,917",
    change: "+5.1%",
    changeType: "positive" as const,
    icon: Banknote,
    description: "Post-retirement income",
  },
{
  title: "Retirement Sustainability Index",
  value: "78%",
  change: "Good",
  changeType: "positive" as const,
  icon: Gauge,
  description: "RSI Score",
}
]

export function DashboardStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
                <div className="w-full h-2 mt-3 rounded-full bg-muted">
  <div
    className="h-2 rounded-full bg-primary"
    style={{ width: "78%" }}
  />
</div>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      stat.changeType === "positive"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground">{stat.description}</span>
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 shrink-0 rounded-xl bg-primary/10">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
