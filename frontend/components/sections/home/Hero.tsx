import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative w-full px-6 overflow-hidden py-28 md:px-12 lg:px-20">



      {/* Grid Overlay (industrial feel) */}
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

      <div className="grid items-center gap-16 mx-auto max-w-7xl md:grid-cols-2">

        {/* LEFT */}
        <div className="space-y-8">

          {/* Tag */}
          <div className="inline-flex items-center px-3 py-1 text-xs border rounded-full text-muted-foreground">
            Pension Projection System
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-heading leading-[1.1] tracking-tight">
            Plan Your Retirement
            <br />
            <span className="text-primary">
              With Confidence
            </span>
          </h1>

          {/* Description */}
          <p className="max-w-lg text-lg text-muted-foreground">
            ZikoRetire helps you simulate pension growth, estimate future income,
            and understand if your savings will truly sustain your lifestyle.
          </p>

          {/* Actions */}
          <div className="flex gap-4">
            <Button size="lg" className="shadow-lg shadow-primary/30">
              Start Simulation
            </Button>

            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>

          {/* Trust Line */}
          <p className="text-xs text-muted-foreground">
            Built for Malawi’s pension framework • Simple • Transparent • Data-driven
          </p>

        </div>

        {/* RIGHT - PRODUCT PREVIEW */}
        <div className="relative">

          {/* Outer Glow */}
          <div className="absolute opacity-50 -inset-1 rounded-2xl bg-gradient-to-r from-primary/40 to-transparent blur-xl" />

          {/* Card */}
          <div className="relative p-6 border shadow-xl bg-card border-border/50 rounded-2xl">

            {/* Fake Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Simulation Preview</span>
              <span className="text-xs text-muted-foreground">RSI: 72%</span>
            </div>

            {/* Graph Area */}
            <div className="flex items-center justify-center h-40 mb-6 rounded-xl bg-muted/60">
              <span className="text-sm text-muted-foreground">
                Growth Chart
              </span>
            </div>

            {/* Data Rows */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Projected Value</span>
                <span className="font-medium">MWK 45.2M</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Income</span>
                <span className="font-medium">MWK 320,000</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Readiness</span>
                <span className="font-medium text-primary">Moderate</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}