import React from 'react'
import Image from 'next/image'

interface IconPreviewProps {
  src: string
  name: string
  size?: number
  className?: string
}

const IconPreview: React.FC<IconPreviewProps> = ({ 
  src, 
  name, 
  size = 24, 
  className = '' 
}) => {
  return (
    <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg bg-white">
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`mb-2 ${className}`}
        style={{ 
          filter: 'brightness(0) saturate(100%)',
          opacity: 0.8 
        }}
        onError={() => console.log(`Failed to load icon: ${src}`)}
      />
      <span className="text-sm text-gray-600 text-center">{name}</span>
      <span className="text-xs text-gray-400">{size}px</span>
    </div>
  )
}

export default IconPreview
