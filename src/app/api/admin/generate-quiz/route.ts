import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'
import { AIQuizGenerator } from '@/lib/ai-quiz-generator'

export async function GET() {
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
    
    // Note: Service role key bypasses RLS and provides admin access
    // No session authentication needed when using service role key

    // Test AI connection
    const generator = new AIQuizGenerator()
    const testResult = await generator.testConnection()
    
    return NextResponse.json({
      success: testResult.success,
      message: testResult.success ? 'AI API connection successful' : testResult.error
    })
  } catch (error: any) {
    logger.error('API test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to test API connection'
    }, { status: 500 })
  }
}export async function POST(request: NextRequest) {
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
    
    // Note: Service role key bypasses RLS and provides admin access
    // No session authentication needed when using service role key

    const requestData = await request.json()
    
    // Validate request data
    if (!requestData.title || !requestData.topic || !requestData.category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, topic, and category are required' },
        { status: 400 }
      )
    }

    if (!requestData.question_types || requestData.question_types.length === 0) {
      return NextResponse.json(
        { error: 'At least one question type must be selected' },
        { status: 400 }
      )
    }

    if (requestData.question_count < 3 || requestData.question_count > 50) {
      return NextResponse.json(
        { error: 'Question count must be between 3 and 50' },
        { status: 400 }
      )
    }

    // Generate quiz using AI
    logger.info('Starting AI quiz generation', { title: requestData.title, questionCount: requestData.question_count })
    
    const generator = new AIQuizGenerator()
    const result = await generator.generateQuiz(requestData)

    logger.info('AI generation completed', { success: result.success, hasQuiz: !!result.quiz })

    if (!result.success) {
      logger.error('AI generation failed', { error: result.error })
      return NextResponse.json(
        { error: result.error || 'Failed to generate quiz' },
        { status: 500 }
      )
    }

    logger.info('Returning successful quiz response', { questionsCount: result.quiz?.questions?.length })
    return NextResponse.json(result.quiz)
  } catch (error: any) {
    logger.error('Quiz generation error:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
