import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for server-side operations (bypasses RLS) - same as courses API
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// GET - Fetch all enrollments with details
export async function GET(request: NextRequest) {
  try {
    // Fetch enrollments with course and user details
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:courses(id, title, instructor_name, price, level),
        user:users(id, name, email)
      `)
      .order('enrolled_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 })
    }

    return NextResponse.json({ enrollments })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new enrollment (manual enrollment by admin)
export async function POST(request: NextRequest) {
  try {
    const { user_id, course_id } = await request.json()

    if (!user_id || !course_id) {
      return NextResponse.json({ error: 'User ID and Course ID are required' }, { status: 400 })
    }

    // Check if enrollment already exists
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .single()

    if (existingEnrollment) {
      return NextResponse.json({ error: 'User is already enrolled in this course' }, { status: 400 })
    }

    // Create new enrollment
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .insert({
        user_id,
        course_id,
        progress: 0,
        enrolled_at: new Date().toISOString(),
        total_watch_time_minutes: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 })
    }

    return NextResponse.json({ enrollment }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove enrollment (unenroll student)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const enrollmentId = searchParams.get('id')

    if (!enrollmentId) {
      return NextResponse.json({ error: 'Enrollment ID is required' }, { status: 400 })
    }

    // Delete enrollment
    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('id', enrollmentId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete enrollment' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
