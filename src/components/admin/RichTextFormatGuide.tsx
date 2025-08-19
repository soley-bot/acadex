'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Info } from 'lucide-react'

export function RichTextFormatGuide() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-blue-700 hover:text-secondary font-medium"
      >
        <Info className="w-4 h-4" />
        Rich Text Formatting Guide
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-3 text-sm text-secondary space-y-2">
          <p className="font-medium mb-2">You can use these formatting options in lesson content:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Text Formatting:</h4>
              <ul className="space-y-1 text-xs">
                <li><code>**bold text**</code> → <strong>bold text</strong></li>
                <li><code>*italic text*</code> → <em>italic text</em></li>
                <li><code>==highlight==</code> → <mark className="bg-yellow-200 text-yellow-900 px-1 rounded">highlight</mark></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Colors:</h4>
              <ul className="space-y-1 text-xs">
                <li><code>{'{{red:text}}'}</code> → <span className="text-primary font-medium">red text</span></li>
                <li><code>{'{{blue:text}}'}</code> → <span className="text-secondary font-medium">blue text</span></li>
                <li><code>{'{{green:text}}'}</code> → <span className="text-green-600 font-medium">green text</span></li>
                <li><code>{'{{orange:text}}'}</code> → <span className="text-orange-600 font-medium">orange text</span></li>
                <li><code>{'{{purple:text}}'}</code> → <span className="text-purple-600 font-medium">purple text</span></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-secondary/10 rounded">
            <p className="text-xs">
              <strong>Example:</strong> This is **bold**, this is *italic*, this is ==highlighted==, and this is {'{{red:red text}}'}.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
