"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { useEffect } from "react";
import SessionManager from "@/lib/sessionManager";

interface Props {
  children: React.ReactNode;
}

export default function CustomSessionProvider({ children }: Props) {
  useEffect(() => {
    // Initialize session manager on client side
    if (typeof window !== 'undefined') {
      SessionManager.cleanupOldSessions();
    }
  }, []);

  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  );
}
