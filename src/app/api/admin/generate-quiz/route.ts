import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'
import { quizGenerationService, testAIConnection } from '@/lib/ai-services'

export async function GET() {
  try {
    // Test AI connection using the new service
    const testResult = await testAIConnection()
    
    return NextResponse.json({
      success: testResult.success,
      message: testResult.success 
        ? `AI service (${testResult.provider}) connection successful`
        : testResult.error
    })
  } catch (error: any) {
    logger.error('API test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to test API connection'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Handle setting cookies in API routes
          },
          remove(name: string, options: any) {
            // Handle removing cookies in API routes
          },
        },
      }
    )

    const requestData = await request.json()
    
    // Simplified validation - only check essential fields
    if (!requestData.topic || !requestData.topic.trim()) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    if (!requestData.question_count || requestData.question_count < 3 || requestData.question_count > 20) {
      return NextResponse.json(
        { error: 'Question count must be between 3 and 20' },
        { status: 400 }
      )
    }

    if (!requestData.difficulty || !['beginner', 'intermediate', 'advanced'].includes(requestData.difficulty)) {
      return NextResponse.json(
        { error: 'Valid difficulty level is required' },
        { status: 400 }
      )
    }

    // Generate quiz using the new AI service
    logger.info('Starting AI quiz generation with new service', { 
      topic: requestData.topic, 
      questionCount: requestData.question_count,
      difficulty: requestData.difficulty
    })
    
    const result = await quizGenerationService.generateQuiz({
      topic: requestData.topic,
      questionCount: requestData.question_count,
      difficulty: requestData.difficulty,
      questionTypes: ['multiple_choice', 'true_false']
    })

    if (!result.success) {
      logger.error('AI quiz generation failed', { error: result.error })
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    logger.info('AI quiz generation successful', { 
      questionsGenerated: result.quiz?.questions?.length 
    })

    return NextResponse.json({
      success: true,
      quiz: result.quiz
    })
    
  } catch (error: any) {
    logger.error('Quiz generation API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate quiz'
    }, { status: 500 })
  }
}
