"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

interface PlatformStats {
  totalUsers: number;
  totalSavings: number;
  accuracyRate: number;
  uptimePercentage: number;
}

export default function Hero() {
  const router = useRouter();

  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalSavings: 0,
    accuracyRate: 0,
    uptimePercentage: 0,
  });

  useEffect(() => {
    fetch("/api/stats/platform")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) =>
        console.error("Failed to fetch stats:", err)
      );
  }, []);

  return (
    <section className="relative w-full overflow-hidden px-6 py-24 md:px-12 lg:px-20">

      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 -z-10 opacity-[0.04]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, black 1px, transparent 1px),
              linear-gradient(to bottom, black 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* GLOW */}
      <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">

        {/* LEFT CONTENT */}
        <div className="space-y-7">

          <div className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] font-medium tracking-wide text-muted-foreground backdrop-blur">
            Pension Projection System
          </div>

          <div className="space-y-5">

            <h1 className="font-heading text-5xl leading-[1.05] tracking-tight md:text-6xl">
              Plan Your Retirement
              <br />
              <span className="text-primary">
                With Confidence
              </span>
            </h1>

            <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
              ZikoRetire helps users simulate pension growth,
              estimate future retirement income, and understand
              long-term financial readiness using transparent,
              data-driven projections.
            </p>

          </div>

          {/* BUTTONS */}
          <div className="flex flex-wrap gap-3 pt-1">

            <Button
              size="sm"
              className="h-10 rounded-lg px-5 text-sm shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-primary/40"
              onClick={() => router.push("/auth/signin")}
            >
              Start Simulation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-lg px-5 text-sm transition-all duration-300 hover:scale-[1.03] hover:bg-primary hover:text-primary-foreground"
              onClick={() => router.push("/about")}
            >
              Learn More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

          </div>

          {/* FOOTNOTE */}
          <div className="flex flex-wrap items-center gap-5 pt-2 text-xs text-muted-foreground">

            <div>
              <span className="font-semibold text-foreground">
                {stats.totalUsers.toLocaleString()}
              </span>{" "}
              Active Users
            </div>

            <div>
              <span className="font-semibold text-foreground">
                MWK {(stats.totalSavings / 1000000).toFixed(1)}M
              </span>{" "}
              Simulated
            </div>

            <div>
              <span className="font-semibold text-primary">
                {stats.accuracyRate}%
              </span>{" "}
              Accuracy
            </div>

          </div>

        </div>

        {/* RIGHT MOCKUP */}
        <div className="relative flex items-center justify-center">

          {/* BACK GLOW */}
          <div className="absolute h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl" />

          {/* MACBOOK IMAGE */}
          <div
            className="
              relative
              w-full
              max-w-[760px]
              transition-all
              duration-500
              hover:-translate-y-2
              hover:scale-[1.01]
            "
          >

            <Image
              src="/uploads/LAPOTOP-MOCKUP.png"
              alt="ZikoRetire Dashboard Mockup"
              width={1400}
              height={1000}
              priority
              className="
                h-auto
                w-full
                object-contain
                drop-shadow-[0_30px_60px_rgba(0,0,0,0.28)]
              "
            />

          </div>

          {/* FLOATING STATS CARD */}
          <div
            className="
              absolute
              bottom-2
              left-0
              hidden
              rounded-2xl
              border
              border-border/60
              bg-background/90
              p-4
              shadow-2xl
              backdrop-blur-xl
              md:block
            "
          >
            <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              Monthly Contribution
            </p>

            <p className="text-lg font-semibold tracking-tight">
              MWK 60,000
            </p>

            <p className="mt-1 text-xs text-primary">
              +12% projection growth
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}