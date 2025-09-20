import type { SimpleQuizRequest } from '../simple-ai-quiz-generator'
import { logger } from '../logger'
import { JSONUtils } from './json-utils'

/**
 * Handles parsing and validation of AI-generated quiz responses
 * Normalizes different response formats and validates question structures
 */
export class ResponseParser {
  /**
   * Parse AI response content into a validated quiz structure
   */
  parseAIResponse(content: string, request: SimpleQuizRequest): any {
    // Extract and clean JSON content
    const cleanContent = JSONUtils.extractJSONContent(content)
    if (!cleanContent) {
      return null
    }

    // Fix common JSON issues
    const fixedContent = JSONUtils.fixCommonJSONIssues(cleanContent)

    // Parse JSON safely
    const rawQuiz = JSONUtils.safeParse(fixedContent)
    if (!rawQuiz) {
      return null
    }

    // Normalize the quiz structure
    const normalizedQuiz = this.normalizeQuizStructure(rawQuiz, request)
    if (!normalizedQuiz) {
      return null
    }

    // Validate the quiz structure
    if (!this.validateQuizStructure(normalizedQuiz, request)) {
      return null
    }

    // Validate each question
    if (!this.validateQuestions(normalizedQuiz.questions, request)) {
      return null
    }

    // Ensure required fields are present
    this.ensureRequiredFields(normalizedQuiz, request)

    return normalizedQuiz
  }

  /**
   * Normalize different AI response formats to a consistent structure
   */
  private normalizeQuizStructure(rawQuiz: any, request: SimpleQuizRequest): any {
    let quiz: any = {}

    if (rawQuiz.quiz_title && rawQuiz.questions) {
      // Format: { "quiz_title": "...", "quiz_description": "...", "questions": [...] }
      quiz = {
        title: rawQuiz.quiz_title,
        description: rawQuiz.quiz_description || '',
        questions: rawQuiz.questions
      }
    } else if (rawQuiz.quiz && Array.isArray(rawQuiz.quiz)) {
      // Format: { "quiz": [...] } (questions array)
      quiz = {
        title: request.topic || 'Generated Quiz',
        description: `A ${request.difficulty} level quiz about ${request.topic}`,
        questions: rawQuiz.quiz
      }
    } else if (rawQuiz.title && rawQuiz.questions) {
      // Format: { "title": "...", "questions": [...] }
      quiz = rawQuiz
    } else if (rawQuiz.questions) {
      // Format: { "questions": [...] }
      quiz = {
        title: request.topic || 'Generated Quiz',
        description: `A ${request.difficulty} level quiz about ${request.topic}`,
        questions: rawQuiz.questions
      }
    } else if (Array.isArray(rawQuiz)) {
      // Format: [...] (just questions array)
      quiz = {
        title: request.topic || 'Generated Quiz',
        description: `A ${request.difficulty} level quiz about ${request.topic}`,
        questions: rawQuiz
      }
    } else {
      logger.error('Invalid quiz structure - cannot determine format', { 
        availableKeys: Object.keys(rawQuiz),
        rawQuiz: rawQuiz 
      })
      return null
    }

    // Normalize question field names
    if (quiz.questions) {
      quiz.questions = quiz.questions.map((q: any) => ({
        ...q,
        // Normalize question text field
        question: q.question || q.question_text || q.text,
        // Ensure we have the correct field names
        question_type: q.question_type,
        options: q.options || [],
        correct_answer: q.correct_answer,
        correct_answer_text: q.correct_answer_text,
        explanation: q.explanation
      }))
    }

    return quiz
  }

  /**
   * Validate the basic quiz structure
   */
  private validateQuizStructure(quiz: any, request: SimpleQuizRequest): boolean {
    if (!quiz.title || !quiz.questions || !Array.isArray(quiz.questions)) {
      logger.error('Invalid quiz structure after normalization', { 
        hasTitle: !!quiz.title,
        hasQuestions: !!quiz.questions,
        questionsIsArray: Array.isArray(quiz.questions),
        quiz: quiz 
      })
      return false
    }
    
    if (quiz.questions.length !== request.questionCount) {
      logger.warn('Question count mismatch', {
        expected: request.questionCount,
        actual: quiz.questions.length
      })
    }

    return true
  }

  /**
   * Validate all questions in the quiz
   */
  private validateQuestions(questions: any[], request: SimpleQuizRequest): boolean {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      
      if (!q.question || !q.question_type) {
        logger.error(`Question ${i + 1} missing required fields`)
        return false
      }
      
      // Validate that only requested question types are used
      if (!request.questionTypes?.includes(q.question_type)) {
        logger.error(`Question ${i + 1} has invalid question type: ${q.question_type}. Only allowed: ${request.questionTypes?.join(', ')}`)
        return false
      }
      
      // Validate question type specific requirements
      if (!this.validateQuestionType(q, i + 1)) {
        return false
      }
    }

    return true
  }

  /**
   * Validate question type specific requirements
   */
  private validateQuestionType(question: any, questionNumber: number): boolean {
    const q = question
    
    switch (q.question_type) {
      case 'multiple_choice':
        if (!Array.isArray(q.options) || q.options.length < 2) {
          logger.error(`Question ${questionNumber} multiple choice needs options`)
          return false
        }
        if (typeof q.correct_answer !== 'number' || 
            q.correct_answer < 0 || 
            q.correct_answer >= q.options.length) {
          logger.error(`Question ${questionNumber} has invalid correct_answer`)
          return false
        }
        break

      case 'true_false':
        if (!Array.isArray(q.options) || q.options.length !== 2) {
          // Fix true/false options if needed
          q.options = ['True', 'False']
        }
        if (typeof q.correct_answer !== 'number' || 
            (q.correct_answer !== 0 && q.correct_answer !== 1)) {
          logger.error(`Question ${questionNumber} true/false has invalid correct_answer`)
          return false
        }
        break

      case 'fill_blank':
        if (!q.correct_answer_text || typeof q.correct_answer_text !== 'string') {
          logger.error(`Question ${questionNumber} fill_blank needs correct_answer_text`)
          return false
        }
        q.options = [] // Fill blank has no options
        q.correct_answer = 0 // Standard for fill_blank
        break

      case 'essay':
        if (!q.correct_answer_text || typeof q.correct_answer_text !== 'string') {
          logger.error(`Question ${questionNumber} essay needs correct_answer_text as sample answer`)
          return false
        }
        q.options = [] // Essay has no options
        q.correct_answer = 0 // Standard for essay
        break

      case 'matching':
        if (!Array.isArray(q.options) || !q.options.every((opt: any) => opt.left && opt.right)) {
          logger.error(`Question ${questionNumber} matching needs options with left/right pairs`)
          return false
        }
        if (!Array.isArray(q.correct_answer)) {
          logger.error(`Question ${questionNumber} matching needs correct_answer as array`)
          return false
        }
        break

      case 'ordering':
        if (!Array.isArray(q.options) || q.options.length < 2) {
          logger.error(`Question ${questionNumber} ordering needs array of items to order`)
          return false
        }
        if (!Array.isArray(q.correct_answer)) {
          logger.error(`Question ${questionNumber} ordering needs correct_answer as array of indices`)
          return false
        }
        break

      default:
        logger.error(`Question ${questionNumber} has unsupported question type: ${q.question_type}`)
        return false
    }

    return true
  }

  /**
   * Ensure required fields are present with defaults
   */
  private ensureRequiredFields(quiz: any, request: SimpleQuizRequest): void {
    quiz.difficulty = quiz.difficulty || request.difficulty
    quiz.category = quiz.category || request.subject
    quiz.duration_minutes = quiz.duration_minutes || (request.questionCount * 2)
  }
}