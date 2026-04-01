"use client";

import { Card, CardContent } from "@/components/ui/card";
import { User, Calculator, BarChart3 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Enter Contribution Details",
    description:
      "Provide your current age, retirement goals, and contribution amounts. Our simple forms guide you through the process.",
    icon: User,
  },
  {
    number: "02",
    title: "Run Retirement Projection",
    description:
      "Our system calculates your projected savings using realistic market assumptions and inflation adjustments.",
    icon: Calculator,
  },
  {
    number: "03",
    title: "View Sustainability Results",
    description:
      "Get your Retirement Sustainability Index (RSI) score and detailed projections to guide your planning decisions.",
    icon: BarChart3,
  },
];

export default function HowItWorks() {
  return (
    <section className="px-6 py-24 bg-muted/30">
      <div className="mx-auto text-center max-w-7xl">

        <h2 className="mb-4 text-3xl font-bold md:text-4xl">
          Simple Steps to Financial Security
        </h2>

        <p className="max-w-2xl mx-auto mb-16 text-muted-foreground">
          Getting started with ZikoRetire takes just a few minutes. No complex
          setup required.
        </p>

        <div className="relative grid gap-10 md:grid-cols-3">

          {/* Connector line */}
<div className="hidden md:block absolute top-7 left-0 right-0 h-0.5
bg-[repeating-linear-gradient(90deg,var(--color-primary)_0px,var(--color-primary)_6px,transparent_6px,transparent_14px)]
animate-[flowLine_2s_linear_infinite] opacity-60">
</div>

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={index} className="relative">

                {/* Step Number */}
                <div className="relative z-10 flex justify-center mb-6">
                  <div className="flex items-center justify-center text-lg font-bold text-white transition-transform rounded-full shadow-lg h-14 w-14 bg-primary hover:scale-110">
                    {step.number}
                  </div>
                </div>

                <Card className="text-center transition-all duration-300 hover:shadow-xl">
                  <CardContent className="px-6 pt-8 pb-8">

                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>

                    <h3 className="mb-2 text-lg font-semibold">
                      {step.title}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>

                  </CardContent>
                </Card>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}