"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  FolderKanban,
  CalendarCheck,
  FileText,
  Users,
  Video,
  Mail,
  Building2,
  UserCog,
} from "lucide-react";

// --------------------- NAV ITEMS ---------------------

export const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },



  { label: "Users", href: "/dashboard/users", icon: UserCog },
];

// --------------------- SIDEBAR COMPONENT ---------------------

export default function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      {/* ---------- HEADER ---------- */}
      <Link href="/dashboard">
        <SidebarHeader className="flex items-center px-2 cursor-pointer">
          <div className="flex text-3xl font-black h-10 items-center gap-2 px-2">
            <span className="truncate group-data-[collapsible=icon]:hidden">
              Dashboard
            </span>
          </div>
        </SidebarHeader>
      </Link>

      {/* ---------- CONTENT ---------- */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ---------- FOOTER ---------- */}
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <div className="px-3 py-2 text-xs text-muted-foreground">
          © 2026 zikoretire.com. All rights reserved.
        </div>
      </SidebarFooter>

      {/* ---------- RAIL ---------- */}
      <SidebarRail />
    </Sidebar>
  );
}
