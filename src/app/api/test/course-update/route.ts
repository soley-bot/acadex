import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('Testing course update API...')
    
    // Check if we have admin users
    const { data: adminUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .in('role', ['admin', 'instructor'])
      .limit(1)

    if (usersError) {
      console.error('Error fetching admin users:', usersError)
      return NextResponse.json({ 
        error: 'Error fetching admin users', 
        details: usersError
      }, { status: 500 })
    }

    // Check if we have courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, description')
      .limit(1)

    if (coursesError) {
      console.error('Error fetching courses:', coursesError)
      return NextResponse.json({ 
        error: 'Error fetching courses', 
        details: coursesError
      }, { status: 500 })
    }

    console.log('Found admin users:', adminUsers)
    console.log('Found courses:', courses)
    
    return NextResponse.json({
      success: true,
      message: 'Course update API test successful',
      adminUsers: adminUsers || [],
      courses: courses || [],
      notes: [
        'Test shows basic database connectivity',
        'To test actual update, use the admin panel',
        'Make sure users table RLS is disabled to avoid infinite recursion'
      ]
    })

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 })
  }
}
