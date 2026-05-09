import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Generate training data for ML model retraining
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
    const dataType = searchParams.get("type") || "all" // "comparison", "scenarios", "feedback", "all"
    const format = searchParams.get("format") || "json" // "json", "csv"
    const limit = parseInt(searchParams.get("limit") || "1000")

    // Fetch learning data
    const whereClause: any = {}
    if (dataType !== "all") {
      whereClause.type = dataType
    }

    const learningData = await prisma.mlLearningData.findMany({
      where: whereClause,
      orderBy: { timestamp: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    // Process and format training data
    const trainingData = await processTrainingData(learningData, dataType)

    if (format === "csv") {
      // Convert to CSV format
      const csv = convertToCSV(trainingData)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="ml-training-data-${dataType}-${Date.now()}.csv"`
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        trainingData,
        summary: generateDataSummary(trainingData),
        metadata: {
          totalRecords: trainingData.length,
          dataType,
          generatedAt: new Date().toISOString(),
          features: extractFeatureNames(trainingData)
        }
      }
    })

  } catch (error) {
    console.error("TRAINING DATA GENERATION ERROR:", error)
    return NextResponse.json(
      { success: false, message: "Failed to generate training data" },
      { status: 500 }
    )
  }
}

// POST - Trigger model retraining with new data
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
      triggerType = "manual", // "manual", "scheduled", "threshold"
      trainingConfig = {}
    } = body

    // Generate training data
    const learningData = await prisma.mlLearningData.findMany({
      orderBy: { timestamp: "desc" },
      take: 1000,
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    const trainingData = await processTrainingData(learningData, "all")

    // Send training data to Python ML backend
    const pythonBackendUrl = process.env.ML_BACKEND_URL || "http://localhost:8000"
    
    const response = await fetch(`${pythonBackendUrl}/retrain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        trainingData,
        config: trainingConfig,
        triggerType,
        timestamp: new Date().toISOString(),
        metadata: {
          totalRecords: trainingData.length,
          triggerUserId: session.user.id
        }
      })
    })

    if (response.ok) {
      const result = await response.json()
      
      // Log the retraining event
      await prisma.mlRetrainingLog.create({
        data: {
          triggerType,
          recordCount: trainingData.length,
          status: "started",
          triggeredBy: session.user.id,
          config: trainingConfig,
          startedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          retrainingId: result.retrainingId,
          status: "started",
          estimatedDuration: result.estimatedDuration,
          message: "ML model retraining initiated successfully"
        }
      })
    } else {
      throw new Error("Failed to trigger ML model retraining")
    }

  } catch (error) {
    console.error("MODEL RETRAINING ERROR:", error)
    return NextResponse.json(
      { success: false, message: "Failed to trigger model retraining" },
      { status: 500 }
    )
  }
}

async function processTrainingData(learningData: any[], dataType: string) {
  return learningData.map(record => {
    const features: any = {}
    
    // Extract user demographics
    if (record.context?.userProfile) {
      features.userAge = record.context.userProfile.age
      features.userRetirementAge = record.context.userProfile.retirementAge
      features.userIncomeLevel = record.context.userProfile.incomeLevel
      features.userRiskTolerance = record.context.userProfile.riskTolerance
    }

    // Extract simulation features
    if (record.data?.simulations) {
      const sims = record.data.simulations
      features.simulationCount = sims.length
      features.avgProjectedSavings = sims.reduce((sum: number, sim: any) => 
        sum + (sim.result?.projectedSavings || 0), 0) / sims.length
      features.avgRsiScore = sims.reduce((sum: number, sim: any) => 
        sum + (sim.result?.rsiScore || 0), 0) / sims.length
      features.avgRiskScore = sims.reduce((sum: number, sim: any) => 
        sum + (sim.result?.riskScore || 0), 0) / sims.length
    }

    // Extract comparison metrics
    if (record.data?.comparisonResults) {
      const comparison = record.data.comparisonResults
      features.totalSimulations = comparison.totalSimulations
      features.averageRsiScore = comparison.averageRsiScore
      features.savingsVariance = comparison.savingsVariance
    }

    // Extract user behavior
    if (record.userInteractions) {
      const interactions = record.userInteractions
      features.timeSpent = interactions.timeSpent
      features.clickCount = interactions.clicks
      features.selectedSimulationCount = interactions.selectedSimulations?.length || 0
      features.filterCount = interactions.filtersApplied?.length || 0
      features.searchCount = interactions.searchQueries?.length || 0
      features.mlAnalyticsViewed = interactions.mlAnalyticsViewed ? 1 : 0
      features.recommendationsAccepted = interactions.recommendationsAccepted?.length || 0
    }

    // Extract feedback if available
    if (record.data?.feedback) {
      features.feedbackRating = record.data.feedback.rating
      features.feedbackHelpful = record.data.feedback.helpful ? 1 : 0
      features.hasComments = record.data.feedback.comments ? 1 : 0
    }

    // Labels for supervised learning
    const labels: any = {}
    
    // Success indicators
    if (record.data?.comparisonResults?.rankings) {
      const rankings = record.data.comparisonResults.rankings
      labels.bestPerformer = rankings.highestProjectedSavings?.simulation || ""
      labels.worstPerformer = rankings.lowestProjectedSavings?.simulation || ""
    }

    // User satisfaction
    if (record.data?.feedback) {
      labels.userSatisfaction = record.data.feedback.rating
      labels.foundHelpful = record.data.feedback.helpful
    }

    return {
      id: record.id,
      userId: record.userId,
      type: record.type,
      timestamp: record.timestamp,
      features,
      labels,
      rawData: record.data
    }
  })
}

function generateDataSummary(trainingData: any[]) {
  const summary = {
    totalRecords: trainingData.length,
    types: {} as Record<string, number>,
    averageFeatures: {} as Record<string, number>,
    featureDistribution: {} as Record<string, any>,
    labelDistribution: {} as Record<string, any>
  }

  // Count by type
  trainingData.forEach(record => {
    summary.types[record.type] = (summary.types[record.type] || 0) + 1
  })

  // Calculate feature averages
  const featureKeys = Object.keys(trainingData[0]?.features || {})
  featureKeys.forEach(key => {
    const values = trainingData
      .map(record => record.features[key])
      .filter(val => typeof val === 'number')
    if (values.length > 0) {
      summary.averageFeatures[key] = values.reduce((sum, val) => sum + val, 0) / values.length
    }
  })

  // Feature distribution
  featureKeys.forEach(key => {
    const values = trainingData.map(record => record.features[key])
    const distribution = values.reduce((dist, val) => {
      const bucket = typeof val === 'number' ? 
        Math.floor(val * 10) / 10 : 
        String(val)
      dist[bucket] = (dist[bucket] || 0) + 1
      return dist
    }, {} as Record<string, number>)
    summary.featureDistribution[key] = distribution
  })

  // Label distribution
  const labelKeys = trainingData.some(record => record.labels) ? 
    Object.keys(trainingData.find(record => record.labels)?.labels || {}) : []
  
  labelKeys.forEach(key => {
    const values = trainingData
      .filter(record => record.labels[key])
      .map(record => record.labels[key])
    const distribution = values.reduce((dist, val) => {
      dist[val] = (dist[val] || 0) + 1
      return dist
    }, {} as Record<string, number>)
    summary.labelDistribution[key] = distribution
  })

  return summary
}

function extractFeatureNames(trainingData: any[]) {
  if (trainingData.length === 0) return []
  
  const allFeatures = new Set<string>()
  trainingData.forEach(record => {
    Object.keys(record.features || {}).forEach(feature => {
      allFeatures.add(feature)
    })
  })
  
  return Array.from(allFeatures).sort()
}

function convertToCSV(trainingData: any[]) {
  if (trainingData.length === 0) return ""

  const headers = [
    "id",
    "userId", 
    "type",
    "timestamp",
    ...extractFeatureNames(trainingData),
    "feedbackRating",
    "feedbackHelpful"
  ]

  const csvRows = [headers.join(",")]

  trainingData.forEach(record => {
    const row = headers.map(header => {
      let value = record[header]
      
      if (header === "features") {
        value = JSON.stringify(record.features)
      } else if (header === "labels") {
        value = JSON.stringify(record.labels)
      } else if (typeof value === "string" && value.includes(",")) {
        value = `"${value.replace(/"/g, '""')}"`
      } else if (value === null || value === undefined) {
        value = ""
      }
      
      return value
    })
    csvRows.push(row.join(","))
  })

  return csvRows.join("\n")
}
