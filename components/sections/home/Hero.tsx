import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="w-full py-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

        {/* Left Content */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Plan Your Retirement <br />
            <span className="text-blue-600">
              With Confidence
            </span>
          </h1>

          <p className="text-muted-foreground text-lg">
            ZikoRetire helps you project your pension, understand your
            future income, and make smarter financial decisions today.
          </p>

          <div className="flex gap-4">
            <Button size="lg">
              Start Simulation
            </Button>

            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Right Content */}
        <div className="bg-muted rounded-2xl p-6 shadow-sm">
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
            <div className="h-4 bg-gray-300 rounded w-2/3" />

            <div className="mt-6 h-40 bg-gray-200 rounded-xl flex items-center justify-center">
              <span className="text-sm text-muted-foreground">
                Chart Preview
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}