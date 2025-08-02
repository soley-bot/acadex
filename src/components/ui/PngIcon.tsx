import React from 'react'
import Image from 'next/image'

import { logger } from '@/lib/logger'

interface PngIconProps {
  src: string
  alt: string
  size?: number
  className?: string
  variant?: 'default' | 'white' | 'red'
}

const PngIcon: React.FC<PngIconProps> = ({ 
  src, 
  alt, 
  size = 24, 
  className = '',
  variant = 'default'
}) => {
  const getFilterStyle = (): React.CSSProperties => {
    switch (variant) {
      case 'white':
        return { 
          filter: 'brightness(0) invert(1)', 
          opacity: 0.9 
        }
      case 'red':
        return { 
          filter: 'brightness(0) saturate(100%) hue-rotate(0deg)', 
          opacity: 1,
          color: '#ff0000'
        }
      default:
        return { 
          filter: 'brightness(0) saturate(100%)', 
          opacity: 0.8 
        }
    }
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      style={getFilterStyle()}
      onError={(e) => {
        logger.warn(`Failed to load icon: ${src}`)
        e.currentTarget.style.display = 'none'
      }}
    />
  )
}

export default PngIcon
