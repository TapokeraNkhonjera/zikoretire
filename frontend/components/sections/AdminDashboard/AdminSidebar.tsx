"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  BrainCircuit,
  Home,
  LogOut,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Overview",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },

  {
    title: "Users",
    href: "/admin/dashboard/users",
    icon: Users,
  },

  {
    title: "Reports",
    href: "/admin/dashboard/reports",
    icon: FileText,
  },

  {
    title: "System Logs",
    href: "/admin/dashboard/logs",
    icon: Activity,
  },
  {
    title: "ML Center",
    href: "/admin/dashboard/ml",
    icon: BrainCircuit,
  },

  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
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
            ZikoRetire Admin
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