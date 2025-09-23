/**
 * Quiz Progress API Endpoint
 * Week 2 Day 2: Auto-save progress for optimistic updates
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAuthenticatedClient, verifyAuthentication } from '@/lib/api-auth'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const { quizId, userId, answers, currentQuestion } = await request.json()
    
    // Validate required fields
    if (!quizId || !userId || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
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
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Save or update quiz progress
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
      logger.error('Failed to save quiz progress', { error, quizId, userId })
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
    
  } catch (error) {
    logger.error('Quiz progress API error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const quizId = searchParams.get('quizId')
    const userId = searchParams.get('userId')
    
    if (!quizId || !userId) {
      return NextResponse.json(
        { error: 'Missing quizId or userId' },
        { status: 400 }
      )
    }
    
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
    } catch (error) {
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
      logger.error('Failed to get quiz progress', { error, quizId, userId })
      return NextResponse.json(
        { error: 'Failed to get progress' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      progress: data || null,
      hasProgress: !!data
    })
    
  } catch (error) {
    logger.error('Quiz progress GET API error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}