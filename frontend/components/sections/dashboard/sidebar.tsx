"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  Calculator,
  History,
  LogOut,
  Home,
  BarChart3, // ✅ added
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Projection", href: "/dashboard/projection", icon: Calculator },
  { title: "History", href: "/dashboard/history", icon: History },
  { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 }, // ✅ added
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <div
      className={cn(
        "fixed top-0 left-0 h-screen bg-background border-r shadow-md flex flex-col transition-all duration-300 z-40",
        open ? "w-64" : "w-20"
      )}
    >
      {/* Logo */}

      <div className="flex items-center justify-center p-4 sm:p-6 border-b">
        {open && (
          <h2 className="text-xl font-bold">
            ZikoRetire
          </h2>
        )}
      </div>

      {/* Navigation */}

      <nav className="flex-1 p-2 sm:p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={
                  pathname === item.href
                    ? "default"
                    : "ghost"
                }
                className={cn(
                  "w-full justify-start gap-2",
                  !open && "justify-center"
                )}
              >
                <Icon size={18} />
                {open && <span className="hidden sm:inline">{item.title}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}

      <div className="flex flex-col gap-2 p-2 sm:p-4 border-t">
        <Link href="/">
          <Button
            className={cn(
              "w-full gap-2",
              !open && "justify-center"
            )}
            variant="outline"
          >
            <Home size={18} />
            {open && <span className="hidden sm:inline">Home</span>}
          </Button>
        </Link>

        <Button
          className={cn(
            "w-full gap-2",
            !open && "justify-center"
          )}
          variant="outline"
        >
          <LogOut size={18} />
          {open && <span className="hidden sm:inline">Logout</span>}
        </Button>
      </div>
    </div>
  );
}