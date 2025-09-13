import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api-auth'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import type { CreateTemplateRequest, TemplateFilters } from '@/types/templates'

// GET - Fetch templates with filtering and search
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: TemplateFilters = {
      category: searchParams.get('category') || undefined,
      question_type: searchParams.get('question_type') || undefined,
      difficulty_level: searchParams.get('difficulty_level') || undefined,
      language: searchParams.get('language') || undefined,
      subject_area: searchParams.get('subject_area') || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      is_featured: searchParams.get('featured') === 'true' ? true : undefined,
      search_query: searchParams.get('search') || undefined,
      is_public: searchParams.get('public') === 'true' ? true : undefined
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit

    logger.info('Fetching question templates', {
      userId: user.id,
      filters,
      page,
      limit
    })

    let query = supabase
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
        updated_at
      `)
      .eq('is_active', true)

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.question_type) {
      query = query.eq('question_type', filters.question_type)
    }

    if (filters.difficulty_level) {
      query = query.eq('difficulty_level', filters.difficulty_level)
    }

    if (filters.language) {
      query = query.eq('language', filters.language)
    }

    if (filters.subject_area) {
      query = query.eq('subject_area', filters.subject_area)
    }

    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured)
    }

    if (filters.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public)
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags)
    }

    if (filters.search_query) {
      query = query.or(`title.ilike.%${filters.search_query}%,description.ilike.%${filters.search_query}%`)
    }

    // Add pagination and ordering
    query = query
      .order('is_featured', { ascending: false })
      .order('usage_count', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: templates, error } = await query

    if (error) throw error

    // Get total count for pagination
    let countQuery = supabase
      .from('question_templates')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Apply same filters for count
    if (filters.category) countQuery = countQuery.eq('category', filters.category)
    if (filters.question_type) countQuery = countQuery.eq('question_type', filters.question_type)
    if (filters.difficulty_level) countQuery = countQuery.eq('difficulty_level', filters.difficulty_level)
    if (filters.language) countQuery = countQuery.eq('language', filters.language)
    if (filters.subject_area) countQuery = countQuery.eq('subject_area', filters.subject_area)
    if (filters.is_featured !== undefined) countQuery = countQuery.eq('is_featured', filters.is_featured)
    if (filters.is_public !== undefined) countQuery = countQuery.eq('is_public', filters.is_public)
    if (filters.tags && filters.tags.length > 0) countQuery = countQuery.contains('tags', filters.tags)
    if (filters.search_query) {
      countQuery = countQuery.or(`title.ilike.%${filters.search_query}%,description.ilike.%${filters.search_query}%`)
    }

    const { count, error: countError } = await countQuery
    if (countError) throw countError

    logger.info('Question templates fetched successfully', {
      userId: user.id,
      templateCount: templates?.length || 0,
      totalCount: count || 0
    })

    return NextResponse.json({
      success: true,
      data: templates,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    logger.error('Failed to fetch question templates:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch templates' 
      },
      { status: 500 }
    )
  }
})

// POST - Create new template
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const body: CreateTemplateRequest = await request.json()
    
    const {
      title,
      description,
      category,
      question_type,
      difficulty_level,
      template_data,
      language = 'english',
      subject_area,
      tags,
      is_public = false
    } = body

    // Validate required fields
    if (!title || !category || !question_type || !template_data) {
      return NextResponse.json(
        { success: false, message: 'Title, category, question type, and template data are required' },
        { status: 400 }
      )
    }

    logger.info('Creating question template', {
      userId: user.id,
      title,
      category,
      question_type
    })

    const { data: template, error } = await supabase
      .from('question_templates')
      .insert({
        title,
        description,
        category,
        question_type,
        difficulty_level,
        template_data,
        language,
        subject_area,
        tags: tags || [],
        is_public,
        created_by: user.id
      })
      .select()
      .single()

    if (error) throw error

    logger.info('Question template created successfully', {
      userId: user.id,
      templateId: template.id,
      title
    })

    return NextResponse.json({
      success: true,
      data: template
    })

  } catch (error) {
    logger.error('Failed to create question template:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create template' 
      },
      { status: 500 }
    )
  }
})