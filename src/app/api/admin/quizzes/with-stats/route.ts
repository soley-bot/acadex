import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { getAuth } from '@supabase/ssr'
import { cookies } from 'next/headers'

// This admin client can be used to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const { data: { user }, error: authError } = await getAuth(cookieStore)

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || userData?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 })
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('get_quizzes_with_stats')

    if (error) {
      logger.error('Error fetching quizzes with stats:', error)
      throw error
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    logger.error('Unexpected error fetching quizzes with stats:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
