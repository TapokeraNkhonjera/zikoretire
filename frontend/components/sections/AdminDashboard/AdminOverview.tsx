"use client";

import { useEffect, useState } from "react";
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

interface OverviewData {
  totalUsers: number;
  totalSimulations: number;
  activeUsers: number;
  mlOnline: boolean;
  mlPoweredSimulations: number;
  fallbackSimulations: number;
  averageModelConfidence: number | null;
  activity: {
    id: string;
    type: string;
    description: string;
    time: string;
  }[];
}

export default function AdminOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch("/api/admin/overview");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch admin overview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return <div className="p-8">Loading overview...</div>;
  }

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
              {data?.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered accounts
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
              {data?.totalSimulations || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed projections
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
              {data?.activeUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active in last 24h
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
            <div className={`text-lg font-semibold ${data?.mlOnline ? "text-green-600" : "text-amber-600"}`}>
              {data?.mlOnline ? "ZikoML Online" : "Fallback Active"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data?.mlOnline ? "ML engine ready" : "ML engine unavailable"}
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
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ML-powered simulations</span>
              <span className="font-medium">{data?.mlPoweredSimulations ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fallback simulations</span>
              <span className="font-medium">{data?.fallbackSimulations ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Average ML confidence</span>
              <span className="font-medium">
                {typeof data?.averageModelConfidence === "number"
                  ? `${(data.averageModelConfidence * 100).toFixed(1)}%`
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* RECENT ACTIVITY */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data?.activity && data.activity.length > 0 ? (
              data.activity.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {item.description}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.time).toLocaleDateString()}
                    </span>
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">No recent activity</div>
            )}
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
            <CardTitle>Growth Insights</CardTitle>
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
            <CardTitle>Admin Notes</CardTitle>
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