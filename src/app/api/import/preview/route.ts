import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-auth'
import { fetchGoogleSheet } from '@/lib/import/sheets-fetcher'
import { validateBatch } from '@/lib/import/validation'
import { logger } from '@/lib/logger'

export const POST = withAdminAuth(async (request: NextRequest, user) => {
  try {
    logger.info('[Import Preview] Request received', { adminUserId: user.id })
    
    // Parse request body
    const body = await request.json()
    const { sheetUrl } = body
    
    if (!sheetUrl) {
      return NextResponse.json(
        { error: 'Sheet URL is required' },
        { status: 400 }
      )
    }
    
    logger.info('[Import Preview] Fetching sheet', { sheetUrl })
    
    // Fetch data from Google Sheets
    const rawQuestions = await fetchGoogleSheet(sheetUrl)
    
    logger.info('[Import Preview] Fetched questions', { count: rawQuestions.length })
    
    // Validate all questions
    const validation = validateBatch(rawQuestions)
    
    // Format response with validation results
    const questions = [
      // Valid questions
      ...validation.valid.map((q, index) => {
        const warning = validation.warnings.find(w => w.data === q)
        return {
          ...q,
          status: warning ? 'warning' as const : 'valid' as const,
          issues: warning?.warnings || []
        }
      }),
      // Invalid questions
      ...validation.invalid.map(inv => ({
        ...inv.data,
        status: 'error' as const,
        issues: inv.errors
      }))
    ]
    
    logger.info('[Import Preview] Validation complete', validation.summary)
    
    return NextResponse.json({
      success: true,
      questions,
      summary: {
        total: validation.summary.total,
        valid: validation.summary.valid,
        warnings: validation.summary.withWarnings,
        errors: validation.summary.invalid,
        breakdown: {
          multiple_choice: questions.filter(q => q.type === 'multiple_choice').length,
          true_false: questions.filter(q => q.type === 'true_false').length,
          fill_blank: questions.filter(q => q.type === 'fill_blank').length,
        }
      }
    })
    
  } catch (error: any) {
    logger.error('[Import Preview] Error', { error: error.message, stack: error.stack })
    
    return NextResponse.json(
      {
        error: error.message || 'Failed to preview import',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
})
