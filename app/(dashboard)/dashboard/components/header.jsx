"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();

  const user = session?.user;

  return (
    <header className="h-14 border-b px-6 flex items-center justify-between bg-background shadow-sm">
      {/* Left section */}
      <div className="flex h-14 items-center">
        <SidebarTrigger />
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        {/* User Avatar */}
        <div className="flex items-center space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <span className="hidden sm:block font-medium text-foreground">
            {user?.name || "User"}
          </span>
        </div>

        {/* Sign Out Button */}
        <Button
          variant="outline"
          size="icon"
          className="text-red-500 hover:bg-red-500/10 transition"
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
