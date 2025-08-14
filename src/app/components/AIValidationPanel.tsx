
'use client'

import { useState, useEffect } from 'react'
import { AIService } from '../lib/aiService'

interface AIValidationPanelProps {
  data: any[]
  entityType: string
  validationErrors: any[]
}

export default function AIValidationPanel({ data, entityType, validationErrors }: AIValidationPanelProps) {
  const [aiValidation, setAiValidation] = useState<any>(null)
  const [corrections, setCorrections] = useState<any>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isGeneratingCorrections, setIsGeneratingCorrections] = useState(false)

  const runAIValidation = async () => {
    if (!data.length || isValidating) return

    setIsValidating(true)
    try {
      const result = await AIService.validateDataWithAI(data, entityType)
      setAiValidation(result)
    } catch (error) {
      console.error('AI validation error:', error)
      setAiValidation({
        isValid: true,
        errors: [],
        suggestions: ['AI validation temporarily unavailable']
      })
    } finally {
      setIsValidating(false)
    }
  }

  const generateCorrections = async () => {
    if (!data.length || !validationErrors.length || isGeneratingCorrections) return

    setIsGeneratingCorrections(true)
    try {
      const result = await AIService.suggestDataCorrections(data, entityType, validationErrors)
      setCorrections(result)
    } catch (error) {
      console.error('AI correction error:', error)
      setCorrections({
        corrections: [],
        summary: 'AI corrections temporarily unavailable'
      })
    } finally {
      setIsGeneratingCorrections(false)
    }
  }

  // Auto-run AI validation when data changes
  useEffect(() => {
    if (data.length > 0) {
      const timer = setTimeout(() => {
        runAIValidation()
      }, 1000) // Debounce for 1 second
      
      return () => clearTimeout(timer)
    }
  }, [data, runAIValidation])

  if (!data.length) {
    return null
  }

  return (
    <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
      <h3 className="text-lg font-semibold mb-3 text-purple-800">🧠 AI Validation & Corrections</h3>
      
      <div className="flex gap-2 mb-3">
        <button
          onClick={runAIValidation}
          disabled={isValidating}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isValidating ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Validating...
            </div>
          ) : (
            '🔍 Run AI Validation'
          )}
        </button>

        {validationErrors.length > 0 && (
          <button
            onClick={generateCorrections}
            disabled={isGeneratingCorrections}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isGeneratingCorrections ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </div>
            ) : (
              '🔧 Suggest Corrections'
            )}
          </button>
        )}
      </div>

      {aiValidation && (
        <div className={`mb-3 p-3 rounded-md ${aiValidation.isValid ? 'bg-green-100 border border-green-300' : 'bg-yellow-100 border border-yellow-300'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-lg ${aiValidation.isValid ? 'text-green-600' : 'text-yellow-600'}`}>
              {aiValidation.isValid ? '✅' : '⚠️'}
            </span>
            <strong>AI Validation Result:</strong>
            <span className={aiValidation.isValid ? 'text-green-700' : 'text-yellow-700'}>
              {aiValidation.isValid ? 'Data looks good!' : 'Issues detected'}
            </span>
          </div>

          {aiValidation.errors.length > 0 && (
            <div className="mb-2">
              <strong>AI-detected errors:</strong>
              <ul className="list-disc list-inside text-sm mt-1">
                {aiValidation.errors.map((error: string, index: number) => (
                  <li key={index} className="text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {aiValidation.suggestions.length > 0 && (
            <div>
              <strong>AI suggestions:</strong>
              <ul className="list-disc list-inside text-sm mt-1">
                {aiValidation.suggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="text-blue-700">{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {corrections && (
        <div className="p-3 bg-orange-100 border border-orange-300 rounded-md">
          <h4 className="font-semibold mb-2 text-orange-800">🔧 AI Correction Suggestions</h4>
          
          <div className="mb-3 text-sm text-orange-700">
            <strong>Summary:</strong> {corrections.summary}
          </div>

          {corrections.corrections.length > 0 ? (
            <div className="space-y-2">
              {corrections.corrections.map((correction: any, index: number) => (
                <div key={index} className="bg-white p-2 rounded border border-orange-200">
                  <div className="text-sm">
                    <strong>Row {correction.rowIndex + 1}, Field "{correction.field}":</strong>
                  </div>
                  <div className="text-sm text-gray-600">
                    Current: <code className="bg-gray-100 px-1 rounded">{JSON.stringify(correction.currentValue)}</code>
                  </div>
                  <div className="text-sm text-green-600">
                    Suggested: <code className="bg-green-100 px-1 rounded">{JSON.stringify(correction.suggestedValue)}</code>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Reason: {correction.reason} (Confidence: {Math.round(correction.confidence * 100)}%)
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-600">No specific corrections suggested.</div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-600 mt-2">
        💡 AI validation runs automatically when data changes. Use AI corrections to get specific suggestions for fixing validation errors.
      </div>
    </div>
  )
}


