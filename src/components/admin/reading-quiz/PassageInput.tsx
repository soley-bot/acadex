'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Volume2, Eye, AlertCircle } from 'lucide-react'
import { TextareaInput } from '@/components/ui/FormInputs'

interface PassageData {
  passage_title: string
  passage_source: string
  reading_passage: string
  passage_audio_url?: string
  word_count?: number
  estimated_read_time?: number
}

interface PassageInputProps {
  value: PassageData
  onChange: (data: PassageData) => void
  className?: string
}

export function PassageInput({ value, onChange, className = '' }: PassageInputProps) {
  const [showPreview, setShowPreview] = useState(false)

  // Calculate word count and estimated reading time
  useEffect(() => {
    if (value.reading_passage) {
      const words = value.reading_passage.trim().split(/\s+/).filter(word => word.length > 0)
      const wordCount = words.length
      const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200)) // Average 200 words per minute
      
      if (wordCount !== value.word_count || estimatedReadTime !== value.estimated_read_time) {
        onChange({
          ...value,
          word_count: wordCount,
          estimated_read_time: estimatedReadTime
        })
      }
    }
  }, [value.reading_passage, value.word_count, value.estimated_read_time, value, onChange])

  const handleFieldChange = (field: keyof PassageData, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue
    })
  }

  const isValid = value.reading_passage?.trim().length > 0

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reading Passage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Passage Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Passage Title
            </label>
            <input
              type="text"
              value={value.passage_title || ''}
              onChange={(e) => handleFieldChange('passage_title', e.target.value)}
              placeholder="e.g., The Benefits of Exercise"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Passage Source */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Source (Optional)
            </label>
            <input
              type="text"
              value={value.passage_source || ''}
              onChange={(e) => handleFieldChange('passage_source', e.target.value)}
              placeholder="e.g., Harvard Health Publishing, 2024"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Audio URL (Optional) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Volume2 className="inline h-4 w-4 mr-1" />
              Audio URL (Optional)
            </label>
            <input
              type="url"
              value={value.passage_audio_url || ''}
              onChange={(e) => handleFieldChange('passage_audio_url', e.target.value)}
              placeholder="https://example.com/audio/passage.mp3"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Optional audio file for text-to-speech or recorded narration
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Passage Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Passage Content</CardTitle>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Eye className="h-4 w-4" />
                {showPreview ? 'Edit' : 'Preview'}
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showPreview ? (
            /* Preview Mode */
            <div className="space-y-4">
              <div className="bg-muted/50 p-6 rounded-lg border-2 border-border">
                {value.passage_title && (
                  <h3 className="text-lg font-semibold mb-2">
                    {value.passage_title}
                  </h3>
                )}
                {value.passage_source && (
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    Source: {value.passage_source}
                  </p>
                )}
                <div className="whitespace-pre-wrap leading-relaxed">
                  {value.reading_passage || 'No passage content yet...'}
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Words: {value.word_count || 0}</span>
                <span>Est. read time: {value.estimated_read_time || 0} min</span>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <div className="space-y-4">
              <TextareaInput
                value={value.reading_passage || ''}
                onChange={(newValue) => handleFieldChange('reading_passage', newValue)}
                placeholder="Type or paste your reading passage here...

Example:
The rapid advancement of artificial intelligence has transformed numerous industries over the past decade. From healthcare to finance, AI systems are now capable of performing complex tasks that were once exclusive to human expertise. However, this technological revolution brings both opportunities and challenges that society must carefully navigate.

In the healthcare sector, AI-powered diagnostic tools can analyze medical images with remarkable accuracy, often detecting conditions that human doctors might miss. These systems can process thousands of cases in minutes, providing faster and more reliable diagnoses..."
                rows={16}
                className="font-mono text-sm"
              />
              
              {/* Word Count and Stats */}
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <div className="flex gap-4">
                  <span>Words: {value.word_count || 0}</span>
                  <span>Est. read time: {value.estimated_read_time || 0} min</span>
                </div>
                
                {value.reading_passage && value.reading_passage.length > 2000 && (
                  <div className="flex items-center gap-1 text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Long passage - consider splitting</span>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground">
                Tip: Aim for 150-300 words for optimal reading comprehension questions
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Summary */}
      {!isValid && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Passage content is required</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}