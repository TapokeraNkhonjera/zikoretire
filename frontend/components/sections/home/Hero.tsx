"use client";

import { Button } from "@/components/ui/button";

export default function Hero() {
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
            <Button size="lg" className="shadow-lg shadow-primary/30">
              Start Simulation
            </Button>

            <Button variant="outline" size="lg">
              Learn More
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
                <span className="text-muted-foreground">Projected Value</span>
                <span className="font-semibold">MWK 45.2M</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Income</span>
                <span className="font-semibold">MWK 320,000</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Growth Type</span>
                <span className="font-medium text-primary">Balanced</span>
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