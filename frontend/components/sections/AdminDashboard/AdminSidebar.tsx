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
  const { open, openMobile, setOpenMobile } = useSidebar();

  const closeMobile = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop — only visible on small screens when sidebar is open */}
      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 lg:hidden",
          openMobile
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpenMobile(false)}
      />

      {/* Sidebar panel */}
      <aside
        className={cn(
          // Base: fixed, vertically locked top-to-bottom, layered above backdrop
          "fixed inset-y-0 left-0 z-40 flex flex-col",
          "bg-background border-r shadow-md",
          "transition-all duration-300 overflow-hidden",
          // Mobile: w-64, translate based on openMobile
          // Desktop: w-64 when open, w-20 when collapsed
          "w-64",
          openMobile ? "translate-x-0" : "-translate-x-full",
          open ? "lg:translate-x-0 lg:w-64" : "lg:translate-x-0 lg:w-20"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-center p-4 border-b h-16 shrink-0">
          {(open || openMobile) && (
            <h2 className="text-xl font-bold whitespace-nowrap overflow-hidden">
              ZikoRetire Admin
            </h2>
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
                    !open && !openMobile && "justify-center px-0"
                  )}
                >
                  <Icon size={18} className="shrink-0" />
                  {(open || openMobile) && (
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
              {(open || openMobile) && <span className="truncate">Home</span>}
            </Button>
          </Link>

          <Button
            className={cn("w-full gap-2", !open && "justify-center px-0")}
            variant="outline"
          >
            <LogOut size={18} className="shrink-0" />
            {(open || openMobile) && <span className="truncate">Logout</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}