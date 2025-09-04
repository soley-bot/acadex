import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, createServiceClient } from '@/lib/api-auth'

// GET /api/admin/quizzes/[id] - Fetch quiz with questions for editing
export const GET = withAdminAuth(async (
  request: NextRequest,
  user
) => {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 }
      )
    }

    // Use service role for admin access
    const supabase = createServiceClient()

    // Fetch quiz with questions
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        *,
        quiz_questions (
          id,
          question,
          question_type,
          options,
          correct_answer,
          correct_answer_text,
          correct_answer_json,
          explanation,
          order_index,
          points,
          difficulty_level,
          image_url,
          audio_url,
          video_url,
          tags,
          time_limit_seconds,
          required,
          randomize_options,
          partial_credit
        )
      `)
      .eq('id', id)
      .single()

    if (quizError) {
      console.error('Error fetching quiz:', quizError)
      return NextResponse.json(
        { error: 'Failed to fetch quiz', details: quizError.message },
        { status: 500 }
      )
    }

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Transform the data to match QuizWithQuestions interface
    const transformedQuiz = {
      ...quiz,
      questions: quiz.quiz_questions || []
    }

    // Remove the raw quiz_questions to avoid confusion
    delete transformedQuiz.quiz_questions

    // Debug logging
    console.log('Quiz fetched successfully:', {
      id: transformedQuiz.id,
      title: transformedQuiz.title,
      questionsCount: transformedQuiz.questions.length,
      rawQuestionsCount: quiz.quiz_questions?.length || 0
    })

    return NextResponse.json(transformedQuiz)

  } catch (error) {
    console.error('Unexpected error in quiz fetch:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
})

// PUT /api/admin/quizzes/[id] - Update quiz
export const PUT = withAdminAuth(async (
  request: NextRequest,
  user
) => {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    const body = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 }
      )
    }

    // Use service role for admin access
    const supabase = createServiceClient()

    // Update quiz
    const { data: quiz, error: updateError } = await supabase
      .from('quizzes')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating quiz:', updateError)
      return NextResponse.json(
        { error: 'Failed to update quiz', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(quiz)

  } catch (error) {
    console.error('Unexpected error in quiz update:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
})

// DELETE /api/admin/quizzes/[id] - Delete quiz
export const DELETE = withAdminAuth(async (
  request: NextRequest,
  user
) => {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 }
      )
    }

    // Use service role for admin access
    const supabase = createServiceClient()

    // Delete quiz (cascade will handle questions)
    const { error: deleteError } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting quiz:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete quiz', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Unexpected error in quiz deletion:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
})
