// Feature Flags for QuizForm UX Improvements
// This system allows gradual rollout and instant rollback of new features

export interface FeatureFlags {
  // Phase 1: Foundation
  ENHANCED_QUIZ_VALIDATION: boolean
  NEW_QUESTION_TYPES: boolean
  
  // Phase 2: Visual Improvements  
  ENHANCED_QUESTION_CARDS: boolean
  QUESTION_TYPE_INDICATORS: boolean
  PROGRESS_INDICATORS: boolean
  
  // Phase 3: Progressive Disclosure
  PROGRESSIVE_DISCLOSURE: boolean
  SMART_QUESTION_STATES: boolean
  QUICK_EDIT_MODE: boolean
  
  // Phase 4: Advanced Features
  BULK_OPERATIONS: boolean
  ENHANCED_QUESTION_CREATION: boolean
  QUESTION_TEMPLATES: boolean
  
  // Phase 5: Polish & Optimization
  VIRTUALIZED_LISTS: boolean
  ADVANCED_ANIMATIONS: boolean
  PERFORMANCE_OPTIMIZATIONS: boolean
}

// Default feature flag configuration
const DEFAULT_FLAGS: FeatureFlags = {
  // Phase 1: Foundation (Safe to enable)
  ENHANCED_QUIZ_VALIDATION: true,
  NEW_QUESTION_TYPES: true,
  
  // Phase 2: Visual Improvements (Safe to enable)
  ENHANCED_QUESTION_CARDS: false,
  QUESTION_TYPE_INDICATORS: false, 
  PROGRESS_INDICATORS: false,
  
  // Phase 3: Progressive Disclosure (Gradual rollout)
  PROGRESSIVE_DISCLOSURE: false,
  SMART_QUESTION_STATES: false,
  QUICK_EDIT_MODE: false,
  
  // Phase 4: Advanced Features (Power user features)
  BULK_OPERATIONS: false,
  ENHANCED_QUESTION_CREATION: false,
  QUESTION_TEMPLATES: false,
  
  // Phase 5: Polish & Optimization (Performance features)
  VIRTUALIZED_LISTS: false,
  ADVANCED_ANIMATIONS: false,
  PERFORMANCE_OPTIMIZATIONS: false
}

// Get feature flags from environment with fallbacks
function getFeatureFlags(): FeatureFlags {
  if (typeof window === 'undefined') {
    // Server-side: Use environment variables
    return {
      ENHANCED_QUIZ_VALIDATION: process.env.NEXT_PUBLIC_FF_ENHANCED_VALIDATION === 'true' || DEFAULT_FLAGS.ENHANCED_QUIZ_VALIDATION,
      NEW_QUESTION_TYPES: process.env.NEXT_PUBLIC_FF_NEW_QUESTION_TYPES === 'true' || DEFAULT_FLAGS.NEW_QUESTION_TYPES,
      ENHANCED_QUESTION_CARDS: process.env.NEXT_PUBLIC_FF_ENHANCED_CARDS === 'true' || DEFAULT_FLAGS.ENHANCED_QUESTION_CARDS,
      QUESTION_TYPE_INDICATORS: process.env.NEXT_PUBLIC_FF_TYPE_INDICATORS === 'true' || DEFAULT_FLAGS.QUESTION_TYPE_INDICATORS,
      PROGRESS_INDICATORS: process.env.NEXT_PUBLIC_FF_PROGRESS_INDICATORS === 'true' || DEFAULT_FLAGS.PROGRESS_INDICATORS,
      PROGRESSIVE_DISCLOSURE: process.env.NEXT_PUBLIC_FF_PROGRESSIVE_DISCLOSURE === 'true' || DEFAULT_FLAGS.PROGRESSIVE_DISCLOSURE,
      SMART_QUESTION_STATES: process.env.NEXT_PUBLIC_FF_SMART_STATES === 'true' || DEFAULT_FLAGS.SMART_QUESTION_STATES,
      QUICK_EDIT_MODE: process.env.NEXT_PUBLIC_FF_QUICK_EDIT === 'true' || DEFAULT_FLAGS.QUICK_EDIT_MODE,
      BULK_OPERATIONS: process.env.NEXT_PUBLIC_FF_BULK_OPERATIONS === 'true' || DEFAULT_FLAGS.BULK_OPERATIONS,
      ENHANCED_QUESTION_CREATION: process.env.NEXT_PUBLIC_FF_ENHANCED_CREATION === 'true' || DEFAULT_FLAGS.ENHANCED_QUESTION_CREATION,
      QUESTION_TEMPLATES: process.env.NEXT_PUBLIC_FF_TEMPLATES === 'true' || DEFAULT_FLAGS.QUESTION_TEMPLATES,
      VIRTUALIZED_LISTS: process.env.NEXT_PUBLIC_FF_VIRTUALIZED_LISTS === 'true' || DEFAULT_FLAGS.VIRTUALIZED_LISTS,
      ADVANCED_ANIMATIONS: process.env.NEXT_PUBLIC_FF_ANIMATIONS === 'true' || DEFAULT_FLAGS.ADVANCED_ANIMATIONS,
      PERFORMANCE_OPTIMIZATIONS: process.env.NEXT_PUBLIC_FF_PERFORMANCE === 'true' || DEFAULT_FLAGS.PERFORMANCE_OPTIMIZATIONS
    }
  }
  
  // Client-side: Use defaults (can be extended with localStorage overrides for dev)
  return DEFAULT_FLAGS
}

// Create singleton feature flags instance
export const FEATURE_FLAGS = getFeatureFlags()

// Development helper for testing features locally
export function enableFeatureForDevelopment(feature: keyof FeatureFlags, enabled: boolean = true) {
  if (process.env.NODE_ENV === 'development') {
    (FEATURE_FLAGS as any)[feature] = enabled
    console.log(`🚀 Feature flag ${feature} ${enabled ? 'enabled' : 'disabled'} for development`)
  }
}

// Helper function to check if a feature is enabled
export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  return FEATURE_FLAGS[feature]
}

// Helper to check multiple features at once
export function useFeatureFlags(features: (keyof FeatureFlags)[]): Record<string, boolean> {
  return features.reduce((acc, feature) => {
    acc[feature] = FEATURE_FLAGS[feature]
    return acc
  }, {} as Record<string, boolean>)
}

// Conditional rendering helper
export function withFeatureFlag<T>(
  feature: keyof FeatureFlags, 
  component: T, 
  fallback?: T
): T | undefined {
  return FEATURE_FLAGS[feature] ? component : fallback
}

// Phase-based feature checks
export const PHASE_CHECKS = {
  isPhase1Ready: () => FEATURE_FLAGS.ENHANCED_QUIZ_VALIDATION && FEATURE_FLAGS.NEW_QUESTION_TYPES,
  isPhase2Ready: () => PHASE_CHECKS.isPhase1Ready() && FEATURE_FLAGS.ENHANCED_QUESTION_CARDS,
  isPhase3Ready: () => PHASE_CHECKS.isPhase2Ready() && FEATURE_FLAGS.PROGRESSIVE_DISCLOSURE,
  isPhase4Ready: () => PHASE_CHECKS.isPhase3Ready() && FEATURE_FLAGS.BULK_OPERATIONS,
  isPhase5Ready: () => PHASE_CHECKS.isPhase4Ready() && FEATURE_FLAGS.PERFORMANCE_OPTIMIZATIONS
}

// Export types for components
export type FeatureFlagKey = keyof FeatureFlags
