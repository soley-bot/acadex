import type { 
  SimpleQuizRequest, 
  FrontendQuizData, 
  FrontendQuestion, 
  QuestionType 
} from '../simple-ai-quiz-generator'

/**
 * Converts AI-generated quiz responses to frontend-compatible formats
 * Handles data transformation and normalization for the quiz editor
 */
export class FormatConverter {
  /**
   * Convert AI response to frontend-compatible format
   */
  convertToFrontendFormat(aiQuiz: any, request: SimpleQuizRequest): FrontendQuizData {
    return {
      title: aiQuiz.title || `Quiz: ${request.topic}`,
      description: aiQuiz.description || `Test your knowledge of ${request.topic}`,
      category: aiQuiz.category || request.subject,
      difficulty: request.difficulty,
      duration_minutes: aiQuiz.duration_minutes || Math.max(request.questionCount * 2, 15),
      image_url: '', // Empty for manual selection
      is_published: false, // Default to unpublished for manual review
      passing_score: 70, // Default passing score
      max_attempts: 0, // 0 = unlimited attempts
      questions: this.convertQuestions(aiQuiz.questions)
    }
  }

  /**
   * Convert AI questions to frontend question format
   */
  private convertQuestions(aiQuestions: any[]): FrontendQuestion[] {
    return aiQuestions.map((q: any, index: number) => {
      // Normalize question type - single_choice should be treated as multiple_choice
      const normalizedQuestionType = q.question_type === 'single_choice' 
        ? 'multiple_choice' 
        : q.question_type

      // Handle different answer formats based on question type
      const { correctAnswer, correctAnswerText } = this.processCorrectAnswer(
        normalizedQuestionType, 
        q
      )

      return {
        id: `temp_${crypto.randomUUID()}`, // Use crypto.randomUUID() to prevent collisions
        question: q.question,
        question_type: normalizedQuestionType as QuestionType,
        options: q.options || [],
        correct_answer: correctAnswer,
        correct_answer_text: correctAnswerText,
        explanation: q.explanation || '',
        points: q.points || 1, // Default points per question
        order_index: index,
        // Additional features matching the form
        difficulty_level: q.difficulty_level || 'medium',
        time_limit_seconds: q.time_limit_seconds || null,
        tags: q.tags || []
      }
    })
  }

  /**
   * Process correct answer based on question type
   */
  private processCorrectAnswer(
    questionType: string, 
    question: any
  ): { correctAnswer: number | string | number[] | string[], correctAnswerText: string | null } {
    let correctAnswer: number | string | number[] | string[]
    let correctAnswerText: string | null = null

    switch (questionType) {
      case 'multiple_choice':
      case 'true_false':
        correctAnswer = typeof question.correct_answer === 'number' ? question.correct_answer : 0
        break

      case 'fill_blank':
      case 'essay':
        correctAnswer = 0
        correctAnswerText = question.correct_answer_text || question.correct_answer || ''
        break

      case 'matching':
      case 'ordering':
        correctAnswer = Array.isArray(question.correct_answer) ? question.correct_answer : [0]
        break

      default:
        correctAnswer = 0
    }

    return { correctAnswer, correctAnswerText }
  }

  /**
   * Convert frontend quiz data back to simplified format for API calls
   */
  convertFromFrontendFormat(frontendQuiz: FrontendQuizData): any {
    return {
      title: frontendQuiz.title,
      description: frontendQuiz.description,
      category: frontendQuiz.category,
      difficulty: frontendQuiz.difficulty,
      duration_minutes: frontendQuiz.duration_minutes,
      questions: frontendQuiz.questions.map(q => ({
        question: q.question,
        question_type: q.question_type,
        options: q.options,
        correct_answer: q.correct_answer,
        correct_answer_text: q.correct_answer_text,
        explanation: q.explanation,
        points: q.points,
        difficulty_level: q.difficulty_level,
        time_limit_seconds: q.time_limit_seconds,
        tags: q.tags
      }))
    }
  }

  /**
   * Validate frontend quiz data structure
   */
  validateFrontendFormat(quiz: FrontendQuizData): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate required fields
    if (!quiz.title) errors.push('Title is required')
    if (!quiz.description) errors.push('Description is required')
    if (!quiz.category) errors.push('Category is required')
    if (!quiz.difficulty) errors.push('Difficulty is required')
    
    // Validate numeric fields
    if (quiz.duration_minutes <= 0) errors.push('Duration must be positive')
    if (quiz.passing_score < 0 || quiz.passing_score > 100) {
      errors.push('Passing score must be between 0 and 100')
    }
    
    // Validate questions
    if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      errors.push('At least one question is required')
    } else {
      quiz.questions.forEach((q, index) => {
        const questionErrors = this.validateQuestion(q, index + 1)
        errors.push(...questionErrors)
      })
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate individual question
   */
  private validateQuestion(question: FrontendQuestion, questionNumber: number): string[] {
    const errors: string[] = []
    const prefix = `Question ${questionNumber}:`

    if (!question.question) {
      errors.push(`${prefix} Question text is required`)
    }

    if (!question.question_type) {
      errors.push(`${prefix} Question type is required`)
    }

    if (!question.explanation) {
      errors.push(`${prefix} Explanation is required`)
    }

    if (question.points <= 0) {
      errors.push(`${prefix} Points must be positive`)
    }

    // Type-specific validations
    switch (question.question_type) {
      case 'multiple_choice':
        if (!Array.isArray(question.options) || question.options.length < 2) {
          errors.push(`${prefix} Multiple choice needs at least 2 options`)
        }
        if (typeof question.correct_answer !== 'number' || 
            question.correct_answer < 0 || 
            question.correct_answer >= (question.options?.length || 0)) {
          errors.push(`${prefix} Invalid correct answer index`)
        }
        break

      case 'true_false':
        if (!Array.isArray(question.options) || question.options.length !== 2) {
          errors.push(`${prefix} True/False needs exactly 2 options`)
        }
        if (typeof question.correct_answer !== 'number' || 
            (question.correct_answer !== 0 && question.correct_answer !== 1)) {
          errors.push(`${prefix} True/False correct answer must be 0 or 1`)
        }
        break

      case 'fill_blank':
      case 'essay':
        if (!question.correct_answer_text) {
          errors.push(`${prefix} Answer text is required`)
        }
        break

      case 'matching':
        if (!Array.isArray(question.options) || 
            !question.options.every((opt: any) => 
              typeof opt === 'object' && opt.left && opt.right)) {
          errors.push(`${prefix} Matching needs options with left/right pairs`)
        }
        if (!Array.isArray(question.correct_answer)) {
          errors.push(`${prefix} Matching needs correct answer as array`)
        }
        break

      case 'ordering':
        if (!Array.isArray(question.options) || question.options.length < 2) {
          errors.push(`${prefix} Ordering needs at least 2 items`)
        }
        if (!Array.isArray(question.correct_answer)) {
          errors.push(`${prefix} Ordering needs correct answer as array of indices`)
        }
        break
    }

    return errors
  }
}