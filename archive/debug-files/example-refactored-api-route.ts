/**
 * Example: Refactored Admin API Route using Standardized Auth
 * This shows how to convert existing admin routes to use the new auth system
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, withServiceRole } from '@/lib/api-auth'
import { logger } from '@/lib/logger'

// BEFORE: Complex auth verification in every route
/*
export async function GET(request: NextRequest) {
  try {
    const supabase = createAuthenticatedClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userRecord || userRecord.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Actual business logic here...
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    return NextResponse.json({ categories })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
*/

// AFTER: Clean, standardized auth with higher-order function
export const GET = withAdminAuth(async (request: NextRequest, user) => {
  try {
    logger.info('Admin categories request', { adminUserId: user.id })

    // Option 1: Use regular authenticated client (respects RLS)
    // const supabase = createAuthenticatedClient(request)
    // const { data: categories, error } = await supabase
    //   .from('categories')
    //   .select('*')
    //   .order('name')

    // Option 2: Use service role for admin operations (bypasses RLS)
    const categories = await withServiceRole(user, async (serviceClient) => {
      const { data, error } = await serviceClient
        .from('categories')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data
    })

    return NextResponse.json({ categories })
  } catch (error: any) {
    logger.error('Categories fetch failed', { 
      adminUserId: user.id, 
      error: error.message 
    })
    
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
})

// Multiple auth methods in same file
export const POST = withAdminAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    
    // Service role operation with proper admin verification
    const newCategory = await withServiceRole(user, async (serviceClient) => {
      const { data, error } = await serviceClient
        .from('categories')
        .insert(body)
        .select()
        .single()
      
      if (error) throw error
      return data
    })

    logger.info('Category created', { 
      adminUserId: user.id, 
      categoryId: newCategory.id 
    })

    return NextResponse.json({ category: newCategory })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
})

// Different auth levels for different operations
export const PUT = withAdminAuth(async (request: NextRequest, user) => {
  // Admin-only update logic
  return NextResponse.json({ message: 'Admin update' })
})

// Could also use instructor auth for certain operations
// export const PATCH = withInstructorAuth(async (request: NextRequest, user) => {
//   // Instructor-level update logic
//   return NextResponse.json({ message: 'Instructor update' })
// })

/**
 * Benefits of the new system:
 * 
 * 1. ✅ Consistent auth across all routes
 * 2. ✅ Automatic error handling and responses  
 * 3. ✅ Type-safe user object with role info
 * 4. ✅ Proper audit logging built-in
 * 5. ✅ Service role operations are explicit and secure
 * 6. ✅ Easy to change auth requirements (admin vs instructor)
 * 7. ✅ Reduced boilerplate code
 * 8. ✅ Better testability
 */
