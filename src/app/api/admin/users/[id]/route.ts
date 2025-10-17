import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, createServiceClient } from '@/lib/api-auth'
import { logger } from '@/lib/logger'

export const PUT = withAdminAuth(async (
  request: NextRequest,
  user: any
) => {
  try {
    const supabase = createServiceClient()
    
    // Extract user ID from URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const userId = pathParts[pathParts.length - 1]
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const { name, email, role } = body

    // Validate input
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!email?.trim() || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    if (!['student', 'instructor', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single()

    if (fetchError || !existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is being changed and if it's already taken by another user
    if (email.toLowerCase() !== existingUser.email.toLowerCase()) {
      const { data: emailCheck } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .neq('id', userId)
        .single()

      if (emailCheck) {
        return NextResponse.json(
          { error: 'Email already in use by another user' },
          { status: 409 }
        )
      }
    }

    // Update user in our users table
    const { data, error } = await supabase
      .from('users')
      .update({
        name: name.trim(),
        email: email.toLowerCase(),
        role: role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Database error', { error: error?.message || 'Unknown error' })
      return NextResponse.json(
        { error: 'Failed to update user in database' },
        { status: 500 }
      )
    }

    // If email changed, also update in Supabase Auth
    if (email.toLowerCase() !== existingUser.email.toLowerCase()) {
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          email: email.toLowerCase(),
          user_metadata: {
            name: name.trim(),
            role: role
          }
        }
      )

      if (authError) {
        logger.error('Auth update error:', authError)
        // Don't fail the request if auth update fails, just log it
      }
    } else {
      // Just update metadata if email didn't change
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            name: name.trim(),
            role: role
          }
        }
      )

      if (authError) {
        logger.error('Auth metadata update error:', authError)
        // Don't fail the request if auth update fails
      }
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: data,
      updatedBy: { id: user.id, email: user.email, role: user.role }
    })

  } catch (error: any) {
    logger.error('Update user error', { error: error?.message || 'Unknown error' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

export const DELETE = withAdminAuth(async (
  request: NextRequest,
  user: any
) => {
  try {
    const supabase = createServiceClient()
    
    // Extract user ID from URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const userId = pathParts[pathParts.length - 1]

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', userId)
      .single()

    if (fetchError || !existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent deleting the last admin user
    if (existingUser.role === 'admin') {
      const { data: adminCount } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('role', 'admin')

      if (adminCount && adminCount.length <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin user' },
          { status: 400 }
        )
      }
    }

    // Delete user from our users table (this will cascade delete related records)
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (deleteError) {
      logger.error('Database delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete user from database' },
        { status: 500 }
      )
    }

    // Delete user from Supabase Auth
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId)

    if (authDeleteError) {
      logger.error('Auth delete error:', authDeleteError)
      // User was deleted from database but not from auth
      // This is okay - the auth user will be orphaned but harmless
    }

    return NextResponse.json({
      message: 'User deleted successfully',
      deletedBy: { id: user.id, email: user.email, role: user.role }
    })

  } catch (error: any) {
    logger.error('Delete user error', { error: error?.message || 'Unknown error' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
