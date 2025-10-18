import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-auth'
import { enhanceQuestions, AIEnhancementOptions } from '@/lib/import/ai-enhancer'
import { logger } from '@/lib/logger'

export const POST = withAdminAuth(async (request: NextRequest, user) => {
  try {
    logger.info('[AI Enhance] Request received', { adminUserId: user.id })

    // Parse request body
    const body = await request.json()
    const { questions, options } = body as {
      questions: Array<any & { rowIndex: number }>
      options: AIEnhancementOptions
    }

    // Validate input
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Questions array is required' },
        { status: 400 }
      )
    }

    if (!options) {
      return NextResponse.json(
        { error: 'Enhancement options are required' },
        { status: 400 }
      )
    }

    // Check if at least one AI provider is configured
    const provider = options.provider || 'claude'
    const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY
    const hasGeminiKey = !!process.env.GOOGLE_AI_API_KEY

    if (provider === 'claude' && !hasClaudeKey) {
      logger.error('[AI Enhance] ANTHROPIC_API_KEY not configured')
      return NextResponse.json(
        { error: 'Claude AI is not configured. Please add ANTHROPIC_API_KEY or switch to Gemini.' },
        { status: 503 }
      )
    }

    if (provider === 'gemini' && !hasGeminiKey) {
      logger.error('[AI Enhance] GOOGLE_AI_API_KEY not configured')
      return NextResponse.json(
        { error: 'Google Gemini is not configured. Please add GOOGLE_AI_API_KEY or switch to Claude.' },
        { status: 503 }
      )
    }

    logger.info('[AI Enhance] Processing questions', {
      count: questions.length,
      provider,
      options
    })

    // Enhance questions using AI with timeout
    logger.info('[AI Enhance] Starting enhancement...')

    const enhancePromise = enhanceQuestions(questions, options)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI enhancement timed out after 60 seconds')), 60000)
    )

    const enhanced = await Promise.race([enhancePromise, timeoutPromise]) as any

    logger.info('[AI Enhance] Enhancement returned', {
      enhancedCount: enhanced?.length || 0
    })

    // Calculate statistics
    const stats = {
      total: enhanced.length,
      enhanced: enhanced.filter((q: any) => {
        const e = q.aiEnhancement
        return e && (e.explanation || e.tags || e.difficulty || (e.warnings && e.warnings.length > 0))
      }).length,
      explanationsAdded: enhanced.filter((q: any) => q.aiEnhancement?.explanation).length,
      tagsAdded: enhanced.filter((q: any) => q.aiEnhancement?.tags && q.aiEnhancement.tags.length > 0).length,
      difficultyAdded: enhanced.filter((q: any) => q.aiEnhancement?.difficulty).length,
      warningsFound: enhanced.filter((q: any) => q.aiEnhancement?.warnings && q.aiEnhancement.warnings.length > 0).length
    }

    logger.info('[AI Enhance] Enhancement complete', stats)

    // Debug log the actual enhanced questions
    enhanced.forEach((q: any, i: number) => {
      if (q.aiEnhancement) {
        logger.info(`[AI Enhance] Question ${i + 1} enhancement:`, {
          rowIndex: q.rowIndex,
          hasExplanation: !!q.aiEnhancement.explanation,
          hasTags: !!q.aiEnhancement.tags,
          hasDifficulty: !!q.aiEnhancement.difficulty,
          explanation: q.aiEnhancement.explanation?.substring(0, 50),
          tags: q.aiEnhancement.tags
        })
      }
    })

    return NextResponse.json({
      success: true,
      questions: enhanced,
      stats
    })

  } catch (error: any) {
    logger.error('[AI Enhance] Error', {
      error: error.message,
      stack: error.stack
    })

    return NextResponse.json(
      {
        error: error.message || 'AI enhancement failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
})
