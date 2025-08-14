import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
})

export async function POST(request: NextRequest) {
  try {
    const { headers, expectedSchema } = await request.json()

    const prompt = `
      You are a data mapping expert. Map the provided headers to the expected schema fields.
      
      Provided Headers: ${JSON.stringify(headers)}
      Expected Schema: ${JSON.stringify(expectedSchema)}
      
      Create a mapping from provided headers to expected schema fields. Handle variations in naming, spacing, and common abbreviations.
      
      Return your response as JSON object mapping provided headers to expected schema fields:
      {
        "providedHeader1": "expectedField1",
        "providedHeader2": "expectedField2"
      }
      
      If a provided header doesn't match any expected field, map it to null.
      If an expected field has no matching provided header, don't include it in the mapping.
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return NextResponse.json(result)
  } catch (error) {
    console.error('AI header mapping error:', error)
    // Fallback to simple matching
    const mapping: Record<string, string> = {}
    headers.forEach((header: string) => {
      const match = expectedSchema.find((field: string) => 
        field.toLowerCase() === header.toLowerCase() ||
        field.toLowerCase().includes(header.toLowerCase()) ||
        header.toLowerCase().includes(field.toLowerCase())
      )
      if (match) {
        mapping[header] = match
      }
    })
    return NextResponse.json(mapping)
  }
}

