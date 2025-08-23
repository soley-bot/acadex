import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('Testing authenticated quiz API...')
    
    // Check if we have any admin users
    const { data: adminUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .in('role', ['admin', 'instructor'])
      .limit(5)

    if (usersError) {
      console.error('Error fetching admin users:', usersError)
      return NextResponse.json({ 
        error: 'Error fetching admin users', 
        details: usersError
      }, { status: 500 })
    }

    console.log('Found admin users:', adminUsers)

    // Generate a test Bearer token for an admin user (for demonstration)
    // Note: In a real app, this would come from Supabase auth
    if (adminUsers && adminUsers.length > 0) {
      const adminUser = adminUsers[0]
      
      // Create a mock auth session
      const mockAuthData = {
        user: {
          id: adminUser!.id,
          email: adminUser!.email,
          role: adminUser!.role
        }
      }

      // Try to fetch quizzes with service role key (simulating admin access)
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
          is_published,
          created_at,
          updated_at
        `)
        .limit(10)

      if (quizzesError) {
        console.error('Quiz query error:', quizzesError)
        return NextResponse.json({ 
          error: 'Quiz query error', 
          details: quizzesError
        }, { status: 500 })
      }

      console.log('Quiz query successful, found', quizzes?.length, 'quizzes')
      
      return NextResponse.json({
        success: true,
        message: 'Authenticated quiz API test successful',
        adminUser: mockAuthData.user,
        quizzes: quizzes || [],
        count: quizzes?.length || 0,
        note: 'This test uses service role key to simulate admin access'
      })
    } else {
      return NextResponse.json({
        error: 'No admin users found in the system',
        message: 'Please create an admin user to test the authenticated API'
      }, { status: 404 })
    }

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 })
  }
}
