import { logger } from '@/lib/logger'

// Option 3: Direct Database API Calls
// Create API routes that handle database operations server-side

// File: src/app/api/admin/courses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for server-side operations (bypasses RLS)
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseData, action, userId } = body

    logger.debug('🚀 Server-side course operation:', action)
    logger.debug('📊 Course data:', courseData)
    logger.debug('👤 User ID:', userId)

    // Verify user is admin (extra security check)
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
      
      if (!user || user.role !== 'admin') {
        return NextResponse.json({
          success: false,
          error: 'Access denied. Admin role required.'
        }, { status: 403 })
      }
    }

    let result
    if (action === 'create') {
      const { data, error } = await supabase
        .from('courses')
        .insert(courseData)
        .select()
        .single()

      if (error) throw error
      result = data
    } else if (action === 'update') {
      const { id, ...updates } = courseData
      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    logger.debug('✅ Server operation successful:', result.id)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    logger.error('❌ Server operation failed:', error)
    
    // Provide helpful error messages
    let errorMessage = error.message
    if (error.message.includes('row-level security')) {
      errorMessage = 'Access denied. Please ensure you have admin privileges.'
    } else if (error.message.includes('foreign key')) {
      errorMessage = 'Invalid user reference. Please check your admin account.'
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}

// GET endpoint to fetch courses
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
