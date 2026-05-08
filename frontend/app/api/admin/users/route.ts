import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const totalUsers = await prisma.user.count();
    
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

    const adminUsers = await prisma.user.count({
      where: {
        role: "ADMIN",
      },
    });

    // Fetch all users with simulation counts
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { simulations: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map to frontend format
    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name || "Anonymous",
      email: user.email,
      role: user.role,
      status: "ACTIVE", // Just hardcode ACTIVE for now as there's no status field in DB
      simulations: user._count.simulations,
      joined: user.createdAt.toISOString().split("T")[0],
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          adminUsers,
        },
        users: formattedUsers,
      },
    });
  } catch (error) {
    console.error("ADMIN USERS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load admin users" },
      { status: 500 }
    );
  }
}
