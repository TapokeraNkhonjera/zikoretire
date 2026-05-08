import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const comparisons = await prisma.strategyComparison.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        comparisons,
        total: comparisons.length,
        recent: comparisons.slice(0, 10)
      }
    });
  } catch (error) {
    console.error("ADMIN STRATEGY COMPARISONS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load strategy comparisons" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { comparisonId, action } = body;

    if (action === 'delete' && comparisonId) {
      await prisma.strategyComparison.delete({
        where: { id: comparisonId }
      });

      return NextResponse.json({
        success: true,
        message: "Strategy comparison deleted successfully"
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("ADMIN STRATEGY COMPARISONS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load strategy comparisons" },
      { status: 500 }
    );
  }
}
