import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MLBACKEND_URL = process.env.MLBACKEND_URL || "http://127.0.0.1:8000";

export async function GET(req: Request) {
  try {
    const totalUsers = await prisma.user.count();
    const totalSimulations = await prisma.simulation.count();
    const totalScenarios = await prisma.scenario.count();
    const totalStrategyComparisons = await prisma.strategyComparison.count();
    
    // Active users: users updated in the last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    const mlPoweredSimulations = await prisma.result.count({
      where: {
        confidenceScore: {
          not: null,
        },
      },
    });

    const fallbackSimulations = await prisma.result.count({
      where: {
        confidenceScore: null,
      },
    });

    // New ML outputs metrics
    const mlReadinessScores = await prisma.result.count({
      where: {
        readinessScore: {
          not: null,
        },
      },
    });

    const mlConsistencyScores = await prisma.result.count({
      where: {
        consistencyScore: {
          not: null,
        },
      },
    });

    const mlVolatilityScores = await prisma.result.count({
      where: {
        volatilityScore: {
          not: null,
        },
      },
    });

    const mlSustainabilityScores = await prisma.result.count({
      where: {
        sustainabilityScore: {
          not: null,
        },
      },
    });

    const mlInflationVulnerabilityScores = await prisma.result.count({
      where: {
        inflationVulnerability: {
          not: null,
        },
      },
    });

    const avgModelConfidence = await prisma.result.aggregate({
      _avg: {
        confidenceScore: true,
      },
      where: {
        confidenceScore: {
          not: null,
        },
      },
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

    // Recent activity: Combine recent users and recent simulations
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, name: true, createdAt: true },
    });

    const recentSimulations = await prisma.simulation.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, createdAt: true, user: { select: { name: true } } },
    });

    // Map and sort combined activity
    const activity = [
      ...recentUsers.map((u) => ({
        id: `user-${u.id}`,
        type: "USER_REGISTERED",
        description: `New user registered: ${u.name || "Anonymous"}`,
        time: u.createdAt,
      })),
      ...recentSimulations.map((s) => ({
        id: `sim-${s.id}`,
        type: "SIMULATION_COMPLETED",
        description: `Simulation completed by ${s.user?.name || "Anonymous"}`,
        time: s.createdAt,
      })),
    ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 4);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalSimulations,
        totalScenarios,
        totalStrategyComparisons,
        activeUsers,
        mlOnline,
        mlPoweredSimulations,
        fallbackSimulations,
        averageModelConfidence: avgModelConfidence._avg.confidenceScore ?? null,
        mlReadinessScores,
        mlConsistencyScores,
        mlVolatilityScores,
        mlSustainabilityScores,
        mlInflationVulnerabilityScores,
        activity,
      },
    });
  } catch (error) {
    console.error("ADMIN OVERVIEW ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load admin overview" },
      { status: 500 }
    );
  }
}
