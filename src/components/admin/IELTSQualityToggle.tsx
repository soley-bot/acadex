/**
 * IELTS Quality Matrix Toggle Component
 * Shows in AI quiz generation forms to enable/disable quality validation
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Info, Award, CheckCircle, AlertTriangle } from 'lucide-react'
import { 
  suggestIELTSQuality, 
  getIELTSQualityDescription,
  QualityMatrixSuggestion 
} from '@/lib/ielts-quality-helpers'

interface IELTSQualityToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  subject?: string
  topic?: string
  category?: string
  language?: string
  showDescription?: boolean
}

export function IELTSQualityToggle({
  enabled,
  onChange,
  subject,
  topic, 
  category,
  language,
  showDescription = true
}: IELTSQualityToggleProps) {
  const [suggestion, setSuggestion] = useState<QualityMatrixSuggestion | null>(null)
  const [showFullDescription, setShowFullDescription] = useState(false)

  // Update suggestion when parameters change
  useEffect(() => {
    const newSuggestion = suggestIELTSQuality({ subject, topic, category, language })
    setSuggestion(newSuggestion)
    
    // Auto-enable if high confidence and not already set
    if (newSuggestion.shouldApply && 
        newSuggestion.confidence === 'high' && 
        !enabled) {
      onChange(true)
    }
  }, [subject, topic, category, language, enabled, onChange])

  const getSuggestionIcon = () => {
    if (!suggestion) return null
    
    if (suggestion.shouldApply && suggestion.confidence === 'high') {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    }
    if (suggestion.shouldApply && suggestion.confidence === 'medium') {
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />
    }
    return <Info className="w-4 h-4 text-blue-600" />
  }

  const getSuggestionColor = () => {
    if (!suggestion) return 'default'
    
    if (suggestion.shouldApply && suggestion.confidence === 'high') return 'default'
    if (suggestion.shouldApply && suggestion.confidence === 'medium') return 'secondary'
    return 'outline'
  }

  return (
    <Card className={`transition-all duration-200 ${enabled ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span>IELTS Quality Matrix</span>
            <Badge variant="secondary" className="text-xs">
              &ldquo;Unfair Advantage&rdquo;
            </Badge>
          </div>
          
          <Switch
            checked={enabled}
            onCheckedChange={onChange}
            aria-label="Enable IELTS Quality Matrix"
          />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Smart suggestion */}
        {suggestion && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-gray-50 border border-gray-200">
            {getSuggestionIcon()}
            <div className="flex-1 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">Smart Suggestion:</span>
                <Badge variant={getSuggestionColor()} className="text-xs">
                  {suggestion.confidence} confidence
                </Badge>
              </div>
              <p className="text-gray-600">{suggestion.reason}</p>
              {suggestion.shouldApply && !enabled && (
                <button
                  onClick={() => onChange(true)}
                  className="text-blue-600 hover:text-blue-700 text-xs underline mt-1"
                >
                  Enable IELTS Quality Matrix
                </button>
              )}
            </div>
          </div>
        )}

        {/* Status indicator */}
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className={enabled ? 'text-green-700 font-medium' : 'text-gray-600'}>
            {enabled ? 'Examiner-quality validation enabled' : 'Standard validation only'}
          </span>
        </div>

        {/* Description */}
        {showDescription && (
          <div className="space-y-2">
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Info className="w-3 h-3" />
              What is the IELTS Quality Matrix?
            </button>
            
            {showFullDescription && (
              <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-200 space-y-2">
                <p className="font-medium text-blue-800">
                  Professional English Language Assessment Standards
                </p>
                {getIELTSQualityDescription().split('•').map((item, index) => {
                  if (index === 0) return <p key={index}>{item}</p>
                  return (
                    <div key={index} className="flex items-start gap-1">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{item.trim()}</span>
                    </div>
                  )
                })}
                
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-800 text-xs font-medium">
                    💡 Pro Tip: Use this for IELTS prep, English proficiency tests, and academic English content to ensure examiner-quality questions.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Warning for non-English content */}
        {enabled && suggestion && !suggestion.shouldApply && suggestion.confidence === 'high' && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex items-center gap-2 text-orange-800 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Notice:</span>
            </div>
            <p className="text-orange-700 text-xs mt-1">
              IELTS Quality Matrix is designed for English language content. It may not be suitable for {subject || 'this subject'}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}