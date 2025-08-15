'use client'

import { useState } from 'react'
import { AIService } from '../lib/aiService'

interface AIRulesConverterProps {
  data: any
  onRuleGenerated: (rule: any) => void
}

export default function AIRulesConverter({ data, onRuleGenerated }: AIRulesConverterProps) {
  const [naturalLanguage, setNaturalLanguage] = useState('')
  const [isConverting, setIsConverting] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  const handleConvert = async () => {
    if (!naturalLanguage.trim() || isConverting) return

    setIsConverting(true)
    try {
      const result = await AIService.convertNaturalLanguageToRule(naturalLanguage, data)
      setLastResult(result)
      
      if (result.isValid && result.rule) {
        // Don't automatically add the rule, let user review it first
      }
    } catch (error) {
      console.error('Rule conversion error:', error)
      setLastResult({
        isValid: false,
        explanation: 'Rule conversion failed. Please try again.',
        rule: null
      })
    } finally {
      setIsConverting(false)
    }
  }

  const handleAddRule = () => {
    if (lastResult?.isValid && lastResult.rule) {
      onRuleGenerated(lastResult.rule)
      setNaturalLanguage('')
      setLastResult(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleConvert()
    }
  }

  const placeholderText = `Describe a rule in plain English (e.g., "Tasks T001 and T002 should always run together" or "Workers in Sales group should have maximum 3 slots per phase")`


  return (
    <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
      <h3 className="text-lg font-semibold mb-2 text-green-800">🤖 AI Rules Converter</h3>
      
      <div className="mb-3">
        <textarea
          value={naturalLanguage}
          onChange={(e) => setNaturalLanguage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholderText}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          rows={3}
          disabled={isConverting}
        />
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={handleConvert}
          disabled={isConverting || !naturalLanguage.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isConverting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Converting...
            </div>
          ) : (
            '🔄 Convert to Rule'
          )}
        </button>
      </div>

      {lastResult && (
        <div className={`p-3 rounded-md ${lastResult.isValid ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
          <div className="mb-2">
            <strong>Explanation:</strong> {lastResult.explanation}
          </div>
          
          {lastResult.isValid && lastResult.rule && (
            <>
              <div className="mb-2">
                <strong>Generated Rule:</strong>
                <pre className="bg-gray-100 p-2 rounded text-sm mt-1 overflow-x-auto">
                  {JSON.stringify(lastResult.rule, null, 2)}
                </pre>
              </div>
              <button
                onClick={handleAddRule}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                ✅ Add This Rule
              </button>
            </>
          )}
        </div>
      )}

      <div className="text-xs text-gray-600 mt-2">
        💡 Examples: &quot;Tasks with ID T001 and T002 should run together&quot;, &quot;Sales workers maximum 5 slots per phase&quot;, &quot;Engineering group needs at least 3 common slots&quot;
      </div>
    </div>
  )
}

