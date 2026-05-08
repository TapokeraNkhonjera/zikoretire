"use client";

import { useSession, signOut } from "next-auth/react";

import { Menu, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import { SidebarTrigger } from "@/components/ui/sidebar";
import StyledNotificationBell from "@/components/notifications/StyledNotificationBell";

export default function AdminHeader() {
  const { data: session } = useSession();

  const user = session?.user;

  return (
    <header
      className="fixed top-0 right-0 z-50 flex items-center justify-between h-16 px-4 sm:px-6 border-b bg-background"
      style={{
        left: "var(--sidebar-width, 16rem)",
        width:
          "calc(100% - var(--sidebar-width, 16rem))",
      }}
    >
      {/* LEFT */}

      <div className="flex items-center gap-4">
        <SidebarTrigger>
          <Button variant="outline" size="icon">
            <Menu className="w-5 h-5 text-primary" />
          </Button>
        </SidebarTrigger>

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

      <div className="flex items-center gap-4">
        <StyledNotificationBell />

        <div className="hidden sm:flex sm:items-center sm:gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.name?.[0]?.toUpperCase() ?? "A"}
            </AvatarFallback>
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