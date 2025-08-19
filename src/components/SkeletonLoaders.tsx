'use client';

import React from 'react';

// ===============================================
// SKELETON LOADING COMPONENTS
// ===============================================

/**
 * Base skeleton component with animation
 */
export const SkeletonBase: React.FC<{ 
  className?: string 
  children?: React.ReactNode 
}> = ({ className = '', children }) => (
  <div className={`animate-pulse bg-muted/60 rounded ${className}`}>
    {children}
  </div>
);

/**
 * Course card skeleton for listing pages
 */
export const CourseCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    {/* Thumbnail skeleton */}
    <SkeletonBase className="h-48 w-full" />
    
    <div className="p-6">
      {/* Title skeleton */}
      <SkeletonBase className="h-6 w-3/4 mb-3" />
      
      {/* Description skeleton */}
      <SkeletonBase className="h-4 w-full mb-2" />
      <SkeletonBase className="h-4 w-2/3 mb-4" />
      
      {/* Tags skeleton */}
      <div className="flex gap-2 mb-4">
        <SkeletonBase className="h-6 w-16" />
        <SkeletonBase className="h-6 w-20" />
      </div>
      
      {/* Bottom info skeleton */}
      <div className="flex justify-between items-center">
        <SkeletonBase className="h-5 w-24" />
        <SkeletonBase className="h-8 w-20" />
      </div>
    </div>
  </div>
);

/**
 * Quiz card skeleton
 */
export const QuizCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    {/* Title and difficulty */}
    <div className="flex justify-between items-start mb-4">
      <SkeletonBase className="h-6 w-2/3" />
      <SkeletonBase className="h-6 w-16" />
    </div>
    
    {/* Description */}
    <SkeletonBase className="h-4 w-full mb-2" />
    <SkeletonBase className="h-4 w-3/4 mb-4" />
    
    {/* Stats */}
    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
      <SkeletonBase className="h-4 w-20" />
      <SkeletonBase className="h-4 w-24" />
    </div>
    
    {/* Button */}
    <SkeletonBase className="h-10 w-full" />
  </div>
);

/**
 * Dashboard skeleton
 */
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-8">
    {/* Welcome section */}
    <div>
      <SkeletonBase className="h-8 w-64 mb-2" />
      <SkeletonBase className="h-5 w-48" />
    </div>
    
    {/* Stats cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-lg shadow p-6">
          <SkeletonBase className="h-12 w-12 mb-4" />
          <SkeletonBase className="h-8 w-16 mb-2" />
          <SkeletonBase className="h-4 w-24" />
        </div>
      ))}
    </div>
    
    {/* Recent activity */}
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <SkeletonBase className="h-6 w-32" />
      </div>
      <div className="p-6 space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center space-x-4">
            <SkeletonBase className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <SkeletonBase className="h-4 w-3/4 mb-2" />
              <SkeletonBase className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Course detail skeleton
 */
export const CourseDetailSkeleton: React.FC = () => (
  <div className="space-y-8">
    {/* Hero section */}
    <div className="relative">
      <SkeletonBase className="h-64 w-full rounded-lg" />
      <div className="absolute bottom-4 left-4 right-4">
        <SkeletonBase className="h-8 w-3/4 mb-2" />
        <SkeletonBase className="h-5 w-1/2" />
      </div>
    </div>
    
    {/* Course info */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Description */}
        <div>
          <SkeletonBase className="h-6 w-32 mb-4" />
          <SkeletonBase className="h-4 w-full mb-2" />
          <SkeletonBase className="h-4 w-full mb-2" />
          <SkeletonBase className="h-4 w-3/4" />
        </div>
        
        {/* Modules */}
        <div>
          <SkeletonBase className="h-6 w-48 mb-4" />
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-lg p-4 mb-3">
              <SkeletonBase className="h-5 w-2/3 mb-3" />
              <div className="space-y-2">
                {[1, 2, 3].map(j => (
                  <div key={j} className="flex items-center space-x-3">
                    <SkeletonBase className="h-4 w-4" />
                    <SkeletonBase className="h-4 w-1/2" />
                    <SkeletonBase className="h-3 w-12" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Sidebar */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <SkeletonBase className="h-10 w-full mb-4" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <SkeletonBase className="h-4 w-16" />
              <SkeletonBase className="h-4 w-20" />
            </div>
            <div className="flex justify-between">
              <SkeletonBase className="h-4 w-20" />
              <SkeletonBase className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <SkeletonBase className="h-4 w-24" />
              <SkeletonBase className="h-4 w-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * List skeleton for generic content
 */
export const ListSkeleton: React.FC<{ 
  items?: number;
  showImage?: boolean;
}> = ({ items = 5, showImage = false }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow">
        {showImage && <SkeletonBase className="h-12 w-12 rounded" />}
        <div className="flex-1">
          <SkeletonBase className="h-5 w-3/4 mb-2" />
          <SkeletonBase className="h-4 w-1/2" />
        </div>
        <SkeletonBase className="h-8 w-20" />
      </div>
    ))}
  </div>
);

/**
 * Table skeleton for admin interfaces
 */
export const TableSkeleton: React.FC<{ 
  rows?: number;
  columns?: number;
}> = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    {/* Header */}
    <div className="bg-gray-50 p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonBase key={i} className="h-5 w-24" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, j) => (
              <SkeletonBase key={j} className="h-4 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Loading wrapper that shows skeleton while loading
 */
export const LoadingWrapper: React.FC<{
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ isLoading, skeleton, children, fallback }) => {
  if (isLoading) {
    return <>{skeleton}</>;
  }
  
  if (fallback && !children) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// ===============================================
// OPTIMIZED PAGE LOADING PATTERNS
// ===============================================

/**
 * Progressive loading hook
 */
export function useProgressiveLoading<T>(
  fetchFn: () => Promise<T>
) {
  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    
    setIsLoading(true);
    setError(null);
    
    fetchFn()
      .then(result => {
        if (!cancelled) {
          setData(result);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, [fetchFn]);

  return { data, isLoading, error };
}

/**
 * Staggered loading for lists
 */
export function useStaggeredLoading<T>(
  items: T[],
  delay = 50
) {
  const [visibleCount, setVisibleCount] = React.useState(3);
  
  React.useEffect(() => {
    if (visibleCount < items.length) {
      const timer = setTimeout(() => {
        setVisibleCount(prev => Math.min(prev + 3, items.length));
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [visibleCount, items.length, delay]);
  
  return items.slice(0, visibleCount);
}
