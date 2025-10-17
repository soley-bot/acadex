import { NextRequest, NextResponse } from 'next/server'
import { SimpleAIQuizGenerator, SimpleQuizRequest, FrontendQuizData } from '@/lib/simple-ai-quiz-generator'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Extract and validate required fields
    const { topic, subject, questionCount, difficulty, questionTypes, language } = body
    
    // Basic validation
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Topic is required and must be a non-empty string'
      }, { status: 400 })
    }
    
    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Subject is required (e.g., Mathematics, Science, History, etc.)'
      }, { status: 400 })
    }
    
    const count = parseInt(questionCount)
    if (!count || count < 1 || count > 20) {
      return NextResponse.json({
        success: false,
        error: 'Question count must be between 1 and 20'
      }, { status: 400 })
    }
    
    if (!difficulty || !['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      return NextResponse.json({
        success: false,
        error: 'Difficulty must be one of: beginner, intermediate, advanced'
      }, { status: 400 })
    }
    
    // Build the request
    const quizRequest: SimpleQuizRequest = {
      topic: topic.trim(),
      subject: subject.trim(),
      questionCount: count,
      difficulty,
      questionTypes: Array.isArray(questionTypes) ? questionTypes : ['multiple_choice', 'true_false'],
      language: language || 'english'
    }
    
    logger.info('Simple quiz generation request', {
      topic: quizRequest.topic,
      subject: quizRequest.subject,
      questionCount: quizRequest.questionCount,
      difficulty: quizRequest.difficulty
    })
    
    // Generate the quiz using server-side instance
    const generator = new SimpleAIQuizGenerator()
    const result = await generator.generateQuiz(quizRequest)
    
    if (!result.success) {
      logger.error('Simple quiz generation failed', { error: result.error })
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to generate quiz'
      }, { status: 500 })
    }
    
    logger.info('Simple quiz generated successfully', {
      questionsGenerated: result.quiz?.questions?.length || 0
    })
    
    // Return the result
    const response: any = {
      success: true,
      quiz: result.quiz
    }
    
    // Include debug info if requested
    if (body.includeDebugInfo) {
      response.debug = result.debugInfo
    }
    
    return NextResponse.json(response)
    
  } catch (error: any) {
    logger.error('Simple quiz generation API error', { error: error?.message || 'Unknown error' })
    return NextResponse.json({
      success: false,
      error: 'Internal server error occurred during quiz generation'
    }, { status: 500 })
  }
}

// GET endpoint to test connection
export async function GET() {
  try {
    const generator = new SimpleAIQuizGenerator()
    const testResult = await generator.testConnection()
    
    return NextResponse.json({
      success: testResult.success,
      message: testResult.success 
        ? 'AI quiz generation service is working correctly'
        : 'AI quiz generation service has issues',
      error: testResult.error,
      availableOptions: {
        difficulties: ['beginner', 'intermediate', 'advanced'],
        questionTypes: ['multiple_choice', 'true_false'],
        maxQuestions: 20,
        supportedLanguages: ['english', 'spanish', 'french', 'indonesian', 'khmer']
      }
    })
    
  } catch (error: any) {
    logger.error('Simple quiz generation test failed', { error: error?.message || 'Unknown error' })
    return NextResponse.json({
      success: false,
      error: 'Failed to test AI service connection'
    }, { status: 500 })
  }
}
