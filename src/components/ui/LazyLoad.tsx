/**
 * Phase 3: Advanced Lazy Loading Components
 * Optimized intersection observer patterns for better performance
 */

import { ReactNode, useEffect, useRef, useState, memo } from 'react'

interface LazyLoadProps {
  children: ReactNode
  placeholder?: ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
  minHeight?: number
}

/**
 * Enhanced lazy loading wrapper with intersection observer
 */
export const LazyLoad = memo<LazyLoadProps>(({
  children,
  placeholder,
  threshold = 0.1,
  rootMargin = '50px',
  className = '',
  minHeight = 200
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry && entry.isIntersecting) {
          setIsVisible(true)
          // Small delay to ensure smooth loading
          setTimeout(() => setIsLoaded(true), 50)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return (
    <div 
      ref={containerRef}
      className={`transition-all duration-300 ${className}`}
      style={{ minHeight: isLoaded ? 'auto' : minHeight }}
    >
      {isVisible ? (
        <div className={`${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
          {children}
        </div>
      ) : (
        placeholder || (
          <div 
            className="bg-gradient-to-br from-muted/30 to-muted/50 animate-pulse rounded-lg flex items-center justify-center"
            style={{ height: minHeight }}
          >
            <div className="text-muted-foreground text-sm">Loading...</div>
          </div>
        )
      )}
    </div>
  )
})

LazyLoad.displayName = 'LazyLoad'

/**
 * Lazy loading for lists/grids of items
 */
interface LazyListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  itemsPerPage?: number
  className?: string
  loadMoreThreshold?: number
  onLoadMore?: () => void
  hasMore?: boolean
}

export function LazyList<T>({
  items,
  renderItem,
  itemsPerPage = 12,
  className = '',
  loadMoreThreshold = 0.8,
  onLoadMore,
  hasMore = false
}: LazyListProps<T>) {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!onLoadMore || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry && entry.isIntersecting && hasMore) {
          onLoadMore()
        }
      },
      { threshold: loadMoreThreshold }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [onLoadMore, hasMore, loadMoreThreshold])

  const visibleItems = items.slice(0, visibleCount)
  const showLoadMore = visibleCount < items.length

  return (
    <div className={className}>
      {visibleItems.map((item, index) => (
        <LazyLoad
          key={index}
          threshold={0.1}
          rootMargin="100px"
          minHeight={150}
        >
          {renderItem(item, index)}
        </LazyLoad>
      ))}
      
      {showLoadMore && (
        <div 
          ref={loadMoreRef}
          className="py-8 text-center"
        >
          <button
            onClick={() => setVisibleCount(prev => prev + itemsPerPage)}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
          >
            Load More
          </button>
        </div>
      )}
      
      {hasMore && onLoadMore && (
        <div 
          ref={loadMoreRef}
          className="h-4 bg-transparent"
        />
      )}
    </div>
  )
}

/**
 * Lazy loading for heavy components (admin panels, complex forms)
 */
interface LazyComponentProps {
  fallback?: ReactNode
  delay?: number
  children: ReactNode
}

export const LazyComponent = memo<LazyComponentProps>(({ 
  children, 
  fallback,
  delay = 100
}) => {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShouldRender(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  if (!shouldRender) {
    return (
      <div>
        {fallback || (
          <div className="p-8 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <div className="text-muted-foreground text-sm">Loading component...</div>
          </div>
        )}
      </div>
    )
  }

  return <>{children}</>
})

LazyComponent.displayName = 'LazyComponent'