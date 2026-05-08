"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/contexts/SettingsContext";

import AppSidebar from "../../components/sections/dashboard/sidebar";
import Header from "../../components/sections/dashboard/header";

interface LayoutProps {
  children: ReactNode;
}

function LayoutWrapper({ children }: { children: ReactNode }) {
  const { state } = useSidebar();

  const mainMarginLeft = state === "expanded" ? "16rem" : "5rem";

  return (
    <div
      className="relative flex flex-col min-h-screen transition-all duration-200 ease-linear bg-background"
      style={{ marginLeft: mainMarginLeft }}
    >
      <Header />
      <div className="relative flex-1 flex flex-col lg:flex-row">
        <main className="relative z-10 flex-1 pt-20 p-6 min-w-0 overflow-x-auto lg:overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: LayoutProps) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <SettingsProvider>
        <TooltipProvider>
          <SidebarProvider defaultOpen>
            <AppSidebar />
            <LayoutWrapper>{children}</LayoutWrapper>
          </SidebarProvider>
        </TooltipProvider>
      </SettingsProvider>
    </SessionProvider>
  );
}