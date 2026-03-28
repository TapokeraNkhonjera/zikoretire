"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Calculator,
  History,
  RefreshCcw,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Simulation",
    href: "/retirement/simulation",
    icon: Calculator,
  },
  {
    title: "History",
    href: "/dashboard/history",
    icon: History,
  },
  {
    title: "Scenarios",
    href: "/dashboard/scenarios",
    icon: RefreshCcw,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">

      {/* Logo */}
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">
          ZikoRetire
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">

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
                  "w-full justify-start gap-2"
                )}
              >
                <Icon size={18} />

                {item.title}

              </Button>

            </Link>
          );
        })}

      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t">

        <Button
          variant="outline"
          className="w-full gap-2"
        >
          <LogOut size={18} />

          Logout
        </Button>

      </div>

    </div>
  );
}