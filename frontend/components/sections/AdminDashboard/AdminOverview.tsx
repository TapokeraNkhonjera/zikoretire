"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Users,
  Calculator,
  Activity,
  ShieldCheck,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function AdminOverview() {

  return (

    <div className="space-y-8 pt-8 pl-8">

      {/* ===============================
         SECTION: PAGE TITLE
      =============================== */}

      <div>

        <h1 className="text-2xl font-semibold text-foreground">

          System Overview

        </h1>

        <p className="text-sm text-muted-foreground">

          Monitor platform usage, user growth, and system health.

        </p>

      </div>



      {/* ===============================
         SECTION: METRICS GRID
      =============================== */}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

        {/* TOTAL USERS */}

        <Card className="border-muted">

          <CardHeader className="flex flex-row items-center justify-between pb-2">

            <CardTitle className="text-sm font-medium text-muted-foreground">

              Total Users

            </CardTitle>

            <Users className="w-4 h-4 text-primary" />

          </CardHeader>

          <CardContent>

            <div className="text-3xl font-bold text-foreground">

              124

            </div>

            <p className="text-xs text-muted-foreground mt-1">

              +8 new this week

            </p>

          </CardContent>

        </Card>



        {/* TOTAL SIMULATIONS */}

        <Card className="border-muted">

          <CardHeader className="flex flex-row items-center justify-between pb-2">

            <CardTitle className="text-sm font-medium text-muted-foreground">

              Total Simulations

            </CardTitle>

            <Calculator className="w-4 h-4 text-primary" />

          </CardHeader>

          <CardContent>

            <div className="text-3xl font-bold">

              3,542

            </div>

            <p className="text-xs text-muted-foreground mt-1">

              +142 this month

            </p>

          </CardContent>

        </Card>



        {/* ACTIVE USERS */}

        <Card className="border-muted">

          <CardHeader className="flex flex-row items-center justify-between pb-2">

            <CardTitle className="text-sm font-medium text-muted-foreground">

              Active Users

            </CardTitle>

            <Activity className="w-4 h-4 text-primary" />

          </CardHeader>

          <CardContent>

            <div className="text-3xl font-bold">

              38

            </div>

            <p className="text-xs text-muted-foreground mt-1">

              Currently online

            </p>

          </CardContent>

        </Card>



        {/* SYSTEM STATUS */}

        <Card className="border-muted">

          <CardHeader className="flex flex-row items-center justify-between pb-2">

            <CardTitle className="text-sm font-medium text-muted-foreground">

              System Status

            </CardTitle>

            <ShieldCheck className="w-4 h-4 text-green-600" />

          </CardHeader>

          <CardContent>

            <div className="text-lg font-semibold text-green-600">

              Operational

            </div>

            <p className="text-xs text-muted-foreground mt-1">

              All services running

            </p>

          </CardContent>

        </Card>

      </div>



      {/* ===============================
         SECTION: SYSTEM HEALTH
      =============================== */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* SYSTEM HEALTH */}

        <Card>

          <CardHeader>

            <CardTitle>

              System Health

            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-4">

            <div className="flex justify-between text-sm">

              <span className="text-muted-foreground">

                API Response Time

              </span>

              <span className="font-medium">

                124 ms

              </span>

            </div>

            <div className="flex justify-between text-sm">

              <span className="text-muted-foreground">

                Database Load

              </span>

              <span className="font-medium">

                Normal

              </span>

            </div>

            <div className="flex justify-between text-sm">

              <span className="text-muted-foreground">

                Last Backup

              </span>

              <span className="font-medium">

                2 hours ago

              </span>

            </div>

          </CardContent>

        </Card>



        {/* RECENT ACTIVITY */}

        <Card>

          <CardHeader>

            <CardTitle>

              Recent Activity

            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-3 text-sm">

            <div className="flex items-center justify-between">

              <span className="text-muted-foreground">

                New user registered

              </span>

              <Clock className="w-4 h-4 text-primary" />

            </div>

            <div className="flex items-center justify-between">

              <span className="text-muted-foreground">

                Simulation completed

              </span>

              <Clock className="w-4 h-4 text-primary" />

            </div>

            <div className="flex items-center justify-between">

              <span className="text-muted-foreground">

                Backup completed

              </span>

              <Clock className="w-4 h-4 text-primary" />

            </div>

          </CardContent>

        </Card>

      </div>



      {/* ===============================
         SECTION: INSIGHTS
      =============================== */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* GROWTH INSIGHTS */}

        <Card>

          <CardHeader>

            <CardTitle>

              Growth Insights

            </CardTitle>

          </CardHeader>

          <CardContent>

            <div className="flex items-center gap-3">

              <TrendingUp className="w-5 h-5 text-primary" />

              <p className="text-sm text-muted-foreground">

                User adoption is increasing steadily over the last 30 days.

              </p>

            </div>

          </CardContent>

        </Card>



        {/* ADMIN NOTES */}

        <Card>

          <CardHeader>

            <CardTitle>

              Admin Notes

            </CardTitle>

          </CardHeader>

          <CardContent>

            <p className="text-sm text-muted-foreground">

              Ensure weekly database backups remain scheduled and verify audit logs regularly.

            </p>

          </CardContent>

        </Card>

      </div>

    </div>

  );

}