import { GoogleGenerativeAI } from '@google/generative-ai'
import { logger } from './logger'

// Enhanced quiz generation request with more question types
export interface QuizGenerationRequest {
  topic: string
  question_count: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  question_types?: Array<'multiple_choice' | 'true_false' | 'fill_blank' | 'essay'> // Optional specific types
  subject?: string // Subject/category for the quiz (not hardcoded to English)
  language?: string // Language for quiz content (defaults to detected from topic)
}

export interface GeneratedQuizQuestion {
  question: string
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'
  options?: string[] | Array<{left: string; right: string}> // Multiple choice, true/false, or matching pairs
  correct_answer: number | string | Array<any> // Specific type based on question_type
  explanation: string
}

export interface GeneratedQuiz {
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  questions: GeneratedQuizQuestion[]
}

export class AIQuizGenerator {
  private genAI: GoogleGenerativeAI | null = null

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey)
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.genAI) {
      return { 
        success: false, 
        error: 'Google AI API not configured. Please set GOOGLE_AI_API_KEY environment variable.' 
      }
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
      await model.generateContent('Test connection')
      return { success: true }
    } catch (error: any) {
      logger.error('AI connection test failed:', error)
      return { 
        success: false, 
        error: `Connection failed: ${error.message}` 
      }
    }
  }

  // Validate AI-generated question format before returning
  private validateGeneratedQuestion(question: any, index: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!question.question || typeof question.question !== 'string') {
      errors.push(`Question ${index + 1}: Missing or invalid question text`)
    }
    
    if (!question.question_type || !['multiple_choice', 'true_false', 'fill_blank', 'essay'].includes(question.question_type)) {
      errors.push(`Question ${index + 1}: Invalid question type`)
    }
    
    // Validate correct_answer format based on question type
    if (question.question_type === 'multiple_choice') {
      if (!Array.isArray(question.options) || question.options.length < 2) {
        errors.push(`Question ${index + 1}: Multiple choice needs at least 2 options`)
      }
      if (typeof question.correct_answer !== 'number' || question.correct_answer < 0 || question.correct_answer >= (question.options?.length || 0)) {
        errors.push(`Question ${index + 1}: Multiple choice correct_answer must be valid option index (number)`)
      }
    }
    
    if (question.question_type === 'true_false') {
      if (!Array.isArray(question.options) || question.options.length !== 2) {
        errors.push(`Question ${index + 1}: True/False must have exactly 2 options`)
      }
      if (typeof question.correct_answer !== 'number' || ![0, 1].includes(question.correct_answer)) {
        errors.push(`Question ${index + 1}: True/False correct_answer must be 0 or 1`)
      }
    }
    
    if (['fill_blank', 'essay'].includes(question.question_type)) {
      if (typeof question.correct_answer !== 'string' || !question.correct_answer.trim()) {
        errors.push(`Question ${index + 1}: ${question.question_type} requires text answer`)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  async generateQuiz(request: QuizGenerationRequest): Promise<{ success: boolean; quiz?: GeneratedQuiz; error?: string }> {
    if (!this.genAI) {
      return { 
        success: false, 
        error: 'Google AI API not configured. Please check your GOOGLE_AI_API_KEY environment variable.' 
      }
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
      
      // Detailed, specific prompt for proper answer formatting - language agnostic
      const prompt = `Generate a ${request.difficulty} level quiz about "${request.topic}" with ${request.question_count} questions.

SUBJECT: ${request.subject || 'General Knowledge'}
LANGUAGE: Generate content in the language most appropriate for the topic, or ${request.language || 'English'} if specified.

CRITICAL REQUIREMENTS:
- Mix of multiple choice (4 options) and true/false questions
- Content should be relevant to the subject area: ${request.subject || 'the specified topic'}
- EXACT correct_answer format based on question type:
  * multiple_choice: correct_answer must be INTEGER (0-3 for option index)
  * true_false: correct_answer must be INTEGER (0 for True, 1 for False)
- Questions should be clear and educational
- Include brief explanations for correct answers
- Return valid JSON only

EXACT JSON format - DO NOT DEVIATE:
{
  "title": "Quiz: ${request.topic}",
  "description": "Test your knowledge of ${request.topic}",
  "category": "${request.subject || 'General Knowledge'}",
  "difficulty": "${request.difficulty}",
  "duration_minutes": ${Math.max(10, request.question_count * 2)},
  "questions": [
    {
      "question": "Which of the following is correct?",
      "question_type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 2,
      "explanation": "Option C is correct because..."
    },
    {
      "question": "True or False statement here.",
      "question_type": "true_false", 
      "options": ["True", "False"],
      "correct_answer": 0,
      "explanation": "This is true because..."
    }
  ]
}

IMPORTANT: 
- correct_answer MUST be integer for multiple_choice and true_false
- For multiple_choice: 0=first option, 1=second option, 2=third option, 3=fourth option
- For true_false: 0=True, 1=False
- Adapt language and cultural context to the subject matter`
      
      logger.info('Generating simple AI quiz...', { topic: request.topic, count: request.question_count })
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Clean and parse response
      const cleanedText = text.replace(/```json|```/g, '').trim()
      
      try {
        const generatedQuiz = JSON.parse(cleanedText)
        
        // Validate each question before returning
        if (generatedQuiz.questions && Array.isArray(generatedQuiz.questions)) {
          const validationErrors: string[] = []
          
          generatedQuiz.questions.forEach((question: any, index: number) => {
            const validation = this.validateGeneratedQuestion(question, index)
            if (!validation.isValid) {
              validationErrors.push(...validation.errors)
            }
          })
          
          if (validationErrors.length > 0) {
            logger.error('AI generated quiz validation failed:', validationErrors)
            return { 
              success: false, 
              error: `Generated quiz has validation errors: ${validationErrors.join('; ')}`
            }
          }
        }
        
        logger.info('Quiz generated successfully', { questionsCount: generatedQuiz.questions?.length })
        return { success: true, quiz: generatedQuiz }
      } catch (parseError: any) {
        logger.error('JSON parsing failed', { error: parseError.message })
        return { 
          success: false, 
          error: `Failed to parse AI response. Please try again.` 
        }
      }

    } catch (error: any) {
      logger.error('AI quiz generation failed:', error)
      return { 
        success: false, 
        error: `Generation failed: ${error.message}` 
      }
    }
  }
}
