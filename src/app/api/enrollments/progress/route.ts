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
    const { course_id, lesson_id } = body

    if (!course_id || !lesson_id) {
      return NextResponse.json({ error: 'Missing course_id or lesson_id' }, { status: 400 })
    }

    const { error } = await supabase
      .from('enrollments')
      .update({
        current_lesson_id: lesson_id,
        last_accessed_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('course_id', course_id)

    if (error) {
      logger.error('Error updating enrollment progress:', error)
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    logger.error('Error processing enrollment progress request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
