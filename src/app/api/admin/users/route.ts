import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, withServiceRole } from '@/lib/api-auth'
import { logger } from '@/lib/logger'

// GET - Fetch all users for admin (SECURE)
export const GET = withAdminAuth(async (request: NextRequest, user) => {
  try {
    logger.info('Admin users fetch requested', { adminUserId: user.id })

    const users = await withServiceRole(user, async (serviceClient) => {
      const { data, error } = await serviceClient
        .from('users')
        .select('id, name, email, role, created_at')
        .order('name')
      
      if (error) throw error
      return data
    })

    return NextResponse.json({ users })
  } catch (error: any) {
    logger.error('Users fetch failed', { 
      adminUserId: user.id, 
      error: error.message 
    })
    
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
})

// POST - Create new user (SECURE)
export const POST = withAdminAuth(async (request: NextRequest, user) => {
  try {
    const { name, email, password, role } = await request.json()

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, password, role' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    logger.info('Admin user creation requested', { 
      adminUserId: user.id, 
      newUserEmail: email,
      newUserRole: role
    })

    const newUser = await withServiceRole(user, async (serviceClient) => {
      // Check if user already exists in auth.users
      const { data: existingUsers, error: checkError } = await serviceClient.auth.admin.listUsers()
      if (checkError) {
        throw new Error('Failed to check existing users')
      }

      const userExists = existingUsers.users.some((existingUser: any) => existingUser.email === email)
      if (userExists) {
        throw new Error('User with this email already exists')
      }

      // Create user in Supabase Auth using admin client
      const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Admin-created users are auto-confirmed
        user_metadata: {
          name,
          role
        }
      })

      if (authError) throw authError

      // Create user record in our users table
      const { data: userData, error: userError } = await serviceClient
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
          role,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (userError) {
        // If user table creation fails, clean up auth user
        await serviceClient.auth.admin.deleteUser(authData.user.id)
        throw userError
      }

      return userData
    })

    logger.info('User created successfully', { 
      adminUserId: user.id, 
      newUserId: newUser.id,
      newUserEmail: newUser.email
    })

    return NextResponse.json({ user: newUser })
  } catch (error: any) {
    logger.error('User creation failed', { 
      adminUserId: user.id, 
      error: error.message 
    })
    
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('already exists') ? 409 : 500 }
    )
  }
})
