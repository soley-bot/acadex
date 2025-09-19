'use client'

import { useState, useRef, useEffect } from 'react'
import { BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ReadingPassageDisplayProps {
  title?: string | null
  source?: string | null
  passage: string
  audioUrl?: string | null
  className?: string
  wordCount?: number
  estimatedReadTime?: number
}

export function ReadingPassageDisplayNew({ 
  title, 
  source, 
  passage, 
  audioUrl, 
  className = '',
  wordCount,
  estimatedReadTime
}: ReadingPassageDisplayProps) {
  
  return (
    <Card className={`${className} h-full bg-white shadow-sm border-gray-200`}>
      <CardHeader className="pb-4 border-b border-gray-100">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <BookOpen className="h-5 w-5 text-blue-600" />
          Reading Passage
        </CardTitle>
        
        {/* Simple title and source */}
        {title && (
          <h3 className="text-base font-medium text-gray-800 mt-2">
            {title}
          </h3>
        )}
        
        {source && (
          <p className="text-sm text-gray-600 italic">Source: {source}</p>
        )}
        
        {/* Simple stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {wordCount && <span>{wordCount} words</span>}
          {estimatedReadTime && <span>~{estimatedReadTime} min read</span>}
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="overflow-y-auto max-h-[70vh]">
          <div className="text-base leading-relaxed text-gray-900 whitespace-pre-wrap">
            {passage.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 first:mt-0 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}