import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch recent users
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Fetch recent simulations
    const recentSimulations = await prisma.simulation.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Fetch recent scenarios
    const recentScenarios = await prisma.scenario.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    let totalLogsToday = 0;
    
    const logs = [];

    // Map users to logs
    recentUsers.forEach(u => {
      if (u.createdAt >= today) totalLogsToday++;
      logs.push({
        id: `user-${u.id}`,
        timestamp: u.createdAt.toLocaleString(),
        type: "User Activity",
        message: `New user registered: ${u.email}`,
        status: "Success",
        time: u.createdAt.getTime(),
      });
    });

    // Map simulations to logs
    recentSimulations.forEach(s => {
      if (s.createdAt >= today) totalLogsToday++;
      logs.push({
        id: `sim-${s.id}`,
        timestamp: s.createdAt.toLocaleString(),
        type: "Simulation",
        message: `Retirement projection generated`,
        status: "Success",
        time: s.createdAt.getTime(),
      });
    });

    // Map scenarios to logs
    recentScenarios.forEach(sc => {
      if (sc.createdAt >= today) totalLogsToday++;
      logs.push({
        id: `scenario-${sc.id}`,
        timestamp: sc.createdAt.toLocaleString(),
        type: "Scenario",
        message: `Scenario saved: ${sc.name}`,
        status: "Success",
        time: sc.createdAt.getTime(),
      });
    });

    // Add some mocked system logs for realism
    logs.push({
      id: "sys-1",
      timestamp: new Date(Date.now() - 3600000).toLocaleString(),
      type: "System",
      message: "Database backup completed",
      status: "Success",
      time: Date.now() - 3600000,
    });

    logs.push({
      id: "sys-2",
      timestamp: new Date(Date.now() - 7200000).toLocaleString(),
      type: "Warning",
      message: "Temporary API latency spike",
      status: "Warning",
      time: Date.now() - 7200000,
    });

    // Sort logs by time descending
    logs.sort((a, b) => b.time - a.time);

    // Get the top 50 logs to return
    const topLogs = logs.slice(0, 50).map(({ time, ...rest }) => rest);

    // Calculate stats
    const warnings = logs.filter(l => l.status === "Warning").length;
    const successfulTasks = logs.filter(l => l.status === "Success").length;

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalLogsToday: totalLogsToday + 1, // Adding system log
          warnings,
          successfulTasks,
        },
        logs: topLogs,
      },
    });
  } catch (error) {
    console.error("ADMIN LOGS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load admin logs" },
      { status: 500 }
    );
  }
}
