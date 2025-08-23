import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('Testing quiz API without auth...')
    
    // Test the quiz API query
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select(`
        id,
        title,
        description,
        category,
        difficulty,
        duration_minutes,
        total_questions,
        passing_score,
        max_attempts,
        time_limit_minutes,
        is_published,
        created_at,
        updated_at,
        image_url,
        course_id,
        lesson_id
      `)
      .limit(5)

    if (quizzesError) {
      console.error('Quiz API query error:', quizzesError)
      return NextResponse.json({ 
        error: 'Quiz API query error', 
        details: quizzesError
      }, { status: 500 })
    }

    console.log('Quiz API test successful, found', quizzes?.length, 'quizzes')
    
    return NextResponse.json({
      success: true,
      message: 'Quiz API query working',
      quizzes: quizzes || [],
      count: quizzes?.length || 0
    })

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 })
  }
}
