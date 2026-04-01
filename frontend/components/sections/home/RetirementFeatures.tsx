"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  LineChart,
  ShieldCheck,
  GitBranch,
} from "lucide-react";

const features = [
  {
    title: "Contribution Simulation",
    description:
      "Model regular and irregular pension contributions to see how your savings grow over time.",
    icon: TrendingUp,
  },
  {
    title: "Inflation Adjustment",
    description:
      "Estimate real purchasing power at retirement with accurate inflation projections.",
    icon: LineChart,
  },
  {
    title: "Retirement Sustainability Index",
    description:
      "See how long your retirement savings may last with our comprehensive RSI score.",
    icon: ShieldCheck,
  },
  {
    title: "Scenario Planning",
    description:
      "Test different retirement strategies and compare outcomes to make informed decisions.",
    icon: GitBranch,
  },
];

export default function RetirementFeatures() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto text-center max-w-7xl">

        <h2 className="mb-4 text-3xl font-bold md:text-4xl">
          Everything You Need to Plan Your Future
        </h2>

        <p className="max-w-2xl mx-auto mb-12 text-muted-foreground">
          Powerful tools designed to help pension contributors understand
          and optimize their retirement savings.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Card
                key={index}
                className="text-left transition duration-300 hover:shadow-lg"
              >
                <CardHeader className="flex flex-row items-center gap-4">

                  <div className="p-3 rounded-xl bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>

                  <CardTitle className="text-lg">
                    {feature.title}
                  </CardTitle>

                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>

              </Card>
            );
          })}

        </div>
      </div>
    </section>
  );
}