"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { cn } from "@/lib/utils";

import AppSidebar from "../../components/sections/dashboard/sidebar";
import Header from "../../components/sections/dashboard/header";

interface LayoutProps {
  children: ReactNode;
}

/** Inner shell — must live inside SidebarProvider to call useSidebar */
function LayoutWrapper({ children }: { children: ReactNode }) {
  const { open } = useSidebar();

  return (
    <main
      className={cn(
        "min-h-screen pt-16 px-4 sm:px-6 py-6",
        "transition-all duration-300",
        // Mobile: no left offset (sidebar is overlay)
        // Desktop: offset matches sidebar width
        open ? "lg:pl-[calc(16rem+1.5rem)]" : "lg:pl-[calc(5rem+1.5rem)]"
      )}
    >
      {children}
    </main>
  );
}

export default function DashboardLayout({ children }: LayoutProps) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <SettingsProvider>
        <TooltipProvider>
          <SidebarProvider defaultOpen>
            <AppSidebar />
            <Header />
            <LayoutWrapper>{children}</LayoutWrapper>
          </SidebarProvider>
        </TooltipProvider>
      </SettingsProvider>
    </SessionProvider>
  );
}