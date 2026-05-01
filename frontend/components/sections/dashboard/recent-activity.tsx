"use client"

import { useRef } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import {
  Activity,
  Clock,
  ChevronUp,
  ChevronDown
} from "lucide-react"

import { ActivityItem } from "@/types/dashboard"

export function RecentActivity({
  activity
}: {
  activity: ActivityItem[]
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "up" | "down") => {
    if (!scrollRef.current) return

    const amount = 120
    scrollRef.current.scrollBy({
      top: direction === "up" ? -amount : amount,
      behavior: "smooth",
    })
  }

  return (
    <Card className="h-full border border-border/60 bg-card">
      
      {/* HEADER */}
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Recent Activity
        </CardTitle>

        <CardDescription>
          Your latest actions
        </CardDescription>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="relative">

        {/* TOP FADE */}
        <div className="absolute top-0 left-0 right-0 z-10 h-6 pointer-events-none bg-gradient-to-b from-background to-transparent" />

        {/* BOTTOM FADE */}
        <div className="absolute bottom-0 left-0 right-0 z-10 h-6 pointer-events-none bg-gradient-to-t from-background to-transparent" />

        {/* SCROLL BUTTONS */}
        <button
          onClick={() => scroll("up")}
          className="absolute z-20 p-1 transition rounded-md top-2 right-2 bg-muted/60 hover:bg-muted"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        <button
          onClick={() => scroll("down")}
          className="absolute z-20 p-1 transition rounded-md bottom-2 right-2 bg-muted/60 hover:bg-muted"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* SCROLL AREA */}
        <div
          ref={scrollRef}
          className="
            flex flex-col gap-3
            max-h-[280px]
            overflow-y-auto
            pr-2
            scrollbar-hide
          "
        >

          {activity.map((item, index) => (

            <div
              key={index}
              className={`
                flex items-start justify-between gap-3 p-3 rounded-lg

                transition-all duration-200
                hover:bg-muted/40
                hover:translate-x-1

                animate-in fade-in slide-in-from-bottom-2
              `}
              style={{
                animationDelay: `${index * 70}ms`,
                animationFillMode: "both",
              }}
            >

              {/* LEFT */}
              <div className="flex items-start gap-3">

                <div className="flex items-center justify-center w-8 h-8 border rounded-md bg-muted/40 border-border/60 shrink-0">
                  <Activity className="w-4 h-4 text-primary" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {item.title}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>

              </div>

              {/* TIME */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(item.time)}</span>
              </div>

            </div>

          ))}

        </div>
      </CardContent>
    </Card>
  )
}

/* ================= TIME FORMAT ================= */

function formatTime(time: string | Date) {
  const date = new Date(time)

  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return "Just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`

  return date.toLocaleDateString()
}