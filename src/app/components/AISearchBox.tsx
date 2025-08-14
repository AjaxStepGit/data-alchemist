
'use client'

import { useState } from 'react'
import { AIService } from '../lib/aiService'

interface AISearchBoxProps {
  data: any[]
  entityType: string
  onSearchResults: (results: any[], explanation: string) => void
}

export default function AISearchBox({ data, entityType, onSearchResults }: AISearchBoxProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [lastExplanation, setLastExplanation] = useState('')

  const handleSearch = async () => {
    if (!query.trim() || isSearching) return

    setIsSearching(true)
    try {
      const result = await AIService.searchDataWithNaturalLanguage(query, data, entityType)
      onSearchResults(result.matchedRows, result.explanation)
      setLastExplanation(result.explanation)
    } catch (error) {
      console.error('Search error:', error)
      onSearchResults([], 'Search failed. Please try again.')
      setLastExplanation('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setQuery('')
    onSearchResults(data, '')
    setLastExplanation('')
  }

  return (
    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={"Search ${entityType} with natural language (e.g., \"tasks with duration more than 2 phases\")"}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSearching}
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSearching ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Searching...
            </div>
          ) : (
            '🔍 AI Search'
          )}
        </button>
        {query && (
          <button
            onClick={clearSearch}
            className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Clear
          </button>
        )}
      </div>
      
      {lastExplanation && (
        <div className="text-sm text-blue-700 bg-blue-100 p-2 rounded">
          <strong>Search explanation:</strong> {lastExplanation}
        </div>
      )}
      
      <div className="text-xs text-gray-600 mt-1">
        💡 Try queries like: "high priority clients", "workers with Python skills", "tasks requiring more than 3 phases"
      </div>
    </div>
  )
}


