import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('Testing quiz table schema...')
    
    // Test the actual quiz table schema
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('*')
      .limit(1)

    if (quizzesError) {
      console.error('Quiz table error:', quizzesError)
      return NextResponse.json({ 
        error: 'Quiz table error', 
        details: quizzesError,
        message: 'Check the quiz table schema in your database'
      }, { status: 500 })
    }

    console.log('Quiz table test successful:', quizzes)
    
    return NextResponse.json({
      success: true,
      message: 'Quiz table accessible',
      sampleQuiz: quizzes?.[0] || null,
      quizCount: quizzes?.length || 0
    })

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 })
  }
}
