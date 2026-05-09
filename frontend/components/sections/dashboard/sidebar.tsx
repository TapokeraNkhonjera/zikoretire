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
  BarChart3,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Projection", href: "/dashboard/projection", icon: Calculator },
  { title: "History", href: "/dashboard/history", icon: History },
  { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();

  const closeMobile = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 lg:hidden",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar panel */}
      <aside
        className={cn(
          // Vertically locked: inset-y-0 pins it from top to bottom of viewport
          "fixed inset-y-0 left-0 z-40 flex flex-col",
          "bg-background border-r shadow-md",
          "transition-all duration-300 overflow-hidden",
          // Mobile: always w-64, slides in/out as overlay
          // Desktop: w-64 when open, w-20 when collapsed
          open
            ? "w-64 translate-x-0"
            : "w-64 -translate-x-full lg:translate-x-0 lg:w-20"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-center p-4 border-b h-16 shrink-0">
          {open ? (
            <h2 className="text-xl font-bold whitespace-nowrap overflow-hidden">
              ZikoRetire
            </h2>
          ) : (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">Z</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} onClick={closeMobile}>
                <Button
                  variant={pathname === item.href ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    !open && "justify-center px-0"
                  )}
                >
                  <Icon size={18} className="shrink-0" />
                  {open && (
                    <span className="truncate">{item.title}</span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="flex flex-col gap-2 p-2 border-t shrink-0">
          <Link href="/" onClick={closeMobile}>
            <Button
              className={cn("w-full gap-2", !open && "justify-center px-0")}
              variant="outline"
            >
              <Home size={18} className="shrink-0" />
              {open && <span className="truncate">Home</span>}
            </Button>
          </Link>

          <Button
            className={cn("w-full gap-2", !open && "justify-center px-0")}
            variant="outline"
          >
            <LogOut size={18} className="shrink-0" />
            {open && <span className="truncate">Logout</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}