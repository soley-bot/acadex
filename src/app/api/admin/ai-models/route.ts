import { NextRequest, NextResponse } from 'next/server'
import { AI_MODELS_2025, MODEL_RECOMMENDATIONS, getRecommendedModel, getModelConfig } from '@/lib/ai-model-config'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'models':
        return NextResponse.json({
          success: true,
          models: AI_MODELS_2025,
          recommendations: MODEL_RECOMMENDATIONS,
          current_best: MODEL_RECOMMENDATIONS.BEST_OVERALL
        })

      case 'recommendation':
        const useCase = searchParams.get('useCase') || 'general'
        const budget = searchParams.get('budget') as 'low' | 'medium' | 'high' || 'medium'
        
        const recommended = getRecommendedModel(useCase, budget)
        const config = getModelConfig(recommended)
        
        return NextResponse.json({
          success: true,
          recommended_model: recommended,
          config,
          reason: `Best choice for ${useCase} with ${budget} budget`
        })

      case 'compare':
        const models = searchParams.get('models')?.split(',') || []
        const comparison = models.map(modelId => {
          const config = getModelConfig(modelId)
          return {
            model: modelId,
            config,
            deprecated: MODEL_RECOMMENDATIONS.DEPRECATED.includes(modelId)
          }
        })
        
        return NextResponse.json({
          success: true,
          comparison
        })

      default:
        return NextResponse.json({
          success: true,
          available_actions: ['models', 'recommendation', 'compare'],
          examples: {
            all_models: '/api/admin/ai-models?action=models',
            get_recommendation: '/api/admin/ai-models?action=recommendation&useCase=programming&budget=medium',
            compare_models: '/api/admin/ai-models?action=compare&models=gemini-2.5-pro,claude-3.5-sonnet'
          }
        })
    }
  } catch (error: any) {
    logger.error('AI models API error', { error: error?.message || 'Unknown error' })
    return NextResponse.json({
      success: false,
      error: 'Failed to process AI models request'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'test_model':
        const { modelId, testPrompt } = params
        
        // This would test a specific model with a simple prompt
        // Implementation depends on your AI service setup
        
        return NextResponse.json({
          success: true,
          message: `Model test feature would test ${modelId} with: "${testPrompt}"`,
          note: 'Implement actual model testing based on your requirements'
        })

      case 'estimate_cost':
        const { model, inputTokens, outputTokens } = params
        const config = getModelConfig(model)
        
        if (!config) {
          return NextResponse.json({
            success: false,
            error: `Unknown model: ${model}`
          }, { status: 400 })
        }
        
        const inputCost = (inputTokens / 1000000) * config.pricing.input
        const outputCost = (outputTokens / 1000000) * config.pricing.output
        const totalCost = inputCost + outputCost
        
        return NextResponse.json({
          success: true,
          cost_breakdown: {
            input_cost: inputCost,
            output_cost: outputCost,
            total_cost: totalCost,
            currency: 'USD'
          },
          model_info: {
            name: config.name,
            provider: config.provider
          }
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action'
        }, { status: 400 })
    }
  } catch (error: any) {
    logger.error('AI models POST API error', { error: error?.message || 'Unknown error' })
    return NextResponse.json({
      success: false,
      error: 'Failed to process AI models request'
    }, { status: 500 })
  }
}
