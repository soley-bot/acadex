/**
 * Quiz Progress API Endpoint
 * Enhanced with security validations and data integrity checks
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAuthenticatedClient, verifyAuthentication } from '@/lib/api-auth'
import { logger } from '@/lib/logger'

// Input validation helpers
function validateQuizProgressData(data: any) {
  const { quizId, userId, answers, currentQuestion } = data

  // Basic required field validation
  if (!quizId || !userId || !answers) {
    throw new Error('Missing required fields: quizId, userId, or answers')
  }

  // Validate UUID formats
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(quizId) || !uuidRegex.test(userId)) {
    throw new Error('Invalid ID format')
  }

  // Validate answers structure and size
  if (typeof answers !== 'object' || answers === null) {
    throw new Error('Answers must be a valid object')
  }

  // Limit answers object size to prevent DoS
  const answersString = JSON.stringify(answers)
  if (answersString.length > 100000) { // 100KB limit
    throw new Error('Answers data too large')
  }

  // Validate currentQuestion if provided
  if (currentQuestion !== undefined && (typeof currentQuestion !== 'number' || currentQuestion < 0)) {
    throw new Error('Current question must be a non-negative number')
  }

  return { quizId, userId, answers, currentQuestion }
}

function validateQueryParams(searchParams: URLSearchParams) {
  const quizId = searchParams.get('quizId')
  const userId = searchParams.get('userId')

  if (!quizId || !userId) {
    throw new Error('Missing quizId or userId parameters')
  }

  // Validate UUID formats
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(quizId) || !uuidRegex.test(userId)) {
    throw new Error('Invalid parameter format')
  }

  return { quizId, userId }
}

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json()
    
    // Validate and sanitize input data
    const { quizId, userId, answers, currentQuestion } = validateQuizProgressData(requestData)
    
    const supabase = createAuthenticatedClient(request)
    
    // Verify user is authenticated and matches the userId
    try {
      const authenticatedUser = await verifyAuthentication(supabase)
      if (authenticatedUser.id !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized: User ID mismatch' },
          { status: 403 }
        )
      }
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Additional validation: Check if quiz exists and is published
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id, is_published, max_attempts')
      .eq('id', quizId)
      .eq('is_published', true)
      .single()

    if (quizError || !quiz) {
      return NextResponse.json(
        { error: 'Quiz not found or not available' },
        { status: 404 }
      )
    }

    // Save or update quiz progress using UPSERT for data integrity
    const { data, error } = await supabase
      .from('quiz_progress')
      .upsert({
        quiz_id: quizId,
        user_id: userId,
        answers: answers,
        current_question: currentQuestion || 0,
        last_saved: new Date().toISOString(),
        is_completed: false
      }, {
        onConflict: 'quiz_id,user_id'
      })
      .select()

    if (error) {
      logger.error('Failed to save quiz progress', { 
        error: error.message, 
        quizId, 
        userId,
        errorCode: error.code 
      })
      return NextResponse.json(
        { error: 'Failed to save progress' },
        { status: 500 }
      )
    }

    logger.info('Quiz progress saved', { 
      quizId, 
      userId, 
      questionCount: Object.keys(answers).length,
      currentQuestion 
    })

    return NextResponse.json({ 
      success: true,
      progress: data[0],
      savedAt: new Date().toISOString()
    })

  } catch (error: any) {
    logger.error('Quiz progress API error', { 
      error: error.message,
      stack: error.stack 
    })
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 400 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Validate and sanitize query parameters
    const { quizId, userId } = validateQueryParams(searchParams)
    
    const supabase = createAuthenticatedClient(request)
    
    // Verify user is authenticated and matches the userId
    try {
      const authenticatedUser = await verifyAuthentication(supabase)
      if (authenticatedUser.id !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized: User ID mismatch' },
          { status: 403 }
        )
      }
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get saved quiz progress
    const { data, error } = await supabase
      .from('quiz_progress')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('user_id', userId)
      .eq('is_completed', false)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found is OK
      logger.error('Failed to get quiz progress', { 
        error: error.message, 
        quizId, 
        userId,
        errorCode: error.code 
      })
      return NextResponse.json(
        { error: 'Failed to get progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      progress: data || null,
      hasProgress: !!data
    })

  } catch (error: any) {
    logger.error('Quiz progress GET API error', { 
      error: error.message,
      stack: error.stack 
    })
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 400 }
    )
  }
}