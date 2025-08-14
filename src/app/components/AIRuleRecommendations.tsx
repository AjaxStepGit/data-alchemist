'use client'

import { useState, useEffect } from 'react'
import { AIService } from '../lib/aiService'

interface AIRuleRecommendationsProps {
  data: any
  onRuleGenerated: (rule: any) => void
}

export default function AIRuleRecommendations({ data, onRuleGenerated }: AIRuleRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const loadRecommendations = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const result = await AIService.recommendRules(data)
      setRecommendations(result)
    } catch (error) {
      console.error('AI recommendation error:', error)
      setRecommendations(['AI recommendations temporarily unavailable'])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptRecommendation = async (recommendation: string) => {
    try {
      const result = await AIService.convertNaturalLanguageToRule(recommendation, data)
      if (result.isValid && result.rule) {
        onRuleGenerated(result.rule)
        // Remove the accepted recommendation
        setRecommendations(prev => prev.filter(r => r !== recommendation))
      }
    } catch (error) {
      console.error('Error accepting recommendation:', error)
    }
  }

  const dismissRecommendation = (recommendation: string) => {
    setRecommendations(prev => prev.filter(r => r !== recommendation))
  }

  // Auto-load recommendations when data changes
  useEffect(() => {
    const hasData = data.clients?.length > 0 || data.workers?.length > 0 || data.tasks?.length > 0
    if (hasData) {
      const timer = setTimeout(() => {
        loadRecommendations()
      }, 2000) // Wait 2 seconds after data changes
      
      return () => clearTimeout(timer)
    }
  }, [data, loadRecommendations])

  if (!recommendations.length && !isLoading) {
    return null
  }

  return (
    <div className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-indigo-800">💡 AI Rule Recommendations</h3>
        <button
          onClick={loadRecommendations}
          disabled={isLoading}
          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {isLoading ? (
            <div className="flex items-center gap-1">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              Loading...
            </div>
          ) : (
            '🔄 Refresh'
          )}
        </button>
      </div>

      {isLoading && recommendations.length === 0 && (
        <div className="flex items-center gap-2 text-indigo-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
          <span>Analyzing data patterns for rule recommendations...</span>
        </div>
      )}

      <div className="space-y-2">
        {recommendations.map((recommendation, index) => (
          <div key={index} className="bg-white p-3 rounded border border-indigo-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-gray-700 mb-2">
                  {recommendation}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptRecommendation(recommendation)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                  >
                    ✅ Accept
                  </button>
                  <button
                    onClick={() => dismissRecommendation(recommendation)}
                    className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                  >
                    ❌ Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {recommendations.length === 0 && !isLoading && (
        <div className="text-sm text-gray-600 text-center py-2">
          No rule recommendations available. Try uploading more data or refresh to get new suggestions.
        </div>
      )}

      <div className="text-xs text-gray-600 mt-2">
        💡 AI analyzes your data patterns and suggests useful business rules. Accept recommendations to automatically add them to your rules configuration.
      </div>
    </div>
  )
}

