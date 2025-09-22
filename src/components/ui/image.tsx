import React, { useState, useRef, useEffect, memo } from 'react'
import Image from 'next/image'
import { Icons } from './icons'

interface ImageWithFallbackProps {
  src: string | null | undefined
  alt: string
  width: number
  height: number
  className?: string
  fallbackType?: 'course' | 'quiz' | 'user' | 'generic'
  priority?: boolean
  quality?: number
  lazy?: boolean // Enable lazy loading (default: true)
}

const FALLBACK_IMAGES = {
  course: '/images/fallback/course-placeholder.svg',
  quiz: '/images/fallback/quiz-placeholder.svg', 
  user: '/images/fallback/user-placeholder.svg',
  generic: '/images/fallback/generic-placeholder.svg'
}

// SVG Placeholder Component for when no image is available
const ImagePlaceholder: React.FC<{
  type: 'course' | 'quiz' | 'user' | 'generic'
  width: number
  height: number
  className?: string
}> = ({ type, width, height, className }) => {
  const iconMap = {
    course: Icons.Book,
    quiz: Icons.Puzzle,
    user: Icons.User,
    generic: Icons.Target
  }
  
  const IconComponent = iconMap[type]
  
  return (
    <div 
      className={`flex items-center justify-center bg-muted border border-border rounded-lg ${className}`}
      style={{ width, height }}
    >
      <IconComponent size={Math.min(width, height) * 0.3} className="text-muted-foreground" />
    </div>
  )
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = memo(({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackType = 'generic',
  priority = false,
  quality = 80,
  lazy = true
}) => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInView, setIsInView] = useState(!lazy) // If not lazy, always in view
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry && entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Load images 50px before they enter viewport
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [lazy, isInView])

  // If no src provided or error occurred, show placeholder
  if (!src || hasError) {
    return <ImagePlaceholder type={fallbackType} width={width} height={height} className={className} />
  }

  return (
    <div ref={imgRef} className="relative">
      {isLoading && isInView && (
        <div 
          className={`absolute inset-0 bg-muted animate-pulse rounded-lg ${className}`}
          style={{ width, height }}
        />
      )}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          priority={priority}
          quality={quality}
          loading={priority ? "eager" : "lazy"}
          onError={() => {
            setHasError(true)
            setIsLoading(false)
          }}
          onLoad={() => setIsLoading(false)}
        />
      )}
    </div>
  )
})

ImageWithFallback.displayName = 'ImageWithFallback'

// Specialized components for different use cases
export const CourseImage: React.FC<{
  src: string | null | undefined
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  lazy?: boolean
  size?: 'small' | 'medium' | 'large'
}> = ({ 
  src, 
  alt, 
  width,
  height,
  className = 'rounded-lg object-cover',
  priority = false,
  lazy = true,
  size
}) => {
  // If size is provided, use predefined dimensions
  let finalWidth: number
  let finalHeight: number
  
  if (size) {
    const dimensions = {
      small: { width: 200, height: 150 },
      medium: { width: 400, height: 300 },
      large: { width: 800, height: 600 }
    }
    finalWidth = dimensions[size].width
    finalHeight = dimensions[size].height
  } else {
    // Use provided dimensions or defaults
    finalWidth = width || 400
    finalHeight = height || 300
  }

  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      width={finalWidth}
      height={finalHeight}
      className={className}
      fallbackType="course"
      priority={priority}
      quality={85}
      lazy={lazy}
    />
  )
}

export const QuizImage: React.FC<{
  src: string | null | undefined
  alt: string
  width?: number
  height?: number
  className?: string
  lazy?: boolean
}> = ({ 
  src, 
  alt, 
  width = 400, 
  height = 300, 
  className = 'rounded-lg object-cover',
  lazy = true
}) => (
  <ImageWithFallback
    src={src}
    alt={alt}
    width={width}
    height={height}
    className={className}
    fallbackType="quiz"
    quality={85}
    lazy={lazy}
  />
)

export const UserAvatar: React.FC<{
  src: string | null | undefined
  alt: string
  size?: number
  className?: string
  lazy?: boolean
}> = ({ 
  src, 
  alt, 
  size = 40, 
  className = 'rounded-full object-cover',
  lazy = false // Avatars are usually small and above-the-fold
}) => (
  <ImageWithFallback
    src={src}
    alt={alt}
    width={size}
    height={size}
    className={className}
    fallbackType="user"
    quality={90}
    lazy={lazy}
  />
)

// Optimized image loader for Supabase storage
export const getOptimizedImageUrl = (
  url: string | null | undefined,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'jpg' | 'png'
  } = {}
): string | null => {
  if (!url) return null
  
  const { width, height, quality = 80, format = 'webp' } = options
  
  // If it's a Supabase storage URL, we can add transformation parameters
  if (url.includes('.supabase.co/storage')) {
    const urlObj = new URL(url)
    if (width) urlObj.searchParams.set('width', width.toString())
    if (height) urlObj.searchParams.set('height', height.toString())
    urlObj.searchParams.set('quality', quality.toString())
    urlObj.searchParams.set('format', format)
    return urlObj.toString()
  }
  
  return url
}

export default ImageWithFallback
