"use client";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


// Validation Schema
const simulationSchema = z.object({
  age: z.number().min(18).max(60),
  retirementAge: z.number().min(50).max(75),
  monthlyIncome: z.number().min(1),
  monthlyContribution: z.number().min(0),
  currentSavings: z.number().min(0),
  inflationRate: z.number().min(0).max(20),
  lifestyle: z.string(),
});


type SimulationFormValues = z.infer<typeof simulationSchema>;

export default function SimulationForm() {
  const form = useForm<SimulationFormValues>({
    resolver: zodResolver(simulationSchema),
    defaultValues: {
      age: 30,
      retirementAge: 60,
      monthlyIncome: 150000,
      monthlyContribution: 20000,
      currentSavings: 500000,
      inflationRate: 5,
      lifestyle: "moderate",
    },
  });

const router = useRouter();

const onSubmit = async (data: SimulationFormValues) => {
  try {
    const response = await fetch("/api/simulation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    // Save results in localStorage
    localStorage.setItem(
      "simulationResult",
      JSON.stringify(result.data)
    );

    // Redirect to results page
    router.push("/retirement/results");

  } catch (error) {
    console.error("Simulation failed:", error);
  }
};

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6 max-w-3xl mx-auto"
    >

      {/* Personal Details */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <Label>Current Age</Label>
            <Input
              type="number"
              {...form.register("age", { valueAsNumber: true })}
            />
          </div>

          <div>
            <Label>Retirement Age</Label>
            <Input
              type="number"
              {...form.register("retirementAge", {
                valueAsNumber: true,
              })}
            />
          </div>

        </CardContent>
      </Card>


      {/* Financial Details */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Details</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <Label>Monthly Income (MWK)</Label>
            <Input
              type="number"
              {...form.register("monthlyIncome", {
                valueAsNumber: true,
              })}
            />
          </div>

          <div>
            <Label>Monthly Contribution (MWK)</Label>
            <Input
              type="number"
              {...form.register("monthlyContribution", {
                valueAsNumber: true,
              })}
            />
          </div>

          <div className="md:col-span-2">
            <Label>Current Savings (MWK)</Label>
            <Input
              type="number"
              {...form.register("currentSavings", {
                valueAsNumber: true,
              })}
            />
          </div>

        </CardContent>
      </Card>


      {/* Retirement Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Retirement Settings</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <Label>Inflation Rate (%)</Label>
<Input
  type="number"
  step="0.1"
  min="0"
  max="20"
  {...form.register("inflationRate", {
    valueAsNumber: true,
  })}
/>
          </div>

          <div>
            <Label>Lifestyle Preference</Label>

            <Select
              onValueChange={(value) =>
                form.setValue("lifestyle", value as string)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select lifestyle" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="basic">
                  Basic Lifestyle
                </SelectItem>

                <SelectItem value="moderate">
                  Moderate Lifestyle
                </SelectItem>

                <SelectItem value="comfortable">
                  Comfortable Lifestyle
                </SelectItem>
              </SelectContent>
            </Select>

          </div>

        </CardContent>
      </Card>


      {/* Submit Button */}
      <Button type="submit" className="w-full">
        Run Retirement Simulation
      </Button>

    </form>
  );
}