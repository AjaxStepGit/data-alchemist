import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
})

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json()

    const prompt = `
      You are a business rules expert. Analyze the following data and recommend business rules that would be beneficial.
      
      Data Context:
      - Clients: ${JSON.stringify(data.clients?.slice(0, 5) || [], null, 2)}
      - Workers: ${JSON.stringify(data.workers?.slice(0, 5) || [], null, 2)}
      - Tasks: ${JSON.stringify(data.tasks?.slice(0, 5) || [], null, 2)}
      
      Look for patterns such as:
      - Tasks that frequently appear together (suggest co-run rules)
      - Worker groups that might be overloaded (suggest load limits)
      - Slot restrictions that might be needed
      
      Return an array of natural language rule recommendations as JSON:
      ["recommendation1", "recommendation2", "recommendation3"]
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    })

    const result = JSON.parse(response.choices[0].message.content || '[]')
    return NextResponse.json(Array.isArray(result) ? result : [])
  } catch (error) {
    console.error('AI rule recommendation error:', error)
    return NextResponse.json(['AI rule recommendations temporarily unavailable'])
  }
}

