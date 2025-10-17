import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, createServiceClient } from '@/lib/api-auth'

export const DELETE = withAdminAuth(async (
  request: NextRequest,
  user: any
) => {
  try {
    const supabase = createServiceClient()
    
    // Extract enrollment ID from URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const enrollmentId = pathParts[pathParts.length - 1]
    
    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'Enrollment ID is required' },
        { status: 400 }
      )
    }
    
    console.log('Attempting to delete enrollment:', enrollmentId)

    // First, check if enrollment exists
    const { data: enrollment, error: fetchError } = await supabase
      .from('enrollments')
      .select('*')
      .eq('id', enrollmentId)
      .single()

    console.log('Enrollment fetch result:', { enrollment, fetchError })

    if (fetchError || !enrollment) {
      console.log('Enrollment not found:', fetchError)
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    // Delete the enrollment
    console.log('Attempting to delete enrollment...')
    const { error: deleteError } = await supabase
      .from('enrollments')
      .delete()
      .eq('id', enrollmentId)

    console.log('Delete result:', { deleteError })

    if (deleteError) {
      console.error('Database error:', deleteError)
      return NextResponse.json({ 
        error: 'Failed to delete enrollment', 
        details: deleteError.message 
      }, { status: 500 })
    }

    console.log('Enrollment deleted successfully')
    return NextResponse.json({ 
      success: true, 
      message: 'Student successfully unenrolled',
      deletedBy: { id: user.id, email: user.email, role: user.role }
    }, { status: 200 })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const PATCH = withAdminAuth(async (
  request: NextRequest,
  user: any
) => {
  try {
    const supabase = createServiceClient()
    
    // Extract enrollment ID from URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const enrollmentId = pathParts[pathParts.length - 1]
    
    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'Enrollment ID is required' },
        { status: 400 }
      )
    }
    
    const updates = await request.json()

    // Validate allowed fields
    const allowedFields = ['progress', 'completed_at', 'last_accessed_at', 'total_watch_time_minutes']
    const updateData: any = {}

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Update the enrollment
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .update(updateData)
      .eq('id', enrollmentId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 })
    }

    return NextResponse.json({ 
      enrollment,
      updatedBy: { id: user.id, email: user.email, role: user.role }
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
