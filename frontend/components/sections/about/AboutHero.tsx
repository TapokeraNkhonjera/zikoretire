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

export default function AboutHero() {
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

      <div className="max-w-5xl mx-auto space-y-12 text-center">

        {/* Label */}
        <div className="inline-flex items-center px-3 py-1 text-xs border rounded-full text-muted-foreground">
          About ZikoRetire
        </div>

        {/* Heading */}
        <h1 className="text-4xl leading-tight tracking-tight md:text-5xl font-heading">
          Built to Bring Clarity to
          <br />
          <span className="text-primary">
            Retirement Planning
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
          ZikoRetire is a digital pension projection system designed to help
          individuals in Malawi understand their future financial position through
          clear simulations, inflation-adjusted projections, and sustainability insights.
        </p>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-6 my-12">
          <div className="p-6 rounded-xl border border-border/50 bg-card">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 rounded-full bg-primary" />
            </div>
            <h3 className="font-semibold mb-2">Malawi-Focused</h3>
            <p className="text-sm text-muted-foreground">
              Pension calculations tailored for Malawi's economic context
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border/50 bg-card">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 rounded-full bg-primary" />
            </div>
            <h3 className="font-semibold mb-2">ML-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Machine learning insights for personalized recommendations
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border/50 bg-card">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 rounded-full bg-primary" />
            </div>
            <h3 className="font-semibold mb-2">Inflation-Adjusted</h3>
            <p className="text-sm text-muted-foreground">
              Real-time projections accounting for economic changes
            </p>
          </div>
        </div>

        {/* Real Stats */}
        <div className="grid md:grid-cols-4 gap-4 my-12">
          <div className="p-6 rounded-xl bg-muted/40">
            <div className="text-2xl font-bold text-primary">{stats.totalUsers.toLocaleString()}+</div>
            <div className="text-xs text-muted-foreground">Active Users</div>
          </div>
          <div className="p-6 rounded-xl bg-muted/40">
            <div className="text-2xl font-bold text-primary">MWK {(stats.totalSavings / 1000000).toFixed(1)}M</div>
            <div className="text-xs text-muted-foreground">Projected Savings</div>
          </div>
          <div className="p-6 rounded-xl bg-muted/40">
            <div className="text-2xl font-bold text-primary">{stats.accuracyRate}%</div>
            <div className="text-xs text-muted-foreground">Accuracy Rate</div>
          </div>
          <div className="p-6 rounded-xl bg-muted/40">
            <div className="text-2xl font-bold text-primary">{stats.uptimePercentage}%</div>
            <div className="text-xs text-muted-foreground">Availability</div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center gap-4">
          <Button 
            size="lg" 
            className="shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:scale-105 transition-all duration-200"
            onClick={() => router.push('/auth/signin')}
          >
            Start Planning
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all duration-200"
            onClick={() => router.push('/contact')}
          >
            View Features
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Trusted by Malawians • Secure • Transparent • Locally optimized
        </p>

      </div>
    </section>
  );
}