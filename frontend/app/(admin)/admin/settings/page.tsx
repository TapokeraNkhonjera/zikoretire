"use client";

import { useSession } from "next-auth/react";
import SettingsPage from "../../../../app/(dashboard)/dashboard/settings/page";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  
  // Check if user is admin
  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access admin settings.</p>
        </div>
      </div>
    );
  }

  // Reuse the same settings component for admin
  return <SettingsPage />;
}
