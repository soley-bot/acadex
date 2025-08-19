'use client'

import React, { lazy, Suspense } from 'react'

// Lazy load heavy admin components - only the ones that exist
const QuizForm = lazy(() => import('./QuizForm').then(module => ({ default: module.QuizForm })))
const EnhancedAPICourseForm = lazy(() => import('./EnhancedAPICourseForm').then(module => ({ default: module.EnhancedAPICourseForm })))
const AICourseBuilder = lazy(() => import('./AICourseBuilder').then(module => ({ default: module.AICourseBuilder })))
const AIQuizGenerator = lazy(() => import('./AIQuizGenerator').then(module => ({ default: module.AIQuizGenerator })))

// Loading components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600">Loading...</span>
  </div>
)

interface LazyComponentLoaderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

function DefaultLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-500">Loading component...</p>
      </div>
    </div>
  )
}

export function LazyComponentLoader({ children, fallback }: LazyComponentLoaderProps) {
  return (
    <Suspense fallback={fallback || <DefaultLoadingFallback />}>
      {children}
    </Suspense>
  )
}

// Pre-configured lazy components with optimized loading
export function LazyQuizForm(props: any) {
  return (
    <LazyComponentLoader>
      <QuizForm {...props} />
    </LazyComponentLoader>
  )
}

export function LazyEnhancedAPICourseForm(props: any) {
  return (
    <LazyComponentLoader>
      <EnhancedAPICourseForm {...props} />
    </LazyComponentLoader>
  )
}

export function LazyAICourseBuilder(props: any) {
  return (
    <LazyComponentLoader>
      <AICourseBuilder {...props} />
    </LazyComponentLoader>
  )
}

export function LazyAIQuizGenerator(props: any) {
  return (
    <LazyComponentLoader>
      <AIQuizGenerator {...props} />
    </LazyComponentLoader>
  )
}

// Optimized modal wrapper that only loads content when opened
interface LazyModalProps {
  isOpen: boolean
  onClose: () => void
  component: 'quiz' | 'course' | 'ai-builder' | 'ai-quiz'
  props?: any
}

export function LazyModal({ isOpen, onClose, component, props = {} }: LazyModalProps) {
  if (!isOpen) return null

  const componentMap = {
    quiz: LazyQuizForm,
    course: LazyEnhancedAPICourseForm,
    'ai-builder': LazyAICourseBuilder,
    'ai-quiz': LazyAIQuizGenerator,
  }

  const Component = componentMap[component]

  return <Component isOpen={isOpen} onClose={onClose} {...props} />
}
