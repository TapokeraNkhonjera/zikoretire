"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import AdminSidebar from "@/components/sections/AdminDashboard/AdminSidebar";
import AdminHeader from "@/components/sections/AdminDashboard/AdminHeader";

interface AdminClientLayoutProps {
  children: ReactNode;
  session: Session;
}

/** Inner shell — must live inside SidebarProvider to call useSidebar */
function AdminLayoutShell({ children }: { children: ReactNode }) {
  const { open } = useSidebar();

  return (
    <main
      className={cn(
        "min-h-screen pt-16 px-4 sm:px-6 py-6",
        "transition-all duration-300",
        // Mobile: no left offset (sidebar is an overlay)
        // Desktop: offset matches sidebar width
        open ? "lg:pl-[calc(16rem+1.5rem)]" : "lg:pl-[calc(5rem+1.5rem)]"
      )}
    >
      {children}
    </main>
  );
}

export default function AdminClientLayout({
  children,
  session,
}: AdminClientLayoutProps) {
  return (
    <SessionProvider session={session}>
      <SidebarProvider>
        <AdminSidebar />
        <AdminHeader />
        <AdminLayoutShell>{children}</AdminLayoutShell>
      </SidebarProvider>
    </SessionProvider>
  );
}