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
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ReportsOverview() {

  return (

    <div className="space-y-8 pt-8 pl-8">

      {/* ======================================
         PAGE TITLE
      ====================================== */}

      <div>

        <h1 className="text-2xl font-semibold text-foreground">

          System Reports

        </h1>

        <p className="text-sm text-muted-foreground">

          Monitor simulations, ML projections, and system performance.

        </p>

      </div>



      {/* ======================================
         SYSTEM PERFORMANCE SUMMARY
      ====================================== */}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

        {/* TOTAL SIMULATIONS */}

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



        {/* DAILY SIMULATIONS */}

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



        {/* ML STATUS */}

        <Card>

          <CardHeader className="flex flex-row items-center justify-between pb-2">

            <CardTitle className="text-sm text-muted-foreground">

              ML API Status

            </CardTitle>

            <Brain className="w-4 h-4 text-green-600" />

          </CardHeader>

          <CardContent>

            <div className="text-lg font-semibold text-green-600">

              Operational

            </div>

            <p className="text-xs text-muted-foreground mt-1">

              Prediction service running

            </p>

          </CardContent>

        </Card>



        {/* SYSTEM HEALTH */}

        <Card>

          <CardHeader className="flex flex-row items-center justify-between pb-2">

            <CardTitle className="text-sm text-muted-foreground">

              System Health

            </CardTitle>

            <ShieldCheck className="w-4 h-4 text-primary" />

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



      {/* ======================================
         PROJECTION SUMMARY
      ====================================== */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* PROJECTION PERFORMANCE */}

        <Card>

          <CardHeader>

            <CardTitle>

              Projection Performance

            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-4 text-sm">

            <div className="flex justify-between">

              <span className="text-muted-foreground">

                Average Projection Value

              </span>

              <span className="font-medium">

                MWK 4,200,000

              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-muted-foreground">

                Highest Projection

              </span>

              <span className="font-medium">

                MWK 12,500,000

              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-muted-foreground">

                Lowest Projection

              </span>

              <span className="font-medium">

                MWK 650,000

              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-muted-foreground">

                Average Confidence Score

              </span>

              <span className="font-medium">

                92%

              </span>

            </div>

          </CardContent>

        </Card>



        {/* ACCURACY SUMMARY */}

        <Card>

          <CardHeader>

            <CardTitle>

              Prediction Accuracy

            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-4 text-sm">

            <div className="flex justify-between">

              <span className="text-muted-foreground">

                Model Accuracy Rate

              </span>

              <span className="font-medium text-green-600">

                94.6%

              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-muted-foreground">

                Failed Predictions

              </span>

              <span className="font-medium">

                3

              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-muted-foreground">

                Retrained Models

              </span>

              <span className="font-medium">

                2

              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-muted-foreground">

                Last Model Update

              </span>

              <span className="font-medium">

                3 days ago

              </span>

            </div>

          </CardContent>

        </Card>

      </div>



      {/* ======================================
         DOWNLOAD REPORTS
      ====================================== */}

      <Card>

        <CardHeader>

          <CardTitle>

            Export System Reports

          </CardTitle>

        </CardHeader>

        <CardContent className="flex flex-wrap gap-4">

          <Button className="flex items-center gap-2">

            <FileDown className="w-4 h-4" />

            Download Simulation Report

          </Button>

          <Button variant="outline" className="flex items-center gap-2">

            <FileDown className="w-4 h-4" />

            Download ML Performance Report

          </Button>

          <Button variant="secondary" className="flex items-center gap-2">

            <FileDown className="w-4 h-4" />

            Download Full System Report

          </Button>

        </CardContent>

      </Card>

    </div>

  );

}