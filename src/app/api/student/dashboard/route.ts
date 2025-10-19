import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withServiceRole } from '@/lib/api-auth'

export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Ensure user can only access their own dashboard
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - can only access own dashboard' },
        { status: 403 }
      )
    }

    return withServiceRole(user, async (serviceClient) => {
      // Execute all queries in parallel for better performance
      const [coursesResult, quizResult] = await Promise.allSettled([
        // Fetch user courses with progress (fixed table name)
        serviceClient
          .from('enrollments')
          .select(`
            course_id,
            progress,
            last_accessed_at,
            enrolled_at,
            courses!inner (
              id,
              title,
              category,
              duration,
              level
            )
          `)
          .eq('user_id', userId)
          .order('last_accessed_at', { ascending: false, nullsFirst: false })
          .limit(5),
        
        // Fetch recent quiz attempts (fixed column name)
        serviceClient
          .from('quiz_attempts')
          .select(`
            id,
            score,
            total_questions,
            percentage_score,
            completed_at,
            quiz_id,
            attempt_number,
            quizzes!inner (
              id,
              title
            )
          `)
          .eq('user_id', userId)
          .not('completed_at', 'is', null)  // Only completed attempts
          .order('completed_at', { ascending: false })
          .limit(5)
      ])

      // Handle results with proper error handling
      const coursesData = coursesResult.status === 'fulfilled' ? coursesResult.value.data : []
      const coursesError = coursesResult.status === 'fulfilled' ? coursesResult.value.error : coursesResult.reason

      const quizData = quizResult.status === 'fulfilled' ? quizResult.value.data : []
      const quizError = quizResult.status === 'fulfilled' ? quizResult.value.error : quizResult.reason

      // Log errors but don't fail the request
      if (coursesError) {
        console.error('Error fetching user courses:', coursesError)
      }
      if (quizError) {
        console.error('Error fetching quiz attempts:', quizError)
      }

      // Debug logging for data received
      console.log('Dashboard API Debug:', {
        userId,
        coursesCount: coursesData?.length || 0,
        quizzesCount: quizData?.length || 0,
        rawCoursesData: coursesData?.slice(0, 2), // First 2 for debugging
        rawQuizData: quizData?.slice(0, 2) // First 2 for debugging
      })

      // Transform quiz attempts with proper percentage calculation
      const processedQuizData = quizData?.map((attempt: any) => {
        // Use percentage_score from database first, then calculate if needed
        let calculatedPercentage = attempt.percentage_score || 0
        
        // If no percentage_score, calculate from score/total_questions
        if (!calculatedPercentage && attempt.total_questions > 0) {
          calculatedPercentage = Math.round((attempt.score / attempt.total_questions) * 100)
        }
        
        // Ensure percentage is between 0 and 100
        calculatedPercentage = Math.min(Math.max(calculatedPercentage, 0), 100)
        
        return {
          ...attempt,
          percentage: calculatedPercentage
        }
      }) || []

      // Transform data for the dashboard with correct calculations
      const completedCourses = coursesData?.filter((course: any) => course.progress >= 100).length || 0
      
      const stats = {
        totalCourses: coursesData?.length || 0,
        completedCourses,
        totalQuizzes: processedQuizData.length,
        averageScore: processedQuizData.length > 0 
          ? Math.round(processedQuizData.reduce((sum: number, attempt: any) => 
              sum + (attempt.percentage || 0), 0) / processedQuizData.length)
          : 0,
        studyHours: Math.round((coursesData?.reduce((sum: number, course: any) => 
          sum + (course.total_watch_time_minutes || 0), 0) || 0) / 60), // Convert minutes to hours
        streak: processedQuizData.length > 0 ? Math.max(1, Math.floor(processedQuizData.length / 2)) : 0 // Simple streak calculation
      }

      const recentCourses = coursesData?.map((enrollment: any) => ({
        id: enrollment.courses.id,
        title: enrollment.courses.title,
        progress: Math.round(enrollment.progress || 0),
        lastAccessed: enrollment.last_accessed_at 
          ? new Date(enrollment.last_accessed_at).toISOString()
          : new Date(enrollment.enrolled_at).toISOString(),
        duration: enrollment.courses.duration || '4 weeks',
        category: enrollment.courses.category || 'General'
      })) || []

      const recentQuizzes = processedQuizData.slice(0, 5).map((attempt: any) => {
        return {
          id: attempt.id,
          quizId: attempt.quiz_id,
          title: attempt.quizzes?.title || 'Unknown Quiz',
          score: attempt.score || 0,
          totalQuestions: attempt.total_questions || 0,
          completedAt: new Date(attempt.completed_at).toISOString(),
          percentage: attempt.percentage,
          attemptNumber: attempt.attempt_number || 1
        }
      })

      return NextResponse.json({
        stats,
        recentCourses,
        recentQuizzes
      }, {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
          'Vary': 'Authorization'
        }
      })
    })

  } catch (error: any) {
    console.error('Error in student dashboard API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})