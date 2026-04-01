import { Button } from "@/components/ui/button";

export default function AboutHero() {
  return (
    <section className="relative px-6 overflow-hidden py-28 md:px-12 lg:px-20">



      {/* Grid overlay */}
      <div className="absolute inset-0 -z-10 opacity-[0.04]">
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

      <div className="max-w-5xl mx-auto space-y-8 text-center">

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

        {/* Optional CTA */}
        <div className="flex justify-center gap-4">
          <Button size="lg">
            Start Planning
          </Button>
          <Button variant="outline" size="lg">
            View Features
          </Button>
        </div>

      </div>
    </section>
  );
}