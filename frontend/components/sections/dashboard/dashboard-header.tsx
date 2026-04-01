"use client"

import { Bell } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between pb-4 border-b">
      
      <div>
        <p className="text-sm text-muted-foreground">Dashboard Overview</p>
        <h1 className="text-xl font-semibold">Notifications</h1>
      </div>

      <div className="flex items-center gap-4">
        
        {/* Notification button */}
        <button className="relative p-2 border rounded-xl hover:bg-muted">
          <Bell className="w-5 h-5" />
          <span className="absolute w-2 h-2 rounded-full -right-1 -top-1 bg-primary"></span>
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>G</AvatarFallback>
          </Avatar>

          <div className="text-sm">
            <p className="font-medium">Guest</p>
            <p className="text-xs text-muted-foreground">User</p>
          </div>
        </div>

      </div>
    </div>
  )
}
