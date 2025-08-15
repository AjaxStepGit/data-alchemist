'use client'

import { useState } from 'react'
import { parseFile } from '../lib/parseData'
import { EntityType } from '@/types/entities'
import HeaderMappingModal from './HeaderMappingModal'
import { remapRows } from '../lib/remapData'
import { SmartHeaderMapper, ENTITY_SCHEMAS } from '../lib/smartHeaderMapper'

interface Props {
    onDataParsed: (type: EntityType, data: any[]) => void
}

export default function FileUploader({ onDataParsed }: Props) {
    const [errors, setErrors] = useState<string[]>([])
    const [mappingModalOpen, setMappingModalOpen] = useState(false)
    const [pendingMapping, setPendingMapping] = useState<any>(null)
    const [pendingEntity, setPendingEntity] = useState<EntityType>('unknown')
    const [pendingRows, setPendingRows] = useState<any[]>([])
    const [isProcessing, setIsProcessing] = useState(false)

    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = event.target.files
        if (!files) return
        setErrors([])
        setIsProcessing(true)

        for (const file of Array.from(files)) {
            try {
                const results = await parseFile(file)

                for (const res of results) {
                    if (res.type === 'unknown') {
                        // Try AI-powered smart header mapping
                        await trySmartMapping(file, res.data)
                    } else {
                        onDataParsed(res.type, res.data)
                    }
                }
            } catch (error) {
                setErrors(prev => [...prev, `${file.name}: Failed to process file`])
            }
        }
        
        setIsProcessing(false)
    }

    const trySmartMapping = async (file: File, data: any[]) => {
        if (!data.length) {
            setErrors(prev => [...prev, `${file.name}: No data found`])
            return
        }

        const headers = Object.keys(data[0])
        
        // Try to map to each entity type and find the best match
        const mappingResults = await Promise.all([
            SmartHeaderMapper.mapHeaders(headers, 'clients'),
            SmartHeaderMapper.mapHeaders(headers, 'workers'), 
            SmartHeaderMapper.mapHeaders(headers, 'tasks')
        ])

        const entityTypes: (keyof typeof ENTITY_SCHEMAS)[] = ['clients', 'workers', 'tasks']
        
        // Find the mapping with highest confidence
        let bestMatch = { confidence: 0, entityType: 'unknown' as EntityType, mapping: {} }
        
        mappingResults.forEach((result, index) => {
            if (result.confidence > bestMatch.confidence) {
                bestMatch = {
                    confidence: result.confidence,
                    entityType: entityTypes[index] as EntityType,
                    mapping: result.mapping
                }
            }
        })

        if (bestMatch.confidence > 0.6) {
            // High confidence - auto-apply mapping
            const mappedData = SmartHeaderMapper.applyMapping(data, bestMatch.mapping)
            const validation = SmartHeaderMapper.validateMappedData(mappedData, bestMatch.entityType as any)
            
            if (validation.isValid) {
                onDataParsed(bestMatch.entityType, mappedData)
                return
            } else {
                setErrors(prev => [...prev, `${file.name}: ${validation.errors.join(', ')}`])
            }
        }

        // Lower confidence or validation failed - show manual mapping modal
        if (bestMatch.confidence > 0.3) {
            setMappingModalOpen(true)
            setPendingMapping(bestMatch.mapping)
            setPendingEntity(bestMatch.entityType)
            setPendingRows(data)
        } else {
            setErrors(prev => [...prev, `${file.name}: Could not determine data type. Please check your file format.`])
        }
    }

    const handleMappingApply = (finalMapping: Record<string, string>) => {
        const remapped = remapRows(
            pendingRows,
            Object.fromEntries(
                Object.entries(finalMapping).map(([k, v]) => [k, { field: v }])
            )
        )
        onDataParsed(pendingEntity, remapped)
        setMappingModalOpen(false)
        setPendingMapping(null)
        setPendingRows([])
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <input
                    type="file"
                    multiple
                    accept=".csv,.xlsx"
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                    className="rounded-xl border-2 p-2 border-white cursor-pointer disabled:opacity-50"
                />
                {isProcessing && (
                    <div className="flex items-center gap-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">Processing with AI...</span>
                    </div>
                )}
            </div>

            {errors.length > 0 && (
                <div className="bg-red-100 text-red-700 p-2 rounded">
                    <h2 className="font-bold">Errors:</h2>
                    <ul className="list-disc pl-5">
                        {errors.map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            {mappingModalOpen && pendingMapping && (
                <HeaderMappingModal
                    open={mappingModalOpen}
                    mapping={pendingMapping}
                    onClose={() => setMappingModalOpen(false)}
                    onApply={handleMappingApply}
                />
            )}
        </div>
    )
}
