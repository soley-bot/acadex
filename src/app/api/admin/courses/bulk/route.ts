import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, withServiceRole } from '@/lib/api-auth'
import { logger } from '@/lib/logger'

export const POST = withAdminAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    const { action, itemIds, params } = body

    if (!action || !itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid request. Action and itemIds array are required.' },
        { status: 400 }
      )
    }

    logger.info(`Bulk operation requested: ${action} on ${itemIds.length} courses`, {
      userId: user.id,
      action,
      courseIds: itemIds,
      params
    })

    return withServiceRole(user, async (supabase) => {

    let result
    let affectedRows = 0

    switch (action) {
      case 'publish':
        const { data: publishData, error: publishError } = await supabase
          .from('courses')
          .update({ is_published: true })
          .in('id', itemIds)
          .select('id')

        if (publishError) throw publishError
        affectedRows = publishData?.length || 0
        result = { action: 'published', count: affectedRows }
        break

      case 'unpublish':
        const { data: unpublishData, error: unpublishError } = await supabase
          .from('courses')
          .update({ is_published: false })
          .in('id', itemIds)
          .select('id')

        if (unpublishError) throw unpublishError
        affectedRows = unpublishData?.length || 0
        result = { action: 'unpublished', count: affectedRows }
        break

      case 'delete':
        // Check for course usage first
        const { data: moduleUsage, error: moduleError } = await supabase
          .from('modules')
          .select('course_id')
          .in('course_id', itemIds)

        if (moduleError) throw moduleError

        const coursesWithModules = new Set(moduleUsage?.map((m: any) => m.course_id) || [])
        const safeToDelete = itemIds.filter(id => !coursesWithModules.has(id))
        const unsafeToDelete = itemIds.filter(id => coursesWithModules.has(id))

        if (safeToDelete.length > 0) {
          const { data: deleteData, error: deleteError } = await supabase
            .from('courses')
            .delete()
            .in('id', safeToDelete)
            .select('id')

          if (deleteError) throw deleteError
          affectedRows = deleteData?.length || 0
        }

        result = {
          action: 'deleted',
          count: affectedRows,
          skipped: unsafeToDelete.length,
          message: unsafeToDelete.length > 0 
            ? `${affectedRows} courses deleted. ${unsafeToDelete.length} courses skipped (contain modules).`
            : `${affectedRows} courses deleted successfully.`
        }
        break

      case 'duplicate':
        const { data: originalCourses, error: fetchError } = await supabase
          .from('courses')
          .select('*')
          .in('id', itemIds)

        if (fetchError) throw fetchError

        const duplicatedCourses = originalCourses?.map((course: any) => ({
          ...course,
          id: undefined, // Let Supabase generate new ID
          title: `${course.title} (Copy)`,
          is_published: false, // Copies start as drafts
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))

        if (duplicatedCourses && duplicatedCourses.length > 0) {
          const { data: duplicateData, error: duplicateError } = await supabase
            .from('courses')
            .insert(duplicatedCourses)
            .select('id')

          if (duplicateError) throw duplicateError
          affectedRows = duplicateData?.length || 0
        }

        result = { action: 'duplicated', count: affectedRows }
        break

      case 'archive':
        // Archive functionality - could set a status field or move to archived table
        // For now, we'll use is_published = false and add an archived timestamp
        const { data: archiveData, error: archiveError } = await supabase
          .from('courses')
          .update({ 
            is_published: false,
            archived_at: new Date().toISOString()
          })
          .in('id', itemIds)
          .select('id')

        if (archiveError) throw archiveError
        affectedRows = archiveData?.length || 0
        result = { action: 'archived', count: affectedRows }
        break

      case 'export':
        // Export course data as JSON
        const { data: exportData, error: exportError } = await supabase
          .from('courses')
          .select(`
            *,
            modules (
              *,
              lessons (*)
            )
          `)
          .in('id', itemIds)

        if (exportError) throw exportError

        result = {
          action: 'exported',
          count: exportData?.length || 0,
          data: exportData,
          filename: `courses_export_${new Date().toISOString().split('T')[0]}.json`
        }
        break

      default:
        return NextResponse.json(
          { success: false, message: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    logger.info(`Bulk course operation completed: ${action}`, {
      userId: user.id,
      action,
      affectedRows,
      result
    })

    return NextResponse.json({
      success: true,
      result
    })
    
    }) // Close withServiceRole callback

  } catch (error: any) {
    logger.error('Bulk course operation failed', { error: error?.message || 'Unknown error' })
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred during bulk operation' 
      },
      { status: 500 }
    )
  }
})