import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { simulationId: string } }
) {
  try {
    const { simulationId } = params

    /* ================= VALIDATION ================= */

    if (!simulationId) {
      return NextResponse.json(
        { success: false, message: "Simulation ID is required" },
        { status: 400 }
      )
    }

    /* ================= COUNT SCENARIOS ================= */

    const scenarioCount = await prisma.scenario.count({
      where: {
        simulationId: simulationId
      }
    })

    return NextResponse.json({
      success: true,
      count: scenarioCount
    })

  } catch (error) {
    console.error("🔥 COUNT SCENARIOS ERROR:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to count scenarios",
        error: String(error)
      },
      { status: 500 }
    )
  }
}
