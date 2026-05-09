import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get user's priority simulation
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const prioritySimulation = await prisma.simulation.findFirst({
      where: {
        userId: session.user.id,
        priority: true
      },
      include: {
        result: true,
        scenarios: {
          include: {
            result: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: prioritySimulation
    });

  } catch (error) {
    console.error("Error fetching priority simulation:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch priority simulation" },
      { status: 500 }
    );
  }
}

// PUT - Set simulation as priority (ensures only one priority per user)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { simulationId } = await request.json();

    if (!simulationId) {
      return NextResponse.json(
        { success: false, message: "Simulation ID is required" },
        { status: 400 }
      );
    }

    // Verify the simulation belongs to the user
    const simulation = await prisma.simulation.findFirst({
      where: {
        id: simulationId,
        userId: session.user.id
      }
    });

    if (!simulation) {
      return NextResponse.json(
        { success: false, message: "Simulation not found" },
        { status: 404 }
      );
    }

    // Use transaction to ensure only one priority simulation per user
    await prisma.$transaction(async (tx) => {
      // Remove priority from all user's simulations
      await tx.simulation.updateMany({
        where: {
          userId: session.user.id,
          priority: true
        },
        data: {
          priority: false
        }
      });

      // Set priority on the selected simulation
      await tx.simulation.update({
        where: {
          id: simulationId
        },
        data: {
          priority: true
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: "Priority simulation updated successfully"
    });

  } catch (error) {
    console.error("Error updating priority simulation:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update priority simulation" },
      { status: 500 }
    );
  }
}
