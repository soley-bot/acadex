/**
 * Optimized Course Card - Lighter version focused on performance
 * Similar to QuizListCard but for courses
 */

import React, { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  BookOpen, 
  Star, 
  Users, 
  ArrowRight,
  PlayCircle 
} from 'lucide-react'
import type { Course } from '@/lib/supabase'
import { getCourseImage, getOptimizedImageProps } from '@/lib/imageMapping'

interface OptimizedCourseCardProps {
  course: Course
  priority?: boolean
  className?: string
}

/**
 * Optimized course card with minimal re-renders and faster loading
 */
export const OptimizedCourseCard = memo<OptimizedCourseCardProps>(({ 
  course, 
  priority = false,
  className = "" 
}) => {
  // Memoized image props calculation
  const courseImage = React.useMemo(() => 
    getCourseImage({
      category: course.category,
      title: course.title,
      image_url: course.image_url
    }), 
    [course.category, course.title, course.image_url]
  )
  
  const imageProps = React.useMemo(() => 
    getOptimizedImageProps(courseImage, 'card'), 
    [courseImage]
  )

  // Memoized price formatting - using correct Course type properties
  const priceDisplay = React.useMemo(() => {
    if (course.is_free || course.price === 0) return 'Free'
    if (course.original_price && course.original_price > course.price) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-primary">
            ${course.price}
          </span>
          <span className="line-through text-sm text-muted-foreground">
            ${course.original_price}
          </span>
        </div>
      )
    }
    return `$${course.price}`
  }, [course.price, course.original_price, course.is_free])

  // Memoized level badge color
  const levelBadgeVariant = React.useMemo(() => {
    switch (course.level?.toLowerCase()) {
      case 'beginner': return 'default'
      case 'intermediate': return 'secondary'
      case 'advanced': return 'destructive'
      default: return 'outline'
    }
  }, [course.level])

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 border-0 shadow-sm ${className}`}>
      <Link href={`/courses/${course.id}`} className="block">
        {/* Course Image */}
        <div className="relative overflow-hidden rounded-t-lg aspect-video">
          <Image
            src={imageProps.src}
            alt={imageProps.alt || course.title}
            fill
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Overlay with play button */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <PlayCircle className="w-12 h-12 text-white" />
          </div>
          
          {/* Level badge */}
          {course.level && (
            <Badge 
              variant={levelBadgeVariant}
              className="absolute top-2 left-2 text-xs"
            >
              {course.level}
            </Badge>
          )}
          
          {/* Category badge */}
          {course.category && (
            <Badge 
              variant="outline"
              className="absolute top-2 right-2 text-xs bg-white/90"
            >
              {course.category}
            </Badge>
          )}
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {course.title}
            </CardTitle>
            {course.rating && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {course.rating.toFixed(1)}
              </div>
            )}
          </div>
          
          <CardDescription className="text-sm line-clamp-2">
            {course.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Instructor */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-muted-foreground">
              by {course.instructor_name}
            </span>
          </div>
          
          {/* Course stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            {course.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {course.duration}
              </div>
            )}
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Course
            </div>
            {course.student_count > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {course.student_count} students
              </div>
            )}
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">
              {priceDisplay}
            </div>
            <Button 
              size="sm" 
              className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              variant="outline"
            >
              Start Course
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
})

OptimizedCourseCard.displayName = 'OptimizedCourseCard'