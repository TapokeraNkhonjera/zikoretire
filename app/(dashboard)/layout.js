"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

import AppSidebar from "./dashboard/components/sidebar";
import Header from "./dashboard/components/header";

/* ---------------- Protected Layout ---------------- */
function ProtectedLayout({ children }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      router.refresh();
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(99,179,237,0.3) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(99,179,237,0.3) 1px, transparent 1px)
                `,
                backgroundSize: "30px 30px",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10">
            <Header />
            <main className="p-6">{children}</main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

/* ---------------- Main Layout ---------------- */
export default function DashboardLayout({ children }) {
  return (
    <SessionProvider>
      <ProtectedLayout>{children}</ProtectedLayout>
    </SessionProvider>
  );
}