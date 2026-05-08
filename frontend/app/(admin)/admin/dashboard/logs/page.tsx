"use client";

import { useEffect, useState } from "react";
import LogsOverview from "@/components/sections/AdminDashboard/logs/LogsOverview";
import LogsTable from "@/components/sections/AdminDashboard/logs/LogsTable";

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

interface LogsData {
  stats: LogsStats;
  logs: Log[];
}

export default function SystemLogsPage() {
  const [data, setData] = useState<LogsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/admin/logs");
        const json = await res.json();
        
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch admin logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return <div className="p-8">Loading system logs...</div>;
  }

  // Fallback defaults if data is somehow empty
  const defaultStats = {
    totalLogsToday: 0,
    warnings: 0,
    successfulTasks: 0,
  };

  return (
    <div className="space-y-8 pt-8 pl-8 pr-6">
      <LogsOverview stats={data?.stats || defaultStats} recentLogs={data?.logs || []} />
      <LogsTable logs={data?.logs || []} />
    </div>
  );
}