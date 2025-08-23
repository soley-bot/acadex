import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with cookie authentication
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Cookie setting handled by client
          },
          remove(name: string, options: any) {
            // Cookie removal handled by client  
          }
        }
      }
    )
    
    // Check authentication status
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      return NextResponse.json({ 
        authenticated: false, 
        error: authError.message,
        cookies: Object.fromEntries(cookieStore.getAll().map(c => [c.name, c.value]))
      })
    }
    
    if (!user) {
      return NextResponse.json({ 
        authenticated: false, 
        user: null,
        cookies: Object.fromEntries(cookieStore.getAll().map(c => [c.name, c.value]))
      })
    }

    // Get user role
    const { data: userRole, error: roleError } = await supabase
      .from('users')
      .select('role, name, email')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        ...userRole
      },
      roleError: roleError?.message || null
    })

  } catch (error: any) {
    return NextResponse.json({
      authenticated: false,
      error: error.message
    })
  }
}
