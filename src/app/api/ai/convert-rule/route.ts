import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
})

export async function POST(request: NextRequest) {
  try {
    const { naturalLanguage, data } = await request.json()

    const prompt = `
      You are a business rules expert. Convert the following natural language rule into a structured rule object.
      
      Natural Language Rule: "${naturalLanguage}"
      
      Available Data Context:
      - Clients: ${JSON.stringify(data.clients?.slice(0, 3) || [], null, 2)}
      - Workers: ${JSON.stringify(data.workers?.slice(0, 3) || [], null, 2)}
      - Tasks: ${JSON.stringify(data.tasks?.slice(0, 3) || [], null, 2)}
      
      Supported rule types:
      1. coRun: { type: "coRun", tasks: ["TaskID1", "TaskID2"] }
      2. slotRestriction: { type: "slotRestriction", group: "GroupName", minCommonSlots: number }
      3. loadLimit: { type: "loadLimit", workerGroup: "GroupName", maxSlotsPerPhase: number }
      
      Return your response as JSON with the structure:
      {
        "rule": { /* the structured rule object */ },
        "explanation": "Human-readable explanation of what this rule does",
        "isValid": boolean
      }
      
      If the natural language cannot be converted to a valid rule, set isValid to false and explain why in the explanation.
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return NextResponse.json(result)
  } catch (error) {
    console.error('AI rule conversion error:', error)
    return NextResponse.json({
      rule: null,
      explanation: 'AI rule conversion temporarily unavailable',
      isValid: false
    })
  }
}

