// AI Services - Unified abstraction for all AI-powered features
// This module consolidates AI logic from API routes into reusable services

import { GoogleGenerativeAI } from '@google/generative-ai'

// Optimized imports
import { logger } from '@/lib'
import type { 
  QuizGenerationRequest,
  CourseGenerationRequest, 
  GeneratedQuiz,
  GeneratedQuizQuestion,
  GeneratedCourse,
  GeneratedModule,
  GeneratedLesson
} from '@/types'

// Base types for AI services
export interface AIServiceConfig {
  provider: 'gemini' | 'claude' | 'openai'
  apiKey?: string
  model?: string
  mockMode?: boolean
}

export interface AIGenerationRequest {
  prompt: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
}

export interface AIGenerationResponse {
  success: boolean
  content?: string
  error?: string
  finishReason?: string // For handling MAX_TOKENS, STOP, etc.
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// Base AI Service class
export abstract class BaseAIService {
  protected config: AIServiceConfig
  protected client: any

  constructor(config: AIServiceConfig) {
    this.config = config
  }

  abstract initialize(): Promise<void>
  abstract generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse>
  abstract testConnection(): Promise<{ success: boolean; error?: string }>
}

// Gemini AI Service Implementation
export class GeminiAIService extends BaseAIService {
  private genAI: GoogleGenerativeAI | null = null

  constructor(config: Omit<AIServiceConfig, 'provider'> = {}) {
    super({ ...config, provider: 'gemini' })
  }

  async initialize(): Promise<void> {
    const apiKey = this.config.apiKey || process.env.GOOGLE_AI_API_KEY
    
    if (!apiKey) {
      throw new Error('Google AI API key is required. Please set GOOGLE_AI_API_KEY environment variable.')
    }

    this.genAI = new GoogleGenerativeAI(apiKey)
    logger.info('Gemini AI service initialized', { model: this.config.model || 'gemini-2.5-pro' })
  }

  async generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    if (!this.genAI) {
      await this.initialize()
    }

    if (!this.genAI) {
      return {
        success: false,
        error: 'Failed to initialize Gemini AI service'
      }
    }

    try {
      const model = this.genAI.getGenerativeModel({ 
        model: this.config.model || 'gemini-2.5-pro',
        generationConfig: {
          maxOutputTokens: request.maxTokens || 2048,
          temperature: request.temperature || 0.7,
        }
      })

      const prompt = request.systemPrompt 
        ? `${request.systemPrompt}\n\n${request.prompt}`
        : request.prompt

      const result = await model.generateContent(prompt)
      const response = await result.response
      
      // Check for content filtering or other issues
      const finishReason = result.response.candidates?.[0]?.finishReason
      const safetyRatings = result.response.candidates?.[0]?.safetyRatings
      
      logger.info('Gemini response details', {
        candidates: result.response.candidates?.length || 0,
        finishReason: finishReason,
        hasText: !!response.text()
      })

      const content = response.text()

      if (!content || content.trim().length === 0) {
        logger.error('Gemini returned empty content', {
          finishReason,
          safetyRatings
        })
        
        return {
          success: false,
          error: 'AI service returned empty content. This might be due to content filtering or model restrictions.'
        }
      }

      // Log if response was truncated due to token limits
      if (finishReason === 'MAX_TOKENS') {
        logger.warn('Gemini response was truncated due to MAX_TOKENS limit', {
          contentLength: content.length,
          maxTokens: request.maxTokens || 2048,
          finishReason
        })
      }

      return {
        success: true,
        content,
        finishReason, // Include finish reason for caller to handle
        usage: {
          promptTokens: 0, // Gemini doesn't provide token counts
          completionTokens: 0,
          totalTokens: 0
        }
      }
    } catch (error: any) {
      logger.error('Gemini AI generation failed', { error: error?.message || 'Unknown error' })
      return {
        success: false,
        error: error.message || 'Content generation failed'
      }
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const testResponse = await this.generateContent({
        prompt: 'Test connection - respond with "OK"'
      })
      
      return testResponse.success 
        ? { success: true }
        : { success: false, error: testResponse.error }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Connection test failed'
      }
    }
  }
}

// AI Service Factory
export class AIServiceFactory {
  private static instances = new Map<string, BaseAIService>()

  static createService(config: AIServiceConfig): BaseAIService {
    const key = `${config.provider}-${config.model || 'default'}`
    
    if (this.instances.has(key)) {
      return this.instances.get(key)!
    }

    let service: BaseAIService

    switch (config.provider) {
      case 'gemini':
        service = new GeminiAIService(config)
        break
      case 'claude':
        throw new Error('Claude AI service not yet implemented')
      case 'openai':
        throw new Error('OpenAI service not yet implemented')
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`)
    }

    this.instances.set(key, service)
    return service
  }

  static getDefaultService(): BaseAIService {
    return this.createService({
      provider: 'gemini',
      model: 'gemini-2.5-pro'
    })
  }
}

// Specialized AI Services for different use cases

// Quiz Generation Service

export class QuizGenerationService {
  private aiService: BaseAIService

  constructor(aiService?: BaseAIService) {
    this.aiService = aiService || AIServiceFactory.getDefaultService()
  }

  async generateQuiz(request: QuizGenerationRequest): Promise<{ success: boolean; quiz?: GeneratedQuiz; error?: string }> {
    const questionTypes = request.question_types || ['multiple_choice', 'true_false']
    const subject = request.subject || 'General Knowledge'
    const language = request.language || 'English'
    
    const systemPrompt = `You are an expert educator creating educational quizzes across various subjects. 
Generate high-quality, educational questions that test comprehension and application of knowledge in ${subject}.
Ensure questions are clear, accurate, and appropriate for the specified difficulty level.
Always provide helpful explanations for correct answers.
Generate content in ${language} language.

CRITICAL CONSTRAINTS:
- Generate EXACTLY the requested number of questions - never more, never less
- Stay strictly within the specified topic - do not add general knowledge questions
- Use only the specified question types
- All questions must be directly related to the topic provided

CRITICAL: Follow exact JSON format requirements for each question type:
- multiple_choice/single_choice: use "correct_answer" as number (0-3 index)
- true_false: use "correct_answer" as number (0 for True, 1 for False)  
- fill_blank/essay: use "correct_answer_text" as string with the answer text
- ordering: use "correct_answer_json" as object mapping original indices to positions
- matching: use "correct_answer_json" as object mapping left indices to right indices`

    const prompt = `Generate EXACTLY ${request.question_count} questions for a ${request.difficulty} level ${subject} quiz about "${request.topic}".
Content should be in ${language} language.

STRICT REQUIREMENTS:
- Generate EXACTLY ${request.question_count} questions - no more, no less
- ALL questions MUST be about "${request.topic}" only - do not add general knowledge questions
- ONLY use these question types: ${questionTypes.join(', ')}
- ALL questions should be clear and educational for ${subject}
- Include brief explanations for correct answers
- Return valid JSON only
- Use correct answer format for each question type${request.additional_instructions ? `\n- ${request.additional_instructions}` : ''}

CRITICAL: Do not exceed ${request.question_count} questions. Do not mix in general knowledge. Stick to the topic "${request.topic}" exclusively.

JSON format examples:

For multiple_choice/single_choice questions:
{
  "question": "Which is correct?",
  "question_type": "multiple_choice",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer": 0,
  "explanation": "Brief explanation"
}

For true_false questions:
{
  "question": "This statement is true.",
  "question_type": "true_false", 
  "options": ["True", "False"],
  "correct_answer": 0,
  "explanation": "Brief explanation"
}

For fill_blank questions:
{
  "question": "Complete: I _____ to school every day.",
  "question_type": "fill_blank",
  "correct_answer_text": "go",
  "explanation": "Brief explanation"
}

For ordering questions:
{
  "question": "Arrange these words to form a correct sentence:",
  "question_type": "ordering",
  "options": ["quickly", "The", "ran", "dog", "home"],
  "correct_answer_json": {"1": 1, "3": 2, "2": 3, "4": 4, "0": 5},
  "explanation": "The correct order forms: 'The dog ran home quickly'"
}

For matching questions:
{
  "question": "Match the animals with their sounds:",
  "question_type": "matching", 
  "options": [{"left": ["Cat", "Dog", "Cow"], "right": ["Bark", "Meow", "Moo"]}],
  "correct_answer_json": {"0": 1, "1": 0, "2": 2},
  "explanation": "Each animal makes a distinctive sound"
}

Generate quiz with this structure:
{
  "title": "Quiz: ${request.topic}",
  "description": "Test your knowledge of ${request.topic}",
  "category": "${subject}",
  "difficulty": "${request.difficulty}",
  "duration_minutes": ${Math.max(10, request.question_count * 2)},
  "questions": [
    // Use appropriate format for each question type
  ]
}`

    try {
      // Calculate appropriate token limit based on question count
      // Each question needs roughly 300-400 tokens (question + options + explanation)
      const baseTokens = 1000 // For quiz metadata and structure
      const tokensPerQuestion = 400
      const calculatedTokens = baseTokens + (request.question_count * tokensPerQuestion)
      const maxTokens = Math.min(20000, Math.max(4096, calculatedTokens)) // Min 4096, max 20000
      
      logger.info('Quiz generation token calculation', {
        questionCount: request.question_count,
        calculatedTokens,
        maxTokens
      })

      const response = await this.aiService.generateContent({
        prompt,
        systemPrompt,
        maxTokens,
        temperature: 0.7
      })

      if (!response.success) {
        return { success: false, error: response.error }
      }

      // Check if response was truncated
      if (response.finishReason === 'MAX_TOKENS') {
        logger.warn('AI response was truncated due to token limit', {
          contentLength: response.content?.length,
          maxTokens,
          questionCount: request.question_count
        })
        
        // Try with increased token limit for retry
        return { 
          success: false, 
          error: `Quiz generation was truncated. Try reducing the number of questions to ${Math.max(10, request.question_count - 5)} or simplify the requirements.` 
        }
      }

      // Clean and parse JSON response
      const cleanedContent = response.content!.replace(/```json|```/g, '').trim()
      
      try {
        const quiz = JSON.parse(cleanedContent) as GeneratedQuiz
        
        // Validate the generated quiz
        if (!quiz.questions || quiz.questions.length === 0) {
          throw new Error('Generated quiz has no questions')
        }

        // Validate question count matches request
        if (quiz.questions.length !== request.question_count) {
          logger.warn('AI generated incorrect number of questions', {
            requested: request.question_count,
            generated: quiz.questions.length,
            topic: request.topic
          })
          throw new Error(`AI generated ${quiz.questions.length} questions instead of the requested ${request.question_count}`)
        }

        // Validate each question based on its type
        for (let i = 0; i < quiz.questions.length; i++) {
          const question = quiz.questions[i]
          if (!question) continue
          
          const questionNum = i + 1
          
          // Validate question type
          const validTypes = ['multiple_choice', 'single_choice', 'true_false', 'fill_blank', 'essay']
          if (!validTypes.includes(question.question_type)) {
            throw new Error(`Question ${questionNum}: Invalid question_type "${question.question_type}"`)
          }
          
          // Validate based on question type
          if (['multiple_choice', 'single_choice'].includes(question.question_type)) {
            // Choice questions need options and numeric correct_answer
            if (!Array.isArray(question.options) || question.options.length < 2) {
              throw new Error(`Question ${questionNum}: Multiple choice questions need at least 2 options`)
            }
            if (typeof question.correct_answer !== 'number' || 
                question.correct_answer < 0 || 
                question.correct_answer >= question.options.length) {
              throw new Error(`Question ${questionNum}: correct_answer must be valid option index (0-${question.options.length - 1})`)
            }
          } else if (question.question_type === 'true_false') {
            // True/false questions need exactly 2 options and correct_answer 0 or 1
            if (!Array.isArray(question.options) || 
                question.options.length !== 2 ||
                !question.options.includes('True') || 
                !question.options.includes('False')) {
              throw new Error(`Question ${questionNum}: True/false questions must have exactly ["True", "False"] options`)
            }
            if (typeof question.correct_answer !== 'number' || 
                (question.correct_answer !== 0 && question.correct_answer !== 1)) {
              throw new Error(`Question ${questionNum}: True/false correct_answer must be 0 (True) or 1 (False)`)
            }
          } else if (['fill_blank', 'essay'].includes(question.question_type)) {
            // Text questions need correct_answer_text
            if (!question.correct_answer_text || typeof question.correct_answer_text !== 'string') {
              throw new Error(`Question ${questionNum}: Fill-blank/essay questions must have correct_answer_text`)
            }
            // Set correct_answer to 0 for database compatibility
            question.correct_answer = 0
          }
          
          // Ensure explanation exists
          if (!question.explanation || typeof question.explanation !== 'string') {
            throw new Error(`Question ${questionNum}: Missing explanation`)
          }
        }

        logger.info('Quiz generated successfully', { 
          topic: request.topic, 
          questionsCount: quiz.questions.length 
        })

        return { success: true, quiz }
      } catch (parseError: any) {
        logger.error('Failed to parse generated quiz JSON:', {
          error: parseError.message,
          contentPreview: cleanedContent.substring(0, 500) + '...',
          contentLength: cleanedContent.length,
          questionCount: request.question_count
        })
        
        // Check if content was likely truncated
        const lastChar = cleanedContent.trim().slice(-1)
        const isTruncated = !cleanedContent.trim().endsWith('}') && !cleanedContent.trim().endsWith('"]')
        
        if (isTruncated) {
          return { 
            success: false, 
            error: `Quiz generation was incomplete. Try reducing questions to ${Math.max(10, request.question_count - 3)} or simplifying requirements.` 
          }
        }
        
        return { 
          success: false, 
          error: 'AI generated invalid format. Please try again with simpler requirements or fewer questions.' 
        }
      }
    } catch (error: any) {
      logger.error('Quiz generation failed', { error: error?.message || 'Unknown error' })
      return { 
        success: false, 
        error: error.message || 'Quiz generation failed' 
      }
    }
  }
}

// Course Generation Service

export class CourseGenerationService {
  private aiService: BaseAIService
  private quizService: QuizGenerationService

  constructor(aiService?: BaseAIService) {
    this.aiService = aiService || AIServiceFactory.getDefaultService()
    this.quizService = new QuizGenerationService(this.aiService)
  }

  async generateCourse(request: CourseGenerationRequest): Promise<{ success: boolean; course?: GeneratedCourse; error?: string }> {
    // Course generation logic would go here
    // This is a placeholder for the existing course generation functionality
    throw new Error('Course generation service not yet implemented - use existing AICourseGenerator')
  }
}

// Export default instances for easy use
export const defaultAIService = AIServiceFactory.getDefaultService()
export const quizGenerationService = new QuizGenerationService()
export const courseGenerationService = new CourseGenerationService()

// Utility functions
export function isAIServiceConfigured(): boolean {
  return !!(process.env.GOOGLE_AI_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY)
}

export async function testAIConnection(): Promise<{ success: boolean; provider?: string; error?: string }> {
  try {
    const service = AIServiceFactory.getDefaultService()
    const result = await service.testConnection()
    
    return {
      ...result,
      provider: 'gemini'
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'AI service test failed'
    }
  }
}
