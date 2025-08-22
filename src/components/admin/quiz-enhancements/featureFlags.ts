/**
 * Feature Flags for Quiz Form Enhancements
 * Controls which enhanced features are enabled
 */

interface FeatureFlags {
  // Phase 1: Foundation & Type Safety
  enableFoundation: boolean
  enableEnhancedValidation: boolean
  enableMonitoring: boolean
  
  // Phase 2: Enhanced Question Cards & Visual Improvements  
  enableEnhancedCards: boolean
  enableVisualImprovements: boolean
  enableProgressIndicators: boolean
  
  // Phase 3: Smart Question Flow & Templates
  enableSmartFlow: boolean
  enableTemplates: boolean
  enableBulkOperations: boolean
  enableSmartSuggestions: boolean
  
  // Debug & Development
  enableDebugMode: boolean
  enablePerformanceLogging: boolean
}

export const featureFlags: FeatureFlags = {
  // Phase 1: Foundation & Type Safety (ENABLED)
  enableFoundation: true,
  enableEnhancedValidation: true, 
  enableMonitoring: true,
  
  // Phase 2: Enhanced Question Cards & Visual Improvements (NOW ENABLED!)
  enableEnhancedCards: true,
  enableVisualImprovements: true,
  enableProgressIndicators: true,
  
  // Phase 3: Smart Question Flow & Templates (DISABLED for now)
  enableSmartFlow: false,
  enableTemplates: false,
  enableBulkOperations: false,
  enableSmartSuggestions: false,
  
  // Debug & Development
  enableDebugMode: process.env.NODE_ENV === 'development',
  enablePerformanceLogging: false
}

/**
 * Utility function to check if any enhancement phase is enabled
 */
export const isAnyPhaseEnabled = (): boolean => {
  return featureFlags.enableFoundation || 
         featureFlags.enableEnhancedCards || 
         featureFlags.enableSmartFlow
}

/**
 * Get enabled phases for logging/monitoring
 */
export const getEnabledPhases = (): string[] => {
  const phases: string[] = []
  if (featureFlags.enableFoundation) phases.push('Phase1-Foundation')
  if (featureFlags.enableEnhancedCards) phases.push('Phase2-EnhancedCards') 
  if (featureFlags.enableSmartFlow) phases.push('Phase3-SmartFlow')
  return phases
}
