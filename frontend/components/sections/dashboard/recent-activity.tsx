import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, GitBranch, FileText, Settings } from "lucide-react"

const activities = [
  {
    icon: Calculator,
    title: "New projection created",
    description: "Standard retirement plan",
    time: "2 hours ago",
  },
  {
    icon: GitBranch,
    title: "Scenario comparison",
    description: "Compared 3 scenarios",
    time: "1 day ago",
  },
  {
    icon: FileText,
    title: "Report exported",
    description: "PDF summary downloaded",
    time: "3 days ago",
  },
  {
    icon: Settings,
    title: "Settings updated",
    description: "Currency changed to MWK",
    time: "1 week ago",
  },
]

export function RecentActivity() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest actions and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                <activity.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
