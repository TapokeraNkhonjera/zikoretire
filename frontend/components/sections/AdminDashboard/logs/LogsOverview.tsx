"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Database,
  Clock,
} from "lucide-react";

interface LogsStats {
  totalLogsToday: number;
  warnings: number;
  successfulTasks: number;
}

interface Log {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  status: string;
}

interface LogsOverviewProps {
  stats: LogsStats;
  recentLogs: Log[];
}

export default function LogsOverview({ stats, recentLogs }: LogsOverviewProps) {
  return (
    <div className="space-y-8">
      {/* ===============================
         PAGE TITLE
      =============================== */}
      <div>
        <h1 className="text-2xl font-semibold">System Logs</h1>
        <p className="text-sm text-muted-foreground">
          Monitor system activities, warnings, and operational events.
        </p>
      </div>

      {/* ===============================
         SUMMARY CARDS
      =============================== */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Logs Today
            </CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalLogsToday}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              System events recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Warnings
            </CardTitle>
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.warnings}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Minor alerts detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Successful Tasks
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.successfulTasks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Database Status
            </CardTitle>
            <Database className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-blue-600">
              Connected
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All services active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ===============================
         HEALTH + RECENT EVENTS
      =============================== */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* SYSTEM HEALTH */}
        <Card>
          <CardHeader>
            <CardTitle>Log System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Log Write Speed</span>
              <span className="font-medium">98 ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Storage Usage</span>
              <span className="font-medium">64%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Cleanup</span>
              <span className="font-medium">6 hours ago</span>
            </div>
          </CardContent>
        </Card>

        {/* RECENT EVENTS */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {recentLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="flex justify-between items-center">
                <span className="text-muted-foreground line-clamp-1 mr-4">
                  {log.message}
                </span>
                <Clock className="w-4 h-4 text-primary shrink-0" />
              </div>
            ))}
            {recentLogs.length === 0 && (
              <div className="text-muted-foreground">No recent events</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}