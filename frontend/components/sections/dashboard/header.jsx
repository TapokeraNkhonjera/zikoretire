"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Header() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b bg-background">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        {/* Sidebar Collapse Trigger */}
        <SidebarTrigger>
          <Button
            variant="outline"
            size="icon"
            className="flex items-center justify-center p-2"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SidebarTrigger>

        {/* Header Titles */}
        <div className="hidden sm:block">
          <p className="text-sm text-muted-foreground">Dashboard Overview</p>
          <h1 className="text-lg font-semibold">Notifications</h1>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          className="relative p-2 transition border rounded-xl hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute w-2 h-2 rounded-full -top-1 -right-1 bg-primary" />
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback>{user?.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
          </Avatar>
          <div className="hidden text-sm sm:block">
            <p className="font-medium text-foreground">{user?.name ?? "User"}</p>
            <p className="text-xs text-muted-foreground">Account</p>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          size="icon"
          className="text-red-500 hover:bg-red-500/10"
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}