import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST - Store ML learning data from user comparisons
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { 
      type, // 'comparison', 'scenario_analysis', 'feedback'
      data, 
      userInteractions,
      context 
    } = body

    if (!type || !data) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Store learning data in database
    const learningData = await prisma.mlLearningData.create({
      data: {
        userId: session.user.id,
        type,
        data: data,
        userInteractions: userInteractions || {},
        context: context || {},
        timestamp: new Date()
      }
    })

    // Trigger ML model improvement if enough data collected
    await checkAndTriggerModelUpdate()

    return NextResponse.json({
      success: true,
      data: {
        id: learningData.id,
        message: "Learning data stored successfully"
      }
    })

  } catch (error) {
    console.error("ML LEARNING DATA ERROR:", error)
    return NextResponse.json(
      { success: false, message: "Failed to store learning data" },
      { status: 500 }
    )
  }
}

// GET - Retrieve learning data for model training
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const limit = parseInt(searchParams.get("limit") || "100")
    const offset = parseInt(searchParams.get("offset") || "0")

    const whereClause: any = {}
    if (type) {
      whereClause.type = type
    }

    const learningData = await prisma.mlLearningData.findMany({
      where: whereClause,
      orderBy: { timestamp: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    // Format for ML training
    const formattedData = learningData.map(record => ({
      id: record.id,
      userId: record.userId,
      type: record.type,
      features: extractFeatures(record),
      interactions: record.userInteractions,
      context: record.context,
      timestamp: record.timestamp
    }))

    return NextResponse.json({
      success: true,
      data: {
        learningData: formattedData,
        total: learningData.length,
        message: "Learning data retrieved successfully"
      }
    })

  } catch (error) {
    console.error("ML LEARNING DATA RETRIEVAL ERROR:", error)
    return NextResponse.json(
      { success: false, message: "Failed to retrieve learning data" },
      { status: 500 }
    )
  }
}

// Helper function to extract features for ML training
function extractFeatures(record: any): any {
  const features: any = {
    userDemographics: {},
    simulationFeatures: [],
    comparisonMetrics: {},
    userBehavior: {}
  }

  try {
    // Extract user demographics from context
    if (record.context.userProfile) {
      features.userDemographics = {
        age: record.context.userProfile.age,
        retirementAge: record.context.userProfile.retirementAge,
        incomeLevel: record.context.userProfile.incomeLevel,
        riskTolerance: record.context.userProfile.riskTolerance
      }
    }

    // Extract simulation features
    if (record.data.simulations) {
      features.simulationFeatures = record.data.simulations.map((sim: any) => ({
        age: sim.age,
        retirementAge: sim.retirementAge,
        monthlyIncome: sim.monthlyIncome,
        monthlyContribution: sim.monthlyContribution,
        currentSavings: sim.currentSavings,
        projectedSavings: sim.result?.projectedSavings || 0,
        rsiScore: sim.result?.rsiScore || 0,
        riskScore: sim.result?.riskScore || 0,
        confidenceScore: sim.result?.confidenceScore || 0
      }))
    }

    // Extract comparison metrics
    if (record.data.comparisonResults) {
      features.comparisonMetrics = {
        totalSimulations: record.data.comparisonResults.totalSimulations,
        averageRsiScore: record.data.comparisonResults.averageRsiScore,
        savingsVariance: record.data.comparisonResults.savingsVariance,
        rankings: record.data.comparisonResults.rankings
      }
    }

    // Extract user behavior patterns
    if (record.userInteractions) {
      features.userBehavior = {
        timeSpent: record.userInteractions.timeSpent,
        clicks: record.userInteractions.clicks,
        selectedSimulations: record.userInteractions.selectedSimulations,
        filtersApplied: record.userInteractions.filtersApplied,
        searchQueries: record.userInteractions.searchQueries,
        mlAnalyticsViewed: record.userInteractions.mlAnalyticsViewed,
        recommendationsAccepted: record.userInteractions.recommendationsAccepted
      }
    }

  } catch (error) {
    console.error("Error extracting features:", error)
  }

  return features
}

// Check if we have enough data to trigger model update
async function checkAndTriggerModelUpdate() {
  try {
    const totalRecords = await prisma.mlLearningData.count()
    
    // Trigger update every 100 new records
    if (totalRecords % 100 === 0) {
      console.log(`Triggering ML model update - ${totalRecords} learning records available`)
      
      // Call Python ML backend for retraining
      await triggerModelRetraining()
    }
  } catch (error) {
    console.error("Error checking model update trigger:", error)
  }
}

// Trigger model retraining in Python backend
async function triggerModelRetraining() {
  try {
    const pythonBackendUrl = process.env.ML_BACKEND_URL || "http://localhost:8000"
    
    const response = await fetch(`${pythonBackendUrl}/retrain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        trigger: "learning_data_threshold",
        timestamp: new Date().toISOString()
      })
    })

    if (response.ok) {
      console.log("ML model retraining triggered successfully")
    } else {
      console.error("Failed to trigger ML model retraining")
    }
  } catch (error) {
    console.error("Error triggering model retraining:", error)
  }
}
