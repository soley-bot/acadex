import { createServiceClient } from '../../api-auth'
import type { 
  CreateQuizRequest,
  ServiceResponse,
  Quiz,
  QuizWithQuestions,
  QuizFilters
} from '../shared'
import { validateQuizData } from '../shared'

export const adminQuizAPI = {
  // Create new quiz (Admin only)
  async createQuiz(
    quizData: CreateQuizRequest, 
    adminUserId: string
  ): Promise<ServiceResponse<Quiz>> {
    const validation = validateQuizData(quizData)
    if (!validation.valid) {
      return {
        data: null,
        error: new Error(`Invalid quiz data: ${validation.errors.join(', ')}`)
      }
    }

    const serviceClient = createServiceClient()
    const { data, error } = await serviceClient
      .from('quizzes')
      .insert({
        ...quizData,
        created_by: adminUserId,
        total_questions: 0, // Will be updated when questions are added
        is_published: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    return { data, error }
  },

  // Update existing quiz (Admin only)
  async updateQuiz(
    quizId: string,
    updates: Partial<Quiz>,
    adminUserId: string
  ): Promise<ServiceResponse<Quiz>> {
    const serviceClient = createServiceClient()
    
    // Security check: Verify quiz exists and user has permission
    const { data: existingQuiz } = await serviceClient
      .from('quizzes')
      .select('id, created_by')
      .eq('id', quizId)
      .single()

    if (!existingQuiz) {
      return {
        data: null,
        error: new Error('Quiz not found')
      }
    }

    const { data, error } = await serviceClient
      .from('quizzes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', quizId)
      .select()
      .single()

    return { data, error }
  },

  // Delete quiz (Admin only)
  async deleteQuiz(
    quizId: string,
    adminUserId: string
  ): Promise<ServiceResponse<{ success: boolean }>> {
    const serviceClient = createServiceClient()
    
    // First delete all questions
    await serviceClient
      .from('quiz_questions')
      .delete()
      .eq('quiz_id', quizId)

    // Then delete the quiz
    const { error } = await serviceClient
      .from('quizzes')
      .delete()
      .eq('id', quizId)

    return {
      data: error ? null : { success: true },
      error
    }
  },

  // Get all quizzes for admin with advanced filtering
  async getAdminQuizzes(filters?: QuizFilters & {
    includeUnpublished?: boolean;
    mode?: 'slim' | 'full' | 'reading';
    fields?: string[];
  }): Promise<ServiceResponse<{
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  }>> {
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1
    const mode = filters?.mode || 'full'

    // Define field sets for different modes
    const fieldSets = {
      slim: `id, title, category, difficulty, is_published, created_at, image_url`,
      full: `
        id, title, description, category, difficulty, duration_minutes,
        total_questions, passing_score, max_attempts, time_limit_minutes,
        is_published, created_at, updated_at, image_url, course_id, lesson_id,
        shuffle_questions, shuffle_options, show_results_immediately,
        allow_review, allow_backtrack, randomize_questions,
        questions_per_page, show_progress, auto_submit, instructions,
        tags, estimated_time_minutes
      `,
      reading: `
        id, title, description, category, difficulty, duration_minutes,
        is_published, created_at, updated_at, image_url,
        reading_passage, passage_title, passage_source, passage_audio_url,
        word_count, estimated_read_time
      `
    }

    const selectFields = filters?.fields?.length 
      ? filters.fields.join(', ')
      : fieldSets[mode]

    const serviceClient = createServiceClient()
    let query = serviceClient
      .from('quizzes')
      .select(selectFields, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }

    // Admin can see unpublished quizzes unless explicitly filtered
    if (filters?.includeUnpublished === false) {
      query = query.eq('is_published', true)
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      return { data: null, error }
    }

    return {
      data: {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasMore: (count || 0) > to + 1
        }
      },
      error: null
    }
  },

  // Get single quiz with questions for editing (Admin only)
  async getQuizForEditing(quizId: string): Promise<ServiceResponse<QuizWithQuestions | null>> {
    const serviceClient = createServiceClient()
    
    const { data: quiz, error: quizError } = await serviceClient
      .from('quizzes')
      .select(`
        id, title, description, category, difficulty, duration_minutes,
        total_questions, course_id, lesson_id, passing_score, max_attempts,
        time_limit_minutes, image_url, is_published, created_at, updated_at,
        reading_passage, passage_title, passage_source, passage_audio_url,
        word_count, estimated_read_time, shuffle_questions, shuffle_options,
        show_results_immediately, allow_review, allow_backtrack,
        randomize_questions, questions_per_page, show_progress, auto_submit,
        instructions, tags, estimated_time_minutes
      `)
      .eq('id', quizId)
      .single()

    if (quizError) {
      return { data: null, error: quizError }
    }

    const { data: questions, error: questionsError } = await serviceClient
      .from('quiz_questions')
      .select(`
        id, quiz_id, question, question_type, options, correct_answer,
        correct_answer_text, correct_answer_json, explanation, order_index,
        points, difficulty_level, image_url, audio_url, video_url,
        randomize_options, partial_credit, feedback_correct, feedback_incorrect,
        hint, time_limit_seconds, weight, auto_grade, question_metadata
      `)
      .eq('quiz_id', quizId)
      .order('order_index')

    if (questionsError) {
      return { data: null, error: questionsError }
    }

    return {
      data: quiz ? { ...quiz, questions } : null,
      error: null
    }
  },

  // Add question to quiz
  async addQuestionToQuiz(
    quizId: string,
    questionData: any,
    adminUserId: string
  ): Promise<ServiceResponse<any>> {
    const serviceClient = createServiceClient()
    
    // Get the next order index
    const { data: maxOrder } = await serviceClient
      .from('quiz_questions')
      .select('order_index')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (maxOrder?.order_index || 0) + 1

    const { data, error } = await serviceClient
      .from('quiz_questions')
      .insert({
        ...questionData,
        quiz_id: quizId,
        order_index: nextOrder
      })
      .select()
      .single()

    // Update quiz question count
    if (!error) {
      await this.updateQuizQuestionCount(quizId)
    }

    return { data, error }
  },

  // Update question
  async updateQuestion(
    questionId: string,
    updates: any,
    adminUserId: string
  ): Promise<ServiceResponse<any>> {
    const serviceClient = createServiceClient()
    
    const { data, error } = await serviceClient
      .from('quiz_questions')
      .update(updates)
      .eq('id', questionId)
      .select()
      .single()

    return { data, error }
  },

  // Delete question
  async deleteQuestion(
    questionId: string,
    adminUserId: string
  ): Promise<ServiceResponse<{ success: boolean }>> {
    const serviceClient = createServiceClient()
    
    // Get quiz ID before deletion
    const { data: question } = await serviceClient
      .from('quiz_questions')
      .select('quiz_id')
      .eq('id', questionId)
      .single()

    const { error } = await serviceClient
      .from('quiz_questions')
      .delete()
      .eq('id', questionId)

    // Update quiz question count
    if (!error && question?.quiz_id) {
      await this.updateQuizQuestionCount(question.quiz_id)
    }

    return {
      data: error ? null : { success: true },
      error
    }
  },

  // Reorder questions
  async reorderQuestions(
    quizId: string,
    questionOrders: { id: string; order_index: number }[],
    adminUserId: string
  ): Promise<ServiceResponse<{ success: boolean }>> {
    const serviceClient = createServiceClient()
    
    // Update all question orders in batch
    const promises = questionOrders.map(({ id, order_index }) =>
      serviceClient
        .from('quiz_questions')
        .update({ order_index })
        .eq('id', id)
    )

    try {
      await Promise.all(promises)
      return { data: { success: true }, error: null }
    } catch (error: any) {
      return { data: null, error: error as any }
    }
  },

  // Publish/unpublish quiz
  async toggleQuizPublication(
    quizId: string,
    isPublished: boolean,
    adminUserId: string
  ): Promise<ServiceResponse<Quiz>> {
    return this.updateQuiz(quizId, { is_published: isPublished }, adminUserId)
  },

  // Duplicate quiz
  async duplicateQuiz(
    sourceQuizId: string,
    newTitle: string,
    adminUserId: string
  ): Promise<ServiceResponse<Quiz>> {
    const serviceClient = createServiceClient()
    
    // Get source quiz with questions
    const sourceQuizResult = await this.getQuizForEditing(sourceQuizId)
    if (!sourceQuizResult.data) {
      return { data: null, error: sourceQuizResult.error }
    }

    const sourceQuiz = sourceQuizResult.data
    const { questions, ...quizData } = sourceQuiz

    // Create new quiz
    const { data: newQuiz, error: quizError } = await serviceClient
      .from('quizzes')
      .insert({
        ...quizData,
        id: undefined, // Let DB generate new ID
        title: newTitle,
        created_by: adminUserId,
        is_published: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (quizError) {
      return { data: null, error: quizError }
    }

    // Copy questions if any exist
    if (questions && questions.length > 0) {
      const questionsToInsert = questions.map(question => ({
        ...question,
        id: undefined, // Let DB generate new ID
        quiz_id: newQuiz.id
      }))

      await serviceClient
        .from('quiz_questions')
        .insert(questionsToInsert)
    }

    return { data: newQuiz, error: null }
  },

  // Helper method to update quiz question count
  async updateQuizQuestionCount(quizId: string): Promise<void> {
    const serviceClient = createServiceClient()
    
    const { count } = await serviceClient
      .from('quiz_questions')
      .select('*', { count: 'exact' })
      .eq('quiz_id', quizId)

    await serviceClient
      .from('quizzes')
      .update({ total_questions: count || 0 })
      .eq('id', quizId)
  }
}