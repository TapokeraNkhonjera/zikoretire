import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Simulation ID is required" },
        { status: 400 }
      )
    }

    const simulation = await prisma.simulation.findUnique({
      where: { id },
      include: {
        result: true
      }
    })

    if (!simulation) {
      return NextResponse.json(
        { success: false, message: "Simulation not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: simulation
    })

  } catch (error) {
    console.error("🔥 GET SIMULATION ERROR:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch simulation", error: String(error) },
      { status: 500 }
    )
  }
}
