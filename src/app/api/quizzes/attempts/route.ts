import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { getAuth } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const { data: { user } } = await getAuth(cookieStore)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { lesson_id, quiz_id, total_questions, answers, score, time_taken_seconds, passed, percentage_score, attempt_number } = body

    // Basic validation
    if (!lesson_id || !quiz_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: attempt, error } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        lesson_id,
        quiz_id,
        total_questions,
        answers,
        score,
        time_taken_seconds,
        passed,
        percentage_score,
        attempt_number,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      logger.error('Error saving quiz attempt:', error)
      return NextResponse.json({ error: 'Failed to save quiz attempt' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: attempt }, { status: 201 })

  } catch (error) {
    logger.error('Error processing quiz attempt request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
