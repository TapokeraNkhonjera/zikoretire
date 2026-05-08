"use client";

import { useEffect, useState } from "react";
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
   MOCK ACCURACY DATA
================================ */
const accuracyData = [
  { month: "Jan", accuracy: 90 },
  { month: "Feb", accuracy: 92 },
  { month: "Mar", accuracy: 94 },
  { month: "Apr", accuracy: 95 },
];

const pieColors = [
  "#1e3a8a", // dark blue
  "#3b82f6", // blue
  "#93c5fd", // light blue
];

interface ReportsData {
  stats: {
    totalSimulations: number;
    todaysSimulations: number;
  };
  chartData: { day: string; simulations: number }[];
  distributionData: { name: string; value: number }[];
}

export default function ReportsOverview() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/admin/reports");
        const json = await res.json();
        
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch admin reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <div className="p-8">Loading reports...</div>;
  }

  return (
    <div className="space-y-8 pt-8 pl-8 pr-6 w-full max-w-[1800px]">
      {/* ===============================
         PAGE TITLE
      =============================== */}
      <div>
        <h1 className="text-2xl font-semibold">System Reports</h1>
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
              {data?.stats.totalSimulations || 0}
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
              {data?.stats.todaysSimulations || 0}
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
            <div className="text-lg font-semibold">Stable</div>
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
            <CardTitle>Daily Simulations (Last 5 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.chartData || []}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="simulations" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* PROJECTION DISTRIBUTION */}
        <Card>
          <CardHeader>
            <CardTitle>Projection Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.distributionData || []}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {(data?.distributionData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
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
            <CardTitle>Prediction Accuracy Trend</CardTitle>
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
          <CardTitle>Export System Reports</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button className="flex gap-2">
            <FileDown className="w-4 h-4" />
            Download Simulation Report
          </Button>
          <Button variant="outline" className="flex gap-2">
            <FileDown className="w-4 h-4" />
            Download ML Performance Report
          </Button>
          <Button variant="secondary" className="flex gap-2">
            <FileDown className="w-4 h-4" />
            Download Full System Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}