import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, withServiceRole } from '@/lib/api-auth'
import { logger } from '@/lib/logger'

interface BulkOperationRequest {
  action: 'publish' | 'unpublish' | 'delete' | 'duplicate' | 'archive' | 'export'
  quizIds: string[]
  params?: Record<string, any>
}

export const POST = withAdminAuth(async (request: NextRequest, user) => {
  try {
    const body: BulkOperationRequest = await request.json()
    const { action, quizIds, params } = body

    if (!Array.isArray(quizIds) || quizIds.length === 0) {
      return NextResponse.json(
        { error: 'Quiz IDs array is required and cannot be empty' },
        { status: 400 }
      )
    }

    if (quizIds.length > 50) {
      return NextResponse.json(
        { error: 'Cannot process more than 50 quizzes at once' },
        { status: 400 }
      )
    }

    logger.info('Bulk quiz operation requested', {
      action,
      quizCount: quizIds.length,
      adminUserId: user.id
    })

    return withServiceRole(user, async (serviceClient) => {
      let result: any = { success: true, processedCount: 0, errors: [] }

      switch (action) {
        case 'publish':
        case 'unpublish':
          const isPublished = action === 'publish'
          const { data: publishData, error: publishError } = await serviceClient
            .from('quizzes')
            .update({ 
              is_published: isPublished,
              updated_at: new Date().toISOString()
            })
            .in('id', quizIds)
            .select('id, title')

          if (publishError) {
            logger.error('Bulk publish/unpublish failed', { error: publishError, action })
            return NextResponse.json(
              { error: `Failed to ${action} quizzes: ${publishError.message}` },
              { status: 500 }
            )
          }

          result.processedCount = publishData?.length || 0
          result.message = `Successfully ${action}ed ${result.processedCount} quizzes`
          break

        case 'delete':
          // Hard delete quizzes (cascade will delete related questions and results)
          const { data: deleteData, error: deleteError } = await serviceClient
            .from('quizzes')
            .delete()
            .in('id', quizIds)
            .select('id, title')

          if (deleteError) {
            logger.error('Bulk delete failed', { error: deleteError })
            return NextResponse.json(
              { error: `Failed to delete quizzes: ${deleteError.message}` },
              { status: 500 }
            )
          }

          result.processedCount = deleteData?.length || 0
          result.message = `Successfully deleted ${result.processedCount} quizzes`
          break

        case 'duplicate':
          const { data: originalQuizzes, error: fetchError } = await serviceClient
            .from('quizzes')
            .select('*')
            .in('id', quizIds)

          if (fetchError) {
            logger.error('Failed to fetch quizzes for duplication', { error: fetchError })
            return NextResponse.json(
              { error: `Failed to fetch quizzes: ${fetchError.message}` },
              { status: 500 }
            )
          }

          const duplicatedQuizzes = []
          for (const quiz of originalQuizzes) {
            const duplicated = {
              ...quiz,
              id: undefined, // Let Supabase generate new ID
              title: `${quiz.title} (Copy)`,
              is_published: false, // Always create duplicates as drafts
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            delete duplicated.id // Remove id field completely
            duplicatedQuizzes.push(duplicated)
          }

          const { data: duplicateData, error: duplicateError } = await serviceClient
            .from('quizzes')
            .insert(duplicatedQuizzes)
            .select('id, title')

          if (duplicateError) {
            logger.error('Bulk duplicate failed', { error: duplicateError })
            return NextResponse.json(
              { error: `Failed to duplicate quizzes: ${duplicateError.message}` },
              { status: 500 }
            )
          }

          result.processedCount = duplicateData?.length || 0
          result.message = `Successfully duplicated ${result.processedCount} quizzes`
          result.newItems = duplicateData
          break

        case 'archive':
          const { data: archiveData, error: archiveError } = await serviceClient
            .from('quizzes')
            .update({ 
              is_published: false,
              archived_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .in('id', quizIds)
            .select('id, title')

          if (archiveError) {
            logger.error('Bulk archive failed', { error: archiveError })
            return NextResponse.json(
              { error: `Failed to archive quizzes: ${archiveError.message}` },
              { status: 500 }
            )
          }

          result.processedCount = archiveData?.length || 0
          result.message = `Successfully archived ${result.processedCount} quizzes`
          break

        case 'export':
          // Fetch quiz data with questions for export
          const { data: exportQuizzes, error: exportError } = await serviceClient
            .from('quizzes')
            .select(`
              *,
              questions (*)
            `)
            .in('id', quizIds)

          if (exportError) {
            logger.error('Bulk export failed', { error: exportError })
            return NextResponse.json(
              { error: `Failed to export quizzes: ${exportError.message}` },
              { status: 500 }
            )
          }

          // Format for export
          const exportData = exportQuizzes.map((quiz: any) => ({
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            category: quiz.category,
            difficulty: quiz.difficulty,
            duration_minutes: quiz.duration_minutes,
            passing_score: quiz.passing_score,
            questions: quiz.questions,
            exported_at: new Date().toISOString()
          }))

          result.processedCount = exportData.length
          result.message = `Successfully exported ${result.processedCount} quizzes`
          result.exportData = exportData
          break

        default:
          return NextResponse.json(
            { error: `Unsupported action: ${action}` },
            { status: 400 }
          )
      }

      logger.info('Bulk quiz operation completed', {
        action,
        processedCount: result.processedCount,
        adminUserId: user.id
      })

      return NextResponse.json(result)
    })

  } catch (error: any) {
    logger.error('Bulk quiz operation error', { error })
    return NextResponse.json(
      { error: 'Internal server error during bulk operation' },
      { status: 500 }
    )
  }
})