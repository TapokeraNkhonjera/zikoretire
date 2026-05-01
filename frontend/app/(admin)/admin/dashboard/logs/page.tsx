"use client";

import LogsOverview from "@/components/sections/AdminDashboard/logs/LogsOverview";
import LogsTable from "@/components/sections/AdminDashboard/logs/LogsTable";

export default function SystemLogsPage() {

  return (

    <div className="space-y-8 pt-8 pl-8 pr-6">

      <LogsOverview />

      <LogsTable />

    </div>

  );

}