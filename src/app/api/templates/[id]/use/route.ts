import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api-auth'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'

// POST - Use template and record usage
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    // Extract template ID from URL
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const templateId = pathSegments[pathSegments.length - 2] // Get ID before '/use'

    if (!templateId) {
      return NextResponse.json(
        { success: false, message: 'Template ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { action_type = 'use', context = {} } = body

    logger.info('Recording template usage', {
      userId: user.id,
      templateId,
      actionType: action_type
    })

    // Verify template exists and is accessible
    const { data: template, error: templateError } = await supabase
      .from('question_templates')
      .select('id, title, is_public, created_by, template_data')
      .eq('id', templateId)
      .eq('is_active', true)
      .single()

    if (templateError) {
      if (templateError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Template not found' },
          { status: 404 }
        )
      }
      throw templateError
    }

    // Check access permissions
    if (!template.is_public && template.created_by !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      )
    }

    // Record the usage
    const { error: usageError } = await supabase.rpc('record_template_usage', {
      template_id_param: templateId,
      user_id_param: user.id,
      action_type_param: action_type,
      context_param: context
    })

    if (usageError) throw usageError

    // For 'use' action, return the template data for question creation
    if (action_type === 'use') {
      logger.info('Template usage recorded successfully', {
        userId: user.id,
        templateId,
        title: template.title
      })

      return NextResponse.json({
        success: true,
        message: 'Template usage recorded',
        data: {
          template_id: template.id,
          title: template.title,
          template_data: template.template_data
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: `Template ${action_type} recorded`
    })

  } catch (error) {
    logger.error('Failed to record template usage:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to record template usage' 
      },
      { status: 500 }
    )
  }
})