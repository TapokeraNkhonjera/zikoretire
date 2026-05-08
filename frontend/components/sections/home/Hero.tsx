"use client";

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
    uptimePercentage: 0
  });

  useEffect(() => {
    // Fetch real stats from API
    fetch('/api/stats/platform')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to fetch stats:', err));
  }, []);
  return (
    <section className="relative w-full px-6 overflow-hidden py-28 md:px-12 lg:px-20">

      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 -z-10 opacity-[0.05]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, black 1px, transparent 1px),
              linear-gradient(to bottom, black 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* SUBTLE GRADIENT GLOW */}

      <div className="grid items-center gap-16 mx-auto max-w-7xl md:grid-cols-2">

        {/* LEFT CONTENT */}
        <div className="space-y-8">

          <div className="inline-flex items-center px-3 py-1 text-xs border rounded-full text-muted-foreground">
            Pension Projection System
          </div>

          <h1 className="text-5xl md:text-6xl font-heading leading-[1.1] tracking-tight">
            Plan Your Retirement
            <br />
            <span className="text-primary">
              With Confidence
            </span>
          </h1>

          <p className="max-w-lg text-lg text-muted-foreground">
            ZikoRetire helps you simulate pension growth, estimate future income,
            and understand if your savings will truly sustain your lifestyle.
          </p>

          <div className="flex gap-4">
            <Button 
              size="lg" 
              className="shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:scale-105 transition-all duration-200"
              onClick={() => router.push('/auth/signin')}
            >
              Start Simulation
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button 
              variant="outline" 
              size="lg"
              className="hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all duration-200"
              onClick={() => router.push('/about')}
            >
              Learn More
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Built for Malawi’s pension framework • Simple • Transparent • Data-driven
          </p>

        </div>

        {/* RIGHT VISUAL */}
        <div className="relative">

          {/* GLOW */}
          <div className="absolute opacity-40 -inset-2 rounded-2xl bg-gradient-to-r from-primary/30 to-transparent blur-2xl" />

          {/* MAIN CARD */}
          <div className="relative p-6 border shadow-2xl bg-card border-border/50 rounded-2xl backdrop-blur">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium">Projection Overview</span>
              <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                RSI 72%
              </span>
            </div>

            {/* CHART (FAKE BUT REALISTIC) */}
            <div className="relative h-40 mb-6 overflow-hidden rounded-xl bg-muted/40">

              {/* Line */}
              <div className="absolute inset-0 flex items-end px-4">
                <div className="w-full h-[2px] bg-gradient-to-r from-primary/20 via-primary to-primary/20 relative">

                  {/* Dot */}
                  <div className="absolute right-0 w-3 h-3 translate-x-1/2 -translate-y-1/2 rounded-full shadow-md bg-primary shadow-primary/50" />

                </div>
              </div>

              {/* Subtle bars */}
              <div className="absolute inset-0 flex items-end justify-between px-3 pb-2 opacity-40">
                {[20, 35, 50, 70, 90].map((h, i) => (
                  <div
                    key={i}
                    className="w-2 rounded-sm bg-primary/30"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

            </div>

            {/* DATA */}
            <div className="space-y-4">

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Users</span>
                <span className="font-semibold">{stats.totalUsers.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Savings</span>
                <span className="font-semibold">MWK {(stats.totalSavings / 1000000).toFixed(1)}M</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Accuracy</span>
                <span className="font-medium text-primary">{stats.accuracyRate}%</span>
              </div>

            </div>

          </div>

          {/* FLOATING MINI CARD */}
          <div className="absolute p-4 border shadow-lg -bottom-6 -left-6 bg-card rounded-xl border-border/50 w-44">
            <p className="mb-1 text-xs text-muted-foreground">
              Contribution
            </p>
            <p className="text-lg font-semibold">
              MWK 60,000/mo
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}