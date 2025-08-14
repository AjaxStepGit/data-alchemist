// Note: This will only work on the server side or with proper API routes
// For client-side usage, we need to create API routes

export interface AIValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
}

export interface AIRuleResult {
  rule: any;
  explanation: string;
  isValid: boolean;
}

export interface AISearchResult {
  matchedRows: any[];
  explanation: string;
}

export interface AIDataCorrectionResult {
  corrections: Array<{
    rowIndex: number;
    field: string;
    currentValue: any;
    suggestedValue: any;
    reason: string;
    confidence: number;
  }>;
  summary: string;
}

export class AIService {
  
  // AI-powered data validation
  static async validateDataWithAI(data: any[], entityType: string): Promise<AIValidationResult> {
    try {
      const response = await fetch('/api/ai/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: data.slice(0, 10), entityType }),
      });

      if (!response.ok) {
        throw new Error('AI validation request failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('AI validation error:', error);
      return {
        isValid: true,
        errors: [],
        suggestions: ['AI validation temporarily unavailable']
      };
    }
  }

  // Natural language to rules converter
  static async convertNaturalLanguageToRule(
    naturalLanguage: string, 
    data: any
  ): Promise<AIRuleResult> {
    try {
      const response = await fetch('/api/ai/convert-rule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ naturalLanguage, data }),
      });

      if (!response.ok) {
        throw new Error('AI rule conversion request failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('AI rule conversion error:', error);
      return {
        rule: null,
        explanation: 'AI rule conversion temporarily unavailable',
        isValid: false
      };
    }
  }

  // Natural language data search
  static async searchDataWithNaturalLanguage(
    query: string, 
    data: any[], 
    entityType: string
  ): Promise<AISearchResult> {
    try {
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, data, entityType }),
      });

      if (!response.ok) {
        throw new Error('AI search request failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('AI search error:', error);
      return {
        matchedRows: [],
        explanation: 'AI search temporarily unavailable'
      };
    }
  }

  // AI-powered data correction suggestions
  static async suggestDataCorrections(
    data: any[], 
    entityType: string,
    validationErrors: any[]
  ): Promise<AIDataCorrectionResult> {
    try {
      const response = await fetch('/api/ai/corrections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data, entityType, validationErrors }),
      });

      if (!response.ok) {
        throw new Error('AI corrections request failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('AI correction error:', error);
      return {
        corrections: [],
        summary: 'AI corrections temporarily unavailable'
      };
    }
  }

  // AI rule recommendations based on data patterns
  static async recommendRules(data: any): Promise<string[]> {
    try {
      const response = await fetch('/api/ai/recommend-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        throw new Error('AI recommendations request failed');
      }

      const result = await response.json();
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('AI rule recommendation error:', error);
      return ['AI rule recommendations temporarily unavailable'];
    }
  }

  // Smart header mapping for data parsing
  static async mapHeaders(headers: string[], expectedSchema: string[]): Promise<Record<string, string>> {
    try {
      const response = await fetch('/api/ai/map-headers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ headers, expectedSchema }),
      });

      if (!response.ok) {
        throw new Error('AI header mapping request failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('AI header mapping error:', error);
      // Fallback to simple matching
      const mapping: Record<string, string> = {};
      headers.forEach(header => {
        const match = expectedSchema.find(field => 
          field.toLowerCase() === header.toLowerCase() ||
          field.toLowerCase().includes(header.toLowerCase()) ||
          header.toLowerCase().includes(field.toLowerCase())
        );
        if (match) {
          mapping[header] = match;
        }
      });
      return mapping;
    }
  }
}

