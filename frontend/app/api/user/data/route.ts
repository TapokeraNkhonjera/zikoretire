import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth" // Make sure this matches your auth setup

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch all user data
    const simulations = await prisma.simulation.findMany({
      where: { userId },
      include: {
        result: true,
        scenarios: {
          include: {
            result: true
          }
        },
        recommendations: true
      }
    })

    const mlLearningData = await prisma.mLLearningData.findMany({
      where: { userId }
    })

    const strategyComparisons = await prisma.strategyComparison.findMany({
      where: { userId }
    })

    const exportData = {
      version: 1,
      exportDate: new Date().toISOString(),
      user: {
        id: userId,
        email: session.user.email
      },
      simulations,
      mlLearningData,
      strategyComparisons
    }

    return NextResponse.json({ success: true, data: exportData })
  } catch (error) {
    console.error("DATA EXPORT ERROR:", error)
    return NextResponse.json({ success: false, message: "Failed to export data" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Delete in correct order to respect foreign keys (no cascade configured)
    
    // 1. Recommendations
    // Find all simulations & scenarios for the user first
    const userSims = await prisma.simulation.findMany({ where: { userId }, select: { id: true } })
    const userScenarios = await prisma.scenario.findMany({ where: { userId }, select: { id: true } })
    const simIds = userSims.map(s => s.id)
    const scIds = userScenarios.map(s => s.id)

    await prisma.recommendation.deleteMany({
      where: {
        OR: [
          { simulationId: { in: simIds } },
          { scenarioId: { in: scIds } }
        ]
      }
    })

    // 2. Scenario Results
    await prisma.scenarioResult.deleteMany({
      where: { scenarioId: { in: scIds } }
    })

    // 3. Scenarios
    await prisma.scenario.deleteMany({
      where: { userId }
    })

    // 4. Results
    await prisma.result.deleteMany({
      where: { simulationId: { in: simIds } }
    })

    // 5. Simulations
    await prisma.simulation.deleteMany({
      where: { userId }
    })

    // 6. ML Learning Data
    await prisma.mLLearningData.deleteMany({
      where: { userId }
    })

    // 7. Strategy Comparisons
    await prisma.strategyComparison.deleteMany({
      where: { userId }
    })

    return NextResponse.json({ success: true, message: "All data cleared successfully" })
  } catch (error) {
    console.error("DATA CLEAR ERROR:", error)
    return NextResponse.json({ success: false, message: "Failed to clear data" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()

    if (!body || !body.simulations || !Array.isArray(body.simulations)) {
      return NextResponse.json({ success: false, message: "Invalid backup file format" }, { status: 400 })
    }

    let restoredCount = 0

    // Append/merge behavior
    // Loop through simulations and use nested creates to regenerate IDs
    for (const sim of body.simulations) {
      // Exclude relational fields and IDs from the main payload
      const { id, userId: oldUserId, createdAt, result, scenarios, recommendations, ...simData } = sim

      await prisma.simulation.create({
        data: {
          ...simData,
          userId, // Attach to current user
          
          // Recreate result if it exists
          result: result ? {
            create: (() => {
              const { id: rId, simulationId, createdAt: rCreated, ...resultData } = result;
              return resultData;
            })()
          } : undefined,

          // Recreate scenarios if they exist
          scenarios: scenarios && scenarios.length > 0 ? {
            create: scenarios.map((sc: any) => {
              const { id: sId, userId: sUserId, simulationId: sSimId, createdAt: sCreated, result: scResult, recommendations: scRecs, ...scData } = sc;
              return {
                ...scData,
                userId,
                result: scResult ? {
                  create: (() => {
                    const { id: scrId, scenarioId: scrScId, createdAt: scrCreated, ...scrData } = scResult;
                    return scrData;
                  })()
                } : undefined
              }
            })
          } : undefined
        }
      })
      restoredCount++
    }

    // Optionally restore ML data and strategy comparisons if needed
    // But simulations are the core data

    return NextResponse.json({ 
      success: true, 
      message: `Successfully restored ${restoredCount} simulations`,
      restoredCount
    })
  } catch (error) {
    console.error("DATA RESTORE ERROR:", error)
    return NextResponse.json({ success: false, message: "Failed to restore data" }, { status: 500 })
  }
}
