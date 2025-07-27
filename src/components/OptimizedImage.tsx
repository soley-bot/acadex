'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getOptimizedImageUrl } from '@/lib/storage'

interface OptimizedImageProps {
  src: string | null | undefined
  alt: string
  width: number
  height: number
  className?: string
  fallbackType?: 'course' | 'quiz' | 'user' | 'generic'
  quality?: number
}

const FALLBACK_IMAGES = {
  course: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center&auto=format&q=80',
  quiz: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop&crop=center&auto=format&q=80', 
  user: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format&q=80',
  generic: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop&crop=center&auto=format&q=80'
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackType = 'generic',
  quality = 80
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const optimizedSrc = hasError 
    ? FALLBACK_IMAGES[fallbackType]
    : getOptimizedImageUrl(src, { width, height, quality })

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded"
          style={{ width, height }}
        />
      )}
      <Image
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  )
}

// Specialized components for different use cases
export function CourseImage({ 
  src, 
  alt, 
  className = "rounded-lg",
  size = 'medium' 
}: {
  src: string | null | undefined
  alt: string
  className?: string
  size?: 'small' | 'medium' | 'large'
}) {
  const dimensions = {
    small: { width: 200, height: 150 },
    medium: { width: 400, height: 300 },
    large: { width: 800, height: 600 }
  }
  
  const { width, height } = dimensions[size]
  
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      fallbackType="course"
    />
  )
}

export function QuizImage({ 
  src, 
  alt, 
  className = "rounded-lg",
  size = 'medium' 
}: {
  src: string | null | undefined
  alt: string
  className?: string
  size?: 'small' | 'medium' | 'large'
}) {
  const dimensions = {
    small: { width: 200, height: 150 },
    medium: { width: 400, height: 300 },
    large: { width: 800, height: 600 }
  }
  
  const { width, height } = dimensions[size]
  
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      fallbackType="quiz"
    />
  )
}

export function UserAvatar({ 
  src, 
  alt, 
  size = 40,
  className = "rounded-full" 
}: {
  src: string | null | undefined
  alt: string
  size?: number
  className?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      fallbackType="user"
    />
  )
}
