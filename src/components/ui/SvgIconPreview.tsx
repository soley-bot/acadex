'use client'

import Image from 'next/image'
import { useState } from 'react'
import { SVG_ICONS, getSvgIconPath } from '@/lib/svgIcons'

interface SvgIconPreviewProps {
  searchTerm?: string
}

export default function SvgIconPreview({ searchTerm = '' }: SvgIconPreviewProps) {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null)
  
  const filteredIcons = Object.entries(SVG_ICONS).filter(([key, config]) =>
    key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {filteredIcons.map(([key, config]) => (
        <div
          key={key}
          className="group flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all duration-200 cursor-pointer"
          onMouseEnter={() => setHoveredIcon(key)}
          onMouseLeave={() => setHoveredIcon(null)}
        >
          <div className="mb-2 p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
            <Image
              src={getSvgIconPath(key)}
              alt={config.name}
              width={32}
              height={32}
              style={{ 
                filter: hoveredIcon === key 
                  ? 'brightness(0) saturate(100%) invert(22%) sepia(94%) saturate(7466%) hue-rotate(359deg) brightness(99%) contrast(118%)'
                  : 'brightness(0) saturate(100%)',
                opacity: 0.8
              }}
              className="transition-all duration-200"
            />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-gray-900 mb-1">{config.name}</p>
            <p className="text-xs text-gray-500 leading-tight">{config.description}</p>
            <p className="text-xs text-gray-400 mt-1 font-mono">{key}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
