"use client";

import { useSession, signOut } from "next-auth/react";

import { Menu, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import StyledNotificationBell from "@/components/notifications/StyledNotificationBell";

export default function AdminHeader() {
  const { data: session } = useSession();
  const { open, toggleSidebar } = useSidebar();

  const user = session?.user;

  return (
    <header
      className={cn(
        // Fixed to top, always flush to right edge
        "fixed top-0 right-0 z-50",
        "flex items-center justify-between h-16 px-4 sm:px-6",
        "border-b bg-background transition-all duration-300",
        // Mobile: always full width from left-0 (sidebar is overlay)
        // Desktop: offset by sidebar width
        "left-0",
        open ? "lg:left-64" : "lg:left-20"
      )}
    >
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* Mobile-only: hamburger opens sidebar overlay */}
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-primary" />
        </Button>

        {/* Desktop-only: collapse/expand panel icon */}
        <div className="hidden lg:block">
          <SidebarTrigger />
        </div>

        <div className="hidden sm:block">
          <p className="text-sm text-muted-foreground">
            Admin Dashboard
          </p>
          <h1 className="text-lg font-semibold truncate">
            Welcome back, {user?.name?.split(" ")[0] ?? "User"}!
          </h1>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        <StyledNotificationBell />

        <div className="hidden sm:flex sm:items-center sm:gap-3">
          <Avatar className="w-8 h-8">
            {user?.image ? (
              <img 
                src={user.image} 
                alt={user.name || 'Admin'}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.name?.[0]?.toUpperCase() ?? "A"}
              </AvatarFallback>
            )}
          </Avatar>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}