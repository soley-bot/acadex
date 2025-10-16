'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamic imports for heavy admin components - Week 2 Day 4 optimization
const CourseFormComponent = dynamic(
  () => import('@/components/admin/course-form/CourseForm').then(mod => ({ default: mod.CourseForm })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Course Form...</span>
      </div>
    ),
    ssr: false
  }
)

const CategoryManagementComponent = dynamic(
  () => import('@/components/admin/CategoryManagement').then(mod => ({ default: mod.CategoryManagement })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Category Management...</span>
      </div>
    ),
    ssr: false
  }
)

const QuestionCreationComponent = dynamic(
  () => import('@/components/admin/QuestionCreation').then(mod => ({ default: mod.QuestionCreation })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Question Editor...</span>
      </div>
    ),
    ssr: false
  }
)

const QuizBuilderComponent = dynamic(
  () => import('@/components/admin/QuizBuilder').then(mod => ({ default: mod.QuizBuilder })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Quiz Builder...</span>
      </div>
    ),
    ssr: false
  }
)

const QuizAnalyticsComponent = dynamic(
  () => import('@/components/admin/QuizAnalytics').then(mod => ({ default: mod.QuizAnalytics })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Quiz Analytics...</span>
      </div>
    ),
    ssr: false
  }
)


// Component wrapper with Suspense boundaries
export const LazyComponents = {
  CourseForm: (props: any) => (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Course Form...</span>
      </div>
    }>
      <CourseFormComponent {...props} />
    </Suspense>
  ),
  
  CategoryManagement: (props: any) => (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Category Management...</span>
      </div>
    }>
      <CategoryManagementComponent {...props} />
    </Suspense>
  ),

  QuestionCreation: (props: any) => (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Question Editor...</span>
      </div>
    }>
      <QuestionCreationComponent {...props} />
    </Suspense>
  ),

  QuizBuilder: (props: any) => (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Quiz Builder...</span>
      </div>
    }>
      <QuizBuilderComponent {...props} />
    </Suspense>
  ),

  QuizAnalytics: (props: any) => (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Quiz Analytics...</span>
      </div>
    }>
      <QuizAnalyticsComponent {...props} />
    </Suspense>
  )
}

// Export individual components for direct use if needed
export {
  CourseFormComponent,
  CategoryManagementComponent,
  QuestionCreationComponent,
  QuizBuilderComponent,
  QuizAnalyticsComponent
}
