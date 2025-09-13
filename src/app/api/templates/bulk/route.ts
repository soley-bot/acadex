import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api-auth'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import type { BulkTemplateRequest } from '@/types/templates'

// POST - Bulk template operations
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const body: BulkTemplateRequest = await request.json()
    const { template_ids, action, data } = body

    if (!template_ids || template_ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Template IDs are required' },
        { status: 400 }
      )
    }

    if (!action) {
      return NextResponse.json(
        { success: false, message: 'Action is required' },
        { status: 400 }
      )
    }

    logger.info('Performing bulk template operation', {
      userId: user.id,
      action,
      templateCount: template_ids.length
    })

    // Verify user owns all templates (or is admin)
    const { data: templates, error: fetchError } = await supabase
      .from('question_templates')
      .select('id, created_by, title')
      .in('id', template_ids)
      .eq('is_active', true)

    if (fetchError) throw fetchError

    if (!templates || templates.length !== template_ids.length) {
      return NextResponse.json(
        { success: false, message: 'Some templates not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const unauthorizedTemplates = templates.filter((t: any) => t.created_by !== user.id)
    if (unauthorizedTemplates.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Permission denied for some templates' },
        { status: 403 }
      )
    }

    let result
    const timestamp = new Date().toISOString()

    switch (action) {
      case 'delete':
        // Soft delete templates
        const { error: deleteError } = await supabase
          .from('question_templates')
          .update({ 
            is_active: false,
            updated_at: timestamp
          })
          .in('id', template_ids)

        if (deleteError) throw deleteError
        result = { deleted: template_ids.length }
        break

      case 'update':
        if (!data) {
          return NextResponse.json(
            { success: false, message: 'Update data is required' },
            { status: 400 }
          )
        }

        const { error: updateError } = await supabase
          .from('question_templates')
          .update({ 
            ...data,
            updated_at: timestamp
          })
          .in('id', template_ids)

        if (updateError) throw updateError
        result = { updated: template_ids.length }
        break

      case 'toggle_public':
        // Toggle public status
        const { error: toggleError } = await supabase
          .from('question_templates')
          .update({ 
            is_public: data?.is_public ?? true,
            updated_at: timestamp
          })
          .in('id', template_ids)

        if (toggleError) throw toggleError
        result = { updated: template_ids.length }
        break

      case 'toggle_featured':
        // Toggle featured status
        const { error: featuredError } = await supabase
          .from('question_templates')
          .update({ 
            is_featured: data?.is_featured ?? true,
            updated_at: timestamp
          })
          .in('id', template_ids)

        if (featuredError) throw featuredError
        result = { updated: template_ids.length }
        break

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        )
    }

    logger.info('Bulk template operation completed', {
      userId: user.id,
      action,
      result
    })

    return NextResponse.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      data: result
    })

  } catch (error) {
    logger.error('Failed to perform bulk template operation:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to perform bulk operation' 
      },
      { status: 500 }
    )
  }
})