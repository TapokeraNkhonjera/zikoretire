"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react"
import { useMLLearning } from "@/hooks/useMLLearning"

interface MLFeedbackProps {
  analysisType: "comparison" | "scenarios" | "ml_scenarios" | "ml_comparison"
  analysisData?: any
  onFeedbackSubmitted?: () => void
}

export default function MLFeedback({ analysisType, analysisData, onFeedbackSubmitted }: MLFeedbackProps) {
  const [rating, setRating] = useState<number>(0)
  const [helpful, setHelpful] = useState<boolean | null>(null)
  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { storeFeedbackData } = useMLLearning()

  const handleSubmit = async () => {
    if (rating === 0 && helpful === null && !comments.trim()) {
      return // Require at least some feedback
    }

    setIsSubmitting(true)
    try {
      await storeFeedbackData({
        rating,
        comments: comments.trim() || undefined,
        recommendationId: analysisData?.summary?.confidenceLevel ? `ml_${analysisType}_${Date.now()}` : undefined,
        helpful: helpful !== null ? helpful : false
      })

      setSubmitted(true)
      onFeedbackSubmitted?.()
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false)
        setRating(0)
        setHelpful(null)
        setComments("")
      }, 3000)
    } catch (error) {
      console.error("Error submitting feedback:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <div className="text-green-600 font-medium">Thank you for your feedback!</div>
          <div className="text-sm text-muted-foreground mt-1">
            This helps improve our ML models for better recommendations.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          Help Improve Our ML Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Your feedback helps us improve the accuracy and relevance of our ML-powered insights.
        </div>

        {/* Rating */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            How accurate were the ML insights?
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Helpful */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Were these insights helpful for your retirement planning?
          </label>
          <div className="flex gap-3">
            <Button
              variant={helpful === true ? "default" : "outline"}
              size="sm"
              onClick={() => setHelpful(true)}
              className="flex items-center gap-2"
            >
              <ThumbsUp className="h-4 w-4" />
              Yes
            </Button>
            <Button
              variant={helpful === false ? "default" : "outline"}
              size="sm"
              onClick={() => setHelpful(false)}
              className="flex items-center gap-2"
            >
              <ThumbsDown className="h-4 w-4" />
              No
            </Button>
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Additional comments (optional)
          </label>
          <Textarea
            placeholder="What did you find most or least helpful? Any suggestions for improvement?"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
          />
        </div>

        {/* Analysis Context */}
        {analysisData && (
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Analysis Type: <Badge variant="secondary">{analysisType.replace('ml_', '').replace('_', ' ')}</Badge></div>
            <div>ML Confidence: {(analysisData.summary?.confidenceLevel * 100 || 0).toFixed(1)}%</div>
            {analysisData.insights?.performanceClusters && (
              <div>Clusters Identified: {Object.keys(analysisData.insights.performanceClusters.distribution).length}</div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || (rating === 0 && helpful === null && !comments.trim())}
          className="w-full"
        >
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          This feedback will be used to improve future ML model training.
        </div>
      </CardContent>
    </Card>
  )
}
