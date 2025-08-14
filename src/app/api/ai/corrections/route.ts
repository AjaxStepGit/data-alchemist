import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
})

export async function POST(request: NextRequest) {
  try {
    const { data, entityType, validationErrors } = await request.json()

    const prompt = `
      You are a data correction expert. Analyze the following data and validation errors, then suggest specific corrections.
      
      Entity Type: ${entityType}
      Data: ${JSON.stringify(data, null, 2)}
      Validation Errors: ${JSON.stringify(validationErrors, null, 2)}
      
      For each error, suggest a specific correction with:
      1. Row index
      2. Field name
      3. Current value
      4. Suggested corrected value
      5. Reason for the correction
      6. Confidence level (0-1)
      
      Return your response as JSON with the structure:
      {
        "corrections": [
          {
            "rowIndex": number,
            "field": "fieldName",
            "currentValue": any,
            "suggestedValue": any,
            "reason": "explanation",
            "confidence": number
          }
        ],
        "summary": "Overall summary of corrections suggested"
      }
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return NextResponse.json(result)
  } catch (error) {
    console.error('AI correction error:', error)
    return NextResponse.json({
      corrections: [],
      summary: 'AI corrections temporarily unavailable'
    })
  }
}

