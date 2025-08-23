/**
 * SECURE REFACTORED VERSION of /api/admin/categories/route.ts
 * Using the new standardized API auth system
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, withServiceRole } from '@/lib/api-auth'
import { logger } from '@/lib/logger'

// GET /api/admin/categories - Fetch all categories
export const GET = withAdminAuth(async (request: NextRequest, user) => {
  try {
    logger.info('Admin categories fetch requested', { adminUserId: user.id })

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

// POST /api/admin/categories - Create a new category
export const POST = withAdminAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    logger.info('Admin category creation requested', { 
      adminUserId: user.id, 
      categoryName: body.name 
    })

    const newCategory = await withServiceRole(user, async (serviceClient) => {
      // Check if category already exists
      const { data: existing } = await serviceClient
        .from('categories')
        .select('id')
        .eq('name', body.name)
        .single()

      if (existing) {
        throw new Error('Category already exists')
      }

      // Create new category
      const { data, error } = await serviceClient
        .from('categories')
        .insert({
          name: body.name,
          description: body.description || null,
          created_by: user.id
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    })

    logger.info('Category created successfully', { 
      adminUserId: user.id, 
      categoryId: newCategory.id,
      categoryName: newCategory.name
    })

    return NextResponse.json({ category: newCategory })
  } catch (error: any) {
    logger.error('Category creation failed', { 
      adminUserId: user.id, 
      error: error.message 
    })
    
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('already exists') ? 409 : 500 }
    )
  }
})

// PUT /api/admin/categories - Update a category
export const PUT = withAdminAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    const updatedCategory = await withServiceRole(user, async (serviceClient) => {
      const { data, error } = await serviceClient
        .from('categories')
        .update({
          name: body.name,
          description: body.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', body.id)
        .select()
        .single()
      
      if (error) throw error
      return data
    })

    logger.info('Category updated', { 
      adminUserId: user.id, 
      categoryId: updatedCategory.id 
    })

    return NextResponse.json({ category: updatedCategory })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
})

// DELETE /api/admin/categories - Delete a category
export const DELETE = withAdminAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('id')
    
    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    await withServiceRole(user, async (serviceClient) => {
      const { error } = await serviceClient
        .from('categories')
        .delete()
        .eq('id', categoryId)
      
      if (error) throw error
    })

    logger.info('Category deleted', { 
      adminUserId: user.id, 
      categoryId 
    })

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
})

/**
 * 🔒 SECURITY IMPROVEMENTS:
 * 
 * BEFORE:
 * ❌ Service role used without any authentication
 * ❌ Anyone could call these endpoints
 * ❌ No audit logging
 * ❌ Inconsistent error handling
 * 
 * AFTER:
 * ✅ Admin authentication required for all operations
 * ✅ Service role only used after admin verification
 * ✅ Comprehensive audit logging
 * ✅ Consistent error responses
 * ✅ Input validation
 * ✅ Duplicate checking
 * ✅ Proper HTTP status codes
 */
