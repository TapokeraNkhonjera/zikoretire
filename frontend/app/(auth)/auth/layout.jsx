"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthLayout({ children }) {
  const title = "Zikoretire";
  const description =
    "Plan, simulate, and optimize your retirement strategy.";

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2 dark:bg-black">
      
      {/* LEFT SIDE */}
      <div className="relative hidden m-6 overflow-hidden border lg:block rounded-3xl border-black/10">
        <Image
          src="/loginImage.jpg"
          alt="Authentication"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-[#0606EA]/40" />

        <div className="absolute z-10 max-w-md text-white bottom-12 left-12">
          <h1 className="text-4xl font-semibold leading-tight font-heading">
            Smarter Retirement Planning
          </h1>
          <p className="mt-4 text-sm opacity-90">
            Simulate outcomes, explore scenarios, and make confident financial decisions.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="relative flex items-center justify-center p-6 overflow-hidden">

        {/* GRID BACKGROUND */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(6,6,234,0.15) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(6,6,234,0.15) 1px, transparent 1px)
              `,
              backgroundSize: "32px 32px",
              maskImage:
                "radial-gradient(circle at center, black 0%, transparent 80%)",
              WebkitMaskImage:
                "radial-gradient(circle at center, black 0%, transparent 80%)",
            }}
          />
        </div>

        {/* HOME BUTTON */}
        <div className="absolute z-10 top-6 right-6">
          <Link href="/">
            <Button variant="outline" size="icon">
              <Home size={18} />
            </Button>
          </Link>
        </div>

        {/* CARD */}
        <Card className="relative z-10 w-full max-w-md border shadow-xl backdrop-blur-xl bg-white/90 dark:bg-neutral-900/80 border-black/10">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-heading">
              {title}
            </CardTitle>
            <CardDescription className="text-sm">
              {description}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}