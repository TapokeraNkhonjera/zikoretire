import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const {
      userId,
      age,
      retirementAge,
      monthlyIncome,
      monthlyContribution,
      currentSavings,
      growthModel,
    } = data

    /* ================= VALIDATION ================= */

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      )
    }

    if (!age || !retirementAge) {
      return NextResponse.json(
        { success: false, message: "Missing age parameters" },
        { status: 400 }
      )
    }

    /* ================= FIND EXISTING SIMULATION ================= */

    const existingSim = await prisma.simulation.findFirst({
      where: {
        userId,
        age,
        retirementAge,
        monthlyIncome,
        monthlyContribution,
        currentSavings,
        growthModel: growthModel.toUpperCase(),
      },
      select: {
        id: true,
        name: true,
      },
      take: 1,
    })

    if (existingSim) {
      return NextResponse.json({
        success: true,
        data: {
          simulationId: existingSim.id,
          simulationName: existingSim.name,
        }
      })
    }

    return NextResponse.json({
      success: false,
      message: "No existing simulation found with these parameters"
    })

  } catch (error) {
    console.error("🔥 FIND SIMULATION ERROR:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to find simulation",
        error: String(error)
      },
      { status: 500 }
    )
  }
}
