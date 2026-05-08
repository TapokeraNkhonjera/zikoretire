import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const totalUsers = await prisma.user.count();
    const totalSimulations = await prisma.simulation.count();
    
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
        activeUsers,
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
