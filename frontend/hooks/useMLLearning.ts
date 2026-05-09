import { useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'

interface LearningData {
  type: 'comparison' | 'scenario_analysis' | 'feedback' | 'interaction'
  data: any
  userInteractions: {
    timeSpent: number
    clicks: number
    selectedSimulations: string[]
    filtersApplied: string[]
    searchQueries: string[]
    mlAnalyticsViewed: boolean
    recommendationsAccepted: string[]
  }
  context: {
    userProfile?: any
    sessionInfo?: any
    comparisonMode?: string
    analysisType?: string
    feedbackType?: string
  }
}

export function useMLLearning() {
  const { data: session } = useSession()
  const [isTracking, setIsTracking] = useState(false)
  const sessionStartRef = useRef<number>(Date.now())
  const interactionsRef = useRef({
    clicks: 0,
    selectedSimulations: [] as string[],
    filtersApplied: [] as string[],
    searchQueries: [] as string[],
    mlAnalyticsViewed: false,
    recommendationsAccepted: [] as string[]
  })

  const trackClick = useCallback(() => {
    interactionsRef.current.clicks++
  }, [])

  const trackSimulationSelection = useCallback((simulationIds: string[]) => {
    interactionsRef.current.selectedSimulations = simulationIds
  }, [])

  const trackFilterApplication = useCallback((filter: string) => {
    if (!interactionsRef.current.filtersApplied.includes(filter)) {
      interactionsRef.current.filtersApplied.push(filter)
    }
  }, [])

  const trackSearchQuery = useCallback((query: string) => {
    if (query && !interactionsRef.current.searchQueries.includes(query)) {
      interactionsRef.current.searchQueries.push(query)
    }
  }, [])

  const trackMLAnalyticsViewed = useCallback(() => {
    interactionsRef.current.mlAnalyticsViewed = true
  }, [])

  const trackRecommendationAccepted = useCallback((recommendationId: string) => {
    if (!interactionsRef.current.recommendationsAccepted.includes(recommendationId)) {
      interactionsRef.current.recommendationsAccepted.push(recommendationId)
    }
  }, [])

  const storeLearningData = useCallback(async (learningData: Omit<LearningData, 'userInteractions'>) => {
    if (!session?.user?.id) return

    const timeSpent = Date.now() - sessionStartRef.current
    const userInteractions = {
      ...interactionsRef.current,
      timeSpent
    }

    try {
      const response = await fetch('/api/ml/learning-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: learningData.type,
          data: learningData.data,
          userInteractions,
          context: {
            ...learningData.context,
            sessionInfo: {
              userId: session.user.id,
              timestamp: new Date().toISOString()
            }
          }
        })
      })

      if (response.ok) {
        console.log('ML learning data stored successfully')
      }
    } catch (error) {
      console.error('Error storing ML learning data:', error)
    }
  }, [session])

  const storeComparisonData = useCallback(async (comparisonData: any, selectedSimulations: string[], comparisonMode: string) => {
    await storeLearningData({
      type: 'comparison',
      data: {
        comparisonResults: comparisonData,
        selectedSimulations,
        comparisonMode,
        timestamp: new Date().toISOString()
      },
      context: {
        comparisonMode,
        userProfile: {
          // Add user profile data if available
        }
      }
    })
  }, [storeLearningData])

  const storeScenarioAnalysisData = useCallback(async (scenarioData: any, simulationId: string) => {
    await storeLearningData({
      type: 'scenario_analysis',
      data: {
        scenarioResults: scenarioData,
        simulationId,
        timestamp: new Date().toISOString()
      },
      context: {
        analysisType: 'scenario',
        userProfile: {
          // Add user profile data if available
        }
      }
    })
  }, [storeLearningData])

  const storeFeedbackData = useCallback(async (feedback: {
    rating: number
    comments?: string
    recommendationId?: string
    helpful: boolean
  }) => {
    await storeLearningData({
      type: 'feedback',
      data: {
        feedback,
        timestamp: new Date().toISOString()
      },
      context: {
        feedbackType: 'user_feedback',
        userProfile: {
          // Add user profile data if available
        }
      }
    })
  }, [storeLearningData])

  const startTracking = useCallback(() => {
    setIsTracking(true)
    sessionStartRef.current = Date.now()
    // Reset interactions
    interactionsRef.current = {
      clicks: 0,
      selectedSimulations: [],
      filtersApplied: [],
      searchQueries: [],
      mlAnalyticsViewed: false,
      recommendationsAccepted: []
    }
  }, [])

  const stopTracking = useCallback(() => {
    setIsTracking(false)
  }, [])

  const resetTracking = useCallback(() => {
    sessionStartRef.current = Date.now()
    interactionsRef.current = {
      clicks: 0,
      selectedSimulations: [],
      filtersApplied: [],
      searchQueries: [],
      mlAnalyticsViewed: false,
      recommendationsAccepted: []
    }
  }, [])

  return {
    isTracking,
    trackClick,
    trackSimulationSelection,
    trackFilterApplication,
    trackSearchQuery,
    trackMLAnalyticsViewed,
    trackRecommendationAccepted,
    storeComparisonData,
    storeScenarioAnalysisData,
    storeFeedbackData,
    startTracking,
    stopTracking,
    resetTracking
  }
}
