import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('id', id)
      .single()

    if (fetchError || !existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is being changed and if it's already taken by another user
    if (email.toLowerCase() !== existingUser.email.toLowerCase()) {
      const { data: emailCheck } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .neq('id', id)
        .single()

      if (emailCheck) {
        return NextResponse.json(
          { error: 'Email already in use by another user' },
          { status: 409 }
        )
      }
    }

    // Update user in our users table
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        name: name.trim(),
        email: email.toLowerCase(),
        role: role,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update user in database' },
        { status: 500 }
      )
    }

    // If email changed, also update in Supabase Auth
    if (email.toLowerCase() !== existingUser.email.toLowerCase()) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        {
          email: email.toLowerCase(),
          user_metadata: {
            name: name.trim(),
            role: role
          }
        }
      )

      if (authError) {
        console.error('Auth update error:', authError)
        // Don't fail the request if auth update fails, just log it
        // The database update was successful
      }
    } else {
      // Just update metadata if email didn't change
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        {
          user_metadata: {
            name: name.trim(),
            role: role
          }
        }
      )

      if (authError) {
        console.error('Auth metadata update error:', authError)
        // Don't fail the request if auth update fails
      }
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: data
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('id', id)
      .single()

    if (fetchError || !existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent deleting the last admin user
    if (existingUser.role === 'admin') {
      const { data: adminCount } = await supabaseAdmin
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
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Database delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete user from database' },
        { status: 500 }
      )
    }

    // Delete user from Supabase Auth
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (authDeleteError) {
      console.error('Auth delete error:', authDeleteError)
      // User was deleted from database but not from auth
      // This is okay - the auth user will be orphaned but harmless
    }

    return NextResponse.json({
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
