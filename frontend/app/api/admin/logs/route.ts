import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MLBACKEND_URL = process.env.MLBACKEND_URL || "http://127.0.0.1:8000";

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
      include: {
        result: true,
      },
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
      const mlUsed = typeof s.result?.confidenceScore === "number";
      logs.push({
        id: `sim-${s.id}`,
        timestamp: s.createdAt.toLocaleString(),
        type: mlUsed ? "ML Simulation" : "Fallback Simulation",
        message: mlUsed
          ? `ML projection generated (${(s.result!.confidenceScore! * 100).toFixed(1)}% confidence)`
          : "Projection generated using fallback engine",
        status: mlUsed ? "Success" : "Warning",
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

    let mlOnline = false;
    try {
      const mlHealth = await fetch(`${MLBACKEND_URL}/api/health/ready`, {
        method: "GET",
        cache: "no-store",
      });
      mlOnline = mlHealth.ok;
    } catch {
      mlOnline = false;
    }

    logs.push({
      id: "sys-1",
      timestamp: new Date().toLocaleString(),
      type: "ML Health",
      message: mlOnline ? "ZikoML health check passed" : "ZikoML unavailable; fallback mode in effect",
      status: mlOnline ? "Success" : "Warning",
      time: Date.now(),
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
