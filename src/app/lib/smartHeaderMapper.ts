import { AIService } from './aiService'

export interface HeaderMappingResult {
  mapping: Record<string, string>
  confidence: number
  suggestions: string[]
}

export const ENTITY_SCHEMAS = {
  clients: [
    'ClientID',
    'ClientName', 
    'PriorityLevel',
    'RequestedTaskIDs',
    'GroupTag',
    'AttributesJSON'
  ],
  workers: [
    'WorkerID',
    'WorkerName',
    'Skills',
    'AvailableSlots',
    'MaxLoadPerPhase',
    'WorkerGroup',
    'QualificationLevel'
  ],
  tasks: [
    'TaskID',
    'TaskName',
    'Category',
    'Duration',
    'RequiredSkills',
    'PreferredPhases',
    'MaxConcurrent'
  ]
}

export class SmartHeaderMapper {
  
  static async mapHeaders(
    headers: string[], 
    entityType: keyof typeof ENTITY_SCHEMAS
  ): Promise<HeaderMappingResult> {
    
    const expectedSchema = ENTITY_SCHEMAS[entityType]
    
    try {
      // Use AI to map headers
      const aiMapping = await AIService.mapHeaders(headers, expectedSchema)
      
      // Calculate confidence based on how many headers were successfully mapped
      const mappedCount = Object.values(aiMapping).filter(v => v !== null).length
      const confidence = mappedCount / expectedSchema.length
      
      // Generate suggestions for unmapped fields
      const unmappedFields = expectedSchema.filter(field => 
        !Object.values(aiMapping).includes(field)
      )
      
      const suggestions = unmappedFields.map(field => 
        `Missing required field: ${field}. Consider adding a column with this data.`
      )
      
      return {
        mapping: aiMapping,
        confidence,
        suggestions
      }
      
    } catch (error) {
      console.error('Smart header mapping failed:', error)
      
      // Fallback to simple string matching
      const fallbackMapping: Record<string, string> = {}
      
      headers.forEach(header => {
        const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '')
        
        const match = expectedSchema.find(field => {
          const normalizedField = field.toLowerCase().replace(/[^a-z0-9]/g, '')
          return normalizedField === normalizedHeader ||
                 normalizedField.includes(normalizedHeader) ||
                 normalizedHeader.includes(normalizedField)
        })
        
        if (match) {
          fallbackMapping[header] = match
        }
      })
      
      const mappedCount = Object.keys(fallbackMapping).length
      const confidence = mappedCount / expectedSchema.length
      
      const unmappedFields = expectedSchema.filter(field => 
        !Object.values(fallbackMapping).includes(field)
      )
      
      return {
        mapping: fallbackMapping,
        confidence,
        suggestions: unmappedFields.map(field => 
          `Missing field: ${field}. AI mapping unavailable, using fallback.`
        )
      }
    }
  }
  
  static applyMapping(data: any[], mapping: Record<string, string>): any[] {
    return data.map(row => {
      const mappedRow: any = {}
      
      Object.entries(row).forEach(([originalKey, value]) => {
        const mappedKey = mapping[originalKey] || originalKey
        mappedRow[mappedKey] = value
      })
      
      return mappedRow
    })
  }
  
  static validateMappedData(
    data: any[], 
    entityType: keyof typeof ENTITY_SCHEMAS
  ): { isValid: boolean; errors: string[] } {
    
    const requiredFields = ENTITY_SCHEMAS[entityType]
    const errors: string[] = []
    
    if (data.length === 0) {
      return { isValid: false, errors: ['No data provided'] }
    }
    
    const firstRow = data[0]
    const availableFields = Object.keys(firstRow)
    
    // Check for missing required fields
    requiredFields.forEach(field => {
      if (!availableFields.includes(field)) {
        errors.push(`Missing required field: ${field}`)
      }
    })
    
    // Check for data type consistency
    data.forEach((row, index) => {
      if (entityType === 'clients') {
        if (row.PriorityLevel && (isNaN(row.PriorityLevel) || row.PriorityLevel < 1 || row.PriorityLevel > 5)) {
          errors.push(`Row ${index + 1}: PriorityLevel must be a number between 1-5`)
        }
      }
      
      if (entityType === 'workers') {
        if (row.MaxLoadPerPhase && isNaN(row.MaxLoadPerPhase)) {
          errors.push(`Row ${index + 1}: MaxLoadPerPhase must be a number`)
        }
      }
      
      if (entityType === 'tasks') {
        if (row.Duration && (isNaN(row.Duration) || row.Duration < 1)) {
          errors.push(`Row ${index + 1}: Duration must be a number >= 1`)
        }
        if (row.MaxConcurrent && isNaN(row.MaxConcurrent)) {
          errors.push(`Row ${index + 1}: MaxConcurrent must be a number`)
        }
      }
    })
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

