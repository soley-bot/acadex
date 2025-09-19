'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamic imports for heavy admin components - Week 2 Day 4 optimization
const CourseFormComponent = dynamic(
  () => import('@/components/admin/CourseForm').then(mod => ({ default: mod.CourseForm })),
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

const EnhancedQuestionCreationComponent = dynamic(
  () => import('@/components/admin/EnhancedQuestionCreation').then(mod => ({ default: mod.EnhancedQuestionCreation })),
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

const TemplateEditorComponent = dynamic(
  () => import('@/components/admin/TemplateEditor'),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Template Editor...</span>
      </div>
    ),
    ssr: false
  }
)

const TemplateLibraryComponent = dynamic(
  () => import('@/components/admin/TemplateLibrary'),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Template Library...</span>
      </div>
    ),
    ssr: false
  }
)

const SecurityDashboardComponent = dynamic(
  () => import('@/components/admin/SecurityDashboard'),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Security Dashboard...</span>
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

  EnhancedQuestionCreation: (props: any) => (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Question Editor...</span>
      </div>
    }>
      <EnhancedQuestionCreationComponent {...props} />
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
  ),

  TemplateEditor: (props: any) => (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Template Editor...</span>
      </div>
    }>
      <TemplateEditorComponent {...props} />
    </Suspense>
  ),

  TemplateLibrary: (props: any) => (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Template Library...</span>
      </div>
    }>
      <TemplateLibraryComponent {...props} />
    </Suspense>
  ),

  SecurityDashboard: (props: any) => (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Security Dashboard...</span>
      </div>
    }>
      <SecurityDashboardComponent {...props} />
    </Suspense>
  )
}

// Export individual components for direct use if needed
export {
  CourseFormComponent,
  CategoryManagementComponent,
  EnhancedQuestionCreationComponent,
  QuizBuilderComponent,
  QuizAnalyticsComponent,
  TemplateEditorComponent,
  TemplateLibraryComponent,
  SecurityDashboardComponent
}