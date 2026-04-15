"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

import { SidebarProvider } from "@/components/ui/sidebar";

import AdminSidebar from "@/components/sections/AdminDashboard/AdminSidebar";
import AdminHeader from "@/components/sections/AdminDashboard/AdminHeader";

interface AdminClientLayoutProps {
  children: ReactNode;
  session: Session;
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

        <main className="pt-16 pl-(--sidebar-width,16rem) p-6">
          {children}
        </main>
      </SidebarProvider>
    </SessionProvider>
  );
}