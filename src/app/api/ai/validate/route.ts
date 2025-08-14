import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
})

export async function POST(request: NextRequest) {
  try {
    const { data, entityType } = await request.json()

    const prompt = `
      You are a data validation expert. Analyze the following ${entityType} data and identify any issues, inconsistencies, or potential problems.
      
      Data: ${JSON.stringify(data, null, 2)}
      
      Entity Type: ${entityType}
      
      Please provide:
      1. A boolean indicating if the data is valid overall
      2. A list of specific errors found
      3. Suggestions for improvement
      
      Return your response as JSON with the structure:
      {
        "isValid": boolean,
        "errors": ["error1", "error2"],
        "suggestions": ["suggestion1", "suggestion2"]
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
    console.error('AI validation error:', error)
    return NextResponse.json({
      isValid: true,
      errors: [],
      suggestions: ['AI validation temporarily unavailable']
    })
  }
}

