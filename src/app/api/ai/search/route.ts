import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
})

export async function POST(request: NextRequest) {
  try {
    const { query, data, entityType } = await request.json()

    const prompt = `
      You are a data search expert. Based on the natural language query, find matching rows from the data.
      
      Query: "${query}"
      Entity Type: ${entityType}
      Data: ${JSON.stringify(data, null, 2)}
      
      Analyze the query and return the rows that match the criteria described in natural language.
      
      Return your response as JSON with the structure:
      {
        "matchedRows": [ /* array of matching row objects */ ],
        "explanation": "Explanation of how the search was performed and what criteria were used"
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
    console.error('AI search error:', error)
    return NextResponse.json({
      matchedRows: [],
      explanation: 'AI search temporarily unavailable'
    })
  }
}

