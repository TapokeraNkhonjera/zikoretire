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
    <header
      className="fixed top-0 right-0 z-50 flex items-center justify-between h-16 px-6 transition-all duration-300 border-b bg-background"
      style={{
        left: "var(--sidebar-width, 16rem)",
        width: "calc(100% - var(--sidebar-width, 16rem))",
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
            Dashboard Overview
          </p>
          <h1 className="text-lg font-semibold text-foreground">
            Welcome back, {user?.name?.split(" ")[0] ?? "User"}!
          </h1>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 border rounded-xl hover:bg-muted">
          <Bell className="w-5 h-5 text-primary" />
          <span className="absolute w-2 h-2 rounded-full -top-1 -right-1 bg-primary" />
        </button>

        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="text-primary hover:bg-primary/10"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}