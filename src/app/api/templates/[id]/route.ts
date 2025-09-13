import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api-auth'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import type { UpdateTemplateRequest } from '@/types/templates'

// GET - Fetch single template with usage tracking
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    // Extract template ID from URL
    const url = new URL(request.url)
    const templateId = url.pathname.split('/').pop()

    if (!templateId) {
      return NextResponse.json(
        { success: false, message: 'Template ID is required' },
        { status: 400 }
      )
    }

    logger.info('Fetching question template', {
      userId: user.id,
      templateId
    })

    const { data: template, error } = await supabase
      .from('question_templates')
      .select(`
        id,
        title,
        description,
        category,
        question_type,
        difficulty_level,
        template_data,
        language,
        subject_area,
        tags,
        usage_count,
        is_featured,
        is_active,
        is_public,
        created_at,
        updated_at,
        created_by
      `)
      .eq('id', templateId)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Template not found' },
          { status: 404 }
        )
      }
      throw error
    }

    // Check if user can access this template
    if (!template.is_public && template.created_by !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      )
    }

    // Record template access for analytics
    await supabase.rpc('record_template_usage', {
      template_id_param: templateId,
      user_id_param: user.id,
      action_type_param: 'view'
    })

    logger.info('Question template fetched successfully', {
      userId: user.id,
      templateId,
      title: template.title
    })

    return NextResponse.json({
      success: true,
      data: template
    })

  } catch (error) {
    logger.error('Failed to fetch question template:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch template' 
      },
      { status: 500 }
    )
  }
})

// PUT - Update template
export const PUT = withAuth(async (request: NextRequest, user) => {
  try {
    // Extract template ID from URL
    const url = new URL(request.url)
    const templateId = url.pathname.split('/').pop()

    if (!templateId) {
      return NextResponse.json(
        { success: false, message: 'Template ID is required' },
        { status: 400 }
      )
    }

    const body: UpdateTemplateRequest = await request.json()

    logger.info('Updating question template', {
      userId: user.id,
      templateId
    })

    // Check if template exists and user has permission
    const { data: existingTemplate, error: fetchError } = await supabase
      .from('question_templates')
      .select('id, created_by, is_public')
      .eq('id', templateId)
      .eq('is_active', true)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Template not found' },
          { status: 404 }
        )
      }
      throw fetchError
    }

    // Only owner can update template (or admin in future)
    if (existingTemplate.created_by !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Permission denied' },
        { status: 403 }
      )
    }

    // Update template
    const { data: template, error } = await supabase
      .from('question_templates')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId)
      .select()
      .single()

    if (error) throw error

    logger.info('Question template updated successfully', {
      userId: user.id,
      templateId,
      title: template.title
    })

    return NextResponse.json({
      success: true,
      data: template
    })

  } catch (error) {
    logger.error('Failed to update question template:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update template' 
      },
      { status: 500 }
    )
  }
})

// DELETE - Soft delete template
export const DELETE = withAuth(async (request: NextRequest, user) => {
  try {
    // Extract template ID from URL
    const url = new URL(request.url)
    const templateId = url.pathname.split('/').pop()

    if (!templateId) {
      return NextResponse.json(
        { success: false, message: 'Template ID is required' },
        { status: 400 }
      )
    }

    logger.info('Deleting question template', {
      userId: user.id,
      templateId
    })

    // Check if template exists and user has permission
    const { data: existingTemplate, error: fetchError } = await supabase
      .from('question_templates')
      .select('id, created_by, title')
      .eq('id', templateId)
      .eq('is_active', true)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Template not found' },
          { status: 404 }
        )
      }
      throw fetchError
    }

    // Only owner can delete template (or admin in future)
    if (existingTemplate.created_by !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Permission denied' },
        { status: 403 }
      )
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('question_templates')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId)

    if (error) throw error

    logger.info('Question template deleted successfully', {
      userId: user.id,
      templateId,
      title: existingTemplate.title
    })

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    })

  } catch (error) {
    logger.error('Failed to delete question template:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to delete template' 
      },
      { status: 500 }
    )
  }
})