// AI Model Configuration and Performance Guide
// Updated for January 2025 with latest model capabilities

export interface ModelConfig {
  name: string
  provider: 'gemini' | 'claude' | 'openai'
  modelId: string
  description: string
  strengths: string[]
  pricing: {
    input: number // per 1M tokens
    output: number // per 1M tokens
  }
  context_window: number
  recommended_for: string[]
  stability: 'stable' | 'preview' | 'experimental'
}

export const AI_MODELS_2025: Record<string, ModelConfig> = {
  // Google Gemini Models (Recommended)
  'gemini-2.5-pro': {
    name: 'Gemini 2.5 Pro',
    provider: 'gemini',
    modelId: 'gemini-2.5-pro',
    description: 'Most powerful thinking model with maximum response accuracy',
    strengths: [
      'Enhanced thinking and reasoning',
      'Multimodal understanding',
      'Advanced coding capabilities',
      'Complex problem solving',
      'Educational content generation'
    ],
    pricing: {
      input: 1.25, // $1.25 per 1M tokens
      output: 5.00  // $5.00 per 1M tokens
    },
    context_window: 2000000, // 2M tokens
    recommended_for: [
      'Complex quiz generation',
      'Multi-subject content',
      'Advanced reasoning questions',
      'STEM subjects',
      'Educational assessments'
    ],
    stability: 'stable'
  },

  'gemini-2.5-flash': {
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    modelId: 'gemini-2.5-flash',
    description: 'Best price-performance ratio with adaptive thinking',
    strengths: [
      'Cost-efficient',
      'Fast generation',
      'Adaptive thinking',
      'High volume tasks',
      'Good reasoning'
    ],
    pricing: {
      input: 0.075, // $0.075 per 1M tokens
      output: 0.30   // $0.30 per 1M tokens
    },
    context_window: 1000000, // 1M tokens
    recommended_for: [
      'High-volume quiz generation',
      'Simple to moderate complexity',
      'Cost-sensitive applications',
      'Real-time generation'
    ],
    stability: 'stable'
  },

  'gemini-2.5-flash-lite': {
    name: 'Gemini 2.5 Flash-Lite',
    provider: 'gemini',
    modelId: 'gemini-2.5-flash-lite',
    description: 'Most cost-efficient with high throughput',
    strengths: [
      'Lowest cost',
      'High throughput',
      'Low latency',
      'Simple tasks'
    ],
    pricing: {
      input: 0.0375, // $0.0375 per 1M tokens
      output: 0.15    // $0.15 per 1M tokens
    },
    context_window: 1000000, // 1M tokens
    recommended_for: [
      'Simple quiz generation',
      'Basic Q&A format',
      'High-volume basic content',
      'Budget-conscious projects'
    ],
    stability: 'stable'
  },

  // Claude Models (Alternative Option)
  'claude-3.5-sonnet': {
    name: 'Claude 3.5 Sonnet',
    provider: 'claude',
    modelId: 'claude-3-5-sonnet-20241022',
    description: 'Superior reasoning and instruction following',
    strengths: [
      'Excellent reasoning',
      'Superior code generation',
      'Better instruction following',
      'Reliable outputs',
      'Creative problem solving'
    ],
    pricing: {
      input: 3.00,  // $3.00 per 1M tokens
      output: 15.00 // $15.00 per 1M tokens
    },
    context_window: 200000, // 200k tokens
    recommended_for: [
      'Complex programming quizzes',
      'Creative content generation',
      'Detailed explanations',
      'Advanced reasoning tasks'
    ],
    stability: 'stable'
  },

  // OpenAI Models (Alternative Option)
  'gpt-4o': {
    name: 'GPT-4o',
    provider: 'openai',
    modelId: 'gpt-4o',
    description: 'Multimodal capabilities with good reasoning',
    strengths: [
      'Multimodal support',
      'Good reasoning',
      'Established ecosystem',
      'Wide compatibility'
    ],
    pricing: {
      input: 5.00,  // $5.00 per 1M tokens
      output: 15.00 // $15.00 per 1M tokens
    },
    context_window: 128000, // 128k tokens
    recommended_for: [
      'Multimodal quiz content',
      'General-purpose generation',
      'Integration with existing OpenAI tools'
    ],
    stability: 'stable'
  }
}

export const MODEL_RECOMMENDATIONS = {
  // Best overall choice for 2025
  BEST_OVERALL: 'gemini-2.5-pro',
  
  // Best for specific use cases
  BEST_PRICE_PERFORMANCE: 'gemini-2.5-flash',
  BEST_BUDGET: 'gemini-2.5-flash-lite',
  BEST_REASONING: 'claude-3.5-sonnet',
  BEST_CODING: 'claude-3.5-sonnet',
  BEST_MULTIMODAL: 'gemini-2.5-pro',
  
  // Deprecated models to avoid
  DEPRECATED: [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash-8b',
    'gemini-2.0-flash-exp' // experimental, not stable
  ]
}

export function getRecommendedModel(useCase: string, budget: 'low' | 'medium' | 'high' = 'medium'): string {
  if (budget === 'low') {
    return MODEL_RECOMMENDATIONS.BEST_BUDGET
  }
  
  if (budget === 'high') {
    return MODEL_RECOMMENDATIONS.BEST_REASONING
  }
  
  // Medium budget - best overall choice
  const useCaseLower = useCase.toLowerCase()
  
  if (useCaseLower.includes('coding') || useCaseLower.includes('programming')) {
    return MODEL_RECOMMENDATIONS.BEST_CODING
  }
  
  if (useCaseLower.includes('math') || useCaseLower.includes('science') || useCaseLower.includes('complex')) {
    return MODEL_RECOMMENDATIONS.BEST_OVERALL
  }
  
  // Default to best price-performance
  return MODEL_RECOMMENDATIONS.BEST_PRICE_PERFORMANCE
}

export function getModelConfig(modelId: string): ModelConfig | null {
  return AI_MODELS_2025[modelId] || null
}

export function estimateCost(modelId: string, inputTokens: number, outputTokens: number): number {
  const config = getModelConfig(modelId)
  if (!config) return 0
  
  const inputCost = (inputTokens / 1000000) * config.pricing.input
  const outputCost = (outputTokens / 1000000) * config.pricing.output
  
  return inputCost + outputCost
}

export function isModelDeprecated(modelId: string): boolean {
  return MODEL_RECOMMENDATIONS.DEPRECATED.includes(modelId)
}

// Performance comparison for quick reference
export const PERFORMANCE_COMPARISON = {
  quiz_quality: {
    'gemini-2.5-pro': 95,
    'claude-3.5-sonnet': 90,
    'gemini-2.5-flash': 85,
    'gpt-4o': 80,
    'gemini-2.5-flash-lite': 75
  },
  cost_efficiency: {
    'gemini-2.5-flash-lite': 95,
    'gemini-2.5-flash': 90,
    'gemini-2.5-pro': 70,
    'gpt-4o': 50,
    'claude-3.5-sonnet': 40
  },
  reasoning_ability: {
    'claude-3.5-sonnet': 95,
    'gemini-2.5-pro': 90,
    'gemini-2.5-flash': 80,
    'gpt-4o': 75,
    'gemini-2.5-flash-lite': 65
  }
}
