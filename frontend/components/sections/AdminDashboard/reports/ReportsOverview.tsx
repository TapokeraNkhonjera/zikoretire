"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  BarChart3,
  Brain,
  Activity,
  FileDown,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ================================
   MOCK DATA
================================ */

const simulationData = [
  { day: "Mon", simulations: 40 },
  { day: "Tue", simulations: 55 },
  { day: "Wed", simulations: 70 },
  { day: "Thu", simulations: 62 },
  { day: "Fri", simulations: 85 },
];

const accuracyData = [
  { month: "Jan", accuracy: 90 },
  { month: "Feb", accuracy: 92 },
  { month: "Mar", accuracy: 94 },
  { month: "Apr", accuracy: 95 },
];

const projectionDistribution = [
  { name: "Low", value: 30 },
  { name: "Medium", value: 50 },
  { name: "High", value: 20 },
];

/* Brand Shades */

const pieColors = [
  "#1e3a8a", // dark blue
  "#3b82f6", // blue
  "#93c5fd", // light blue
];

export default function ReportsOverview() {

  return (

    <div className="space-y-8 pt-8 pl-8 pr-6 w-full max-w-[1800px]">

      {/* ===============================
         PAGE TITLE
      =============================== */}

      <div>

        <h1 className="text-2xl font-semibold">

          System Reports

        </h1>

        <p className="text-sm text-muted-foreground">

          Monitor simulations, ML projections, and prediction accuracy.

        </p>

      </div>

      {/* ===============================
         METRIC CARDS
      =============================== */}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

        <Card>

          <CardHeader className="flex flex-row items-center justify-between pb-2">

            <CardTitle className="text-sm text-muted-foreground">

              Total Simulations

            </CardTitle>

            <BarChart3 className="w-4 h-4 text-primary" />

          </CardHeader>

          <CardContent>

            <div className="text-3xl font-bold">

              3,542

            </div>

            <p className="text-xs text-muted-foreground mt-1">

              Completed projections

            </p>

          </CardContent>

        </Card>

        <Card>

          <CardHeader className="flex flex-row items-center justify-between pb-2">

            <CardTitle className="text-sm text-muted-foreground">

              Today&apos;s Simulations

            </CardTitle>

            <Activity className="w-4 h-4 text-primary" />

          </CardHeader>

          <CardContent>

            <div className="text-3xl font-bold">

              82

            </div>

            <p className="text-xs text-muted-foreground mt-1">

              Generated today

            </p>

          </CardContent>

        </Card>

        <Card>

          <CardHeader className="flex flex-row items-center justify-between pb-2">

            <CardTitle className="text-sm text-muted-foreground">

              ML API Status

            </CardTitle>

            <Brain className="w-4 h-4 text-blue-600" />

          </CardHeader>

          <CardContent>

            <div className="text-lg font-semibold text-blue-600">

              Operational

            </div>

            <p className="text-xs text-muted-foreground mt-1">

              Prediction service running

            </p>

          </CardContent>

        </Card>

        <Card>

          <CardHeader className="flex flex-row items-center justify-between pb-2">

            <CardTitle className="text-sm text-muted-foreground">

              System Health

            </CardTitle>

            <ShieldCheck className="w-4 h-4 text-black" />

          </CardHeader>

          <CardContent>

            <div className="text-lg font-semibold">

              Stable

            </div>

            <p className="text-xs text-muted-foreground mt-1">

              No detected failures

            </p>

          </CardContent>

        </Card>

      </div>

      {/* ===============================
         CHART SECTION
      =============================== */}

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">

        {/* DAILY SIMULATIONS */}

        <Card className="xl:col-span-2">

          <CardHeader>

            <CardTitle>

              Daily Simulations

            </CardTitle>

          </CardHeader>

          <CardContent className="h-[300px]">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart data={simulationData}>

                <XAxis dataKey="day" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="simulations"
                  fill="#3b82f6"
                />

              </BarChart>

            </ResponsiveContainer>

          </CardContent>

        </Card>

        {/* PROJECTION DISTRIBUTION */}

        <Card>

          <CardHeader>

            <CardTitle>

              Projection Distribution

            </CardTitle>

          </CardHeader>

          <CardContent className="h-[300px]">

            <ResponsiveContainer width="100%" height="100%">

              <PieChart>

                <Pie
                  data={projectionDistribution}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >

                  {projectionDistribution.map((entry, index) => (

                    <Cell
                      key={`cell-${index}`}
                      fill={pieColors[index]}
                    />

                  ))}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </CardContent>

        </Card>

        {/* ACCURACY TREND */}

        <Card className="xl:col-span-3">

          <CardHeader>

            <CardTitle>

              Prediction Accuracy Trend

            </CardTitle>

          </CardHeader>

          <CardContent className="h-[300px]">

            <ResponsiveContainer width="100%" height="100%">

              <LineChart data={accuracyData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#1e3a8a"
                  strokeWidth={3}
                />

              </LineChart>

            </ResponsiveContainer>

          </CardContent>

        </Card>

      </div>

      {/* ===============================
         EXPORT REPORTS
      =============================== */}

      <Card>

        <CardHeader>

          <CardTitle>

            Export System Reports

          </CardTitle>

        </CardHeader>

        <CardContent className="flex flex-wrap gap-4">

          <Button className="flex gap-2">

            <FileDown className="w-4 h-4" />

            Download Simulation Report

          </Button>

          <Button
            variant="outline"
            className="flex gap-2"
          >

            <FileDown className="w-4 h-4" />

            Download ML Performance Report

          </Button>

          <Button
            variant="secondary"
            className="flex gap-2"
          >

            <FileDown className="w-4 h-4" />

            Download Full System Report

          </Button>

        </CardContent>

      </Card>

    </div>

  );

}