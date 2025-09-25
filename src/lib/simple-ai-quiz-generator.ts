import { logger } from './logger'
import { ErrorHandler } from './errorHandler'
import { AIServiceFactory, BaseAIService } from './ai-services'
import { PromptBuilder, ResponseParser, FormatConverter } from './ai-quiz-generator'

// Import consolidated types
import type { 
  QuizGenerationRequest,
  GeneratedQuiz,
  GeneratedQuizQuestion
} from '@/types/consolidated-api'

// Enhanced question types matching QuizForm exactly
export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'

// Legacy interface for backward compatibility - will be deprecated
export interface SimpleQuizRequest {
  topic: string
  subject: string
  questionCount: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  questionTypes?: QuestionType[]
  language?: string
  explanationLanguage?: string
  customPrompt?: string // Optional custom prompt to override default generation
}

// Frontend-compatible quiz format that matches our form structure
export interface FrontendQuizData {
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  image_url: string
  is_published: boolean
  passing_score: number
  max_attempts: number
  questions: FrontendQuestion[]
}

export interface FrontendQuestion {
  id: string // Temporary ID for frontend
  question: string
  question_type: QuestionType
  options: string[] | Array<{left: string; right: string}> // Support matching pairs
  correct_answer: number | string | number[] | string[] // Support all answer types
  correct_answer_text: string | null
  explanation: string
  points: number
  order_index: number
  // Additional question features from your form
  difficulty_level?: 'easy' | 'medium' | 'hard'
  time_limit_seconds?: number
  tags?: string[]
}

export interface SimpleQuizResponse {
  success: boolean
  quiz?: FrontendQuizData
  error?: string
  debugInfo?: {
    prompt: string
    rawResponse: string
  }
}

export class SimpleAIQuizGenerator {
  private aiService: BaseAIService
  private promptBuilder: PromptBuilder
  private responseParser: ResponseParser
  private formatConverter: FormatConverter

  constructor() {
    // Initialize AI service without checking environment variables in constructor
    // The check will happen during the actual API call in generateContent
    this.aiService = AIServiceFactory.getDefaultService()
    this.promptBuilder = new PromptBuilder()
    this.responseParser = new ResponseParser()
    this.formatConverter = new FormatConverter()
  }

  async generateQuiz(request: SimpleQuizRequest): Promise<SimpleQuizResponse> {
    try {
      logger.info('Simple AI quiz generation started', {
        topic: request.topic,
        subject: request.subject,
        questionCount: request.questionCount
      })

      // Build simple, clear prompt
      const prompt = this.promptBuilder.buildContentPrompt(request)
      
      logger.info('Sending request to AI service', { promptLength: prompt.length })

      // Make AI request with retry logic and progressive token increases
      let attempts = 0
      const maxAttempts = 3
      let response: any = null
      
      // Progressive token limits to handle different content complexities
      const tokenLimits = [15000, 20000, 25000] // Increase on retry - much higher limits

      while (attempts < maxAttempts && (!response || !response.success || !response.content)) {
        attempts++
        const maxTokens = tokenLimits[attempts - 1] || 5000
        
        logger.info(`AI generation attempt ${attempts}/${maxAttempts}`, {
          maxTokens,
          temperature: attempts > 1 ? 0.5 : 0.7
        })
        
        response = await this.aiService.generateContent({
          prompt,
          systemPrompt: this.promptBuilder.buildSystemPrompt(request),
          maxTokens: maxTokens,
          temperature: attempts > 1 ? 0.5 : 0.7 // Lower temperature on retry for more consistent output
        })

        // Check if response was truncated (finish reason MAX_TOKENS)
        if (response.success && response.content) {
          // Try to parse to see if it's complete
          const testQuiz = this.responseParser.parseAIResponse(response.content, request)
          if (testQuiz) {
            logger.info('Valid quiz parsed successfully', { attempt: attempts })
            break // Success, exit loop
          } else if (attempts < maxAttempts) {
            logger.warn(`Attempt ${attempts} generated unparseable content, likely truncated - retrying with higher token limit`, {
              contentLength: response.content.length,
              nextMaxTokens: tokenLimits[attempts] || 5000
            })
            response = null // Force retry
          }
        }

        if (attempts < maxAttempts) {
          logger.warn(`Attempt ${attempts} failed, retrying...`, { 
            success: response?.success, 
            hasContent: !!response?.content,
            error: response?.error 
          })
          // Brief delay before retry
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      if (!response || !response.success || !response.content) {
        logger.error('AI service failed to generate content after all attempts', {
          attempts,
          lastResponse: {
            success: response?.success,
            error: response?.error,
            hasContent: !!response?.content
          }
        })
        
        return {
          success: false,
          error: response?.error || 'AI service failed to generate content after multiple attempts. Please try again.'
        }
      }

      logger.info('AI response received', { 
        contentLength: response.content.length,
        contentPreview: response.content.substring(0, 100) + '...'
      })

      // Parse and validate response
      const quiz = this.responseParser.parseAIResponse(response.content, request)
      
      if (!quiz) {
        return {
          success: false,
          error: 'Failed to parse AI response into valid quiz format',
          debugInfo: {
            prompt,
            rawResponse: response.content
          }
        }
      }

      // Convert to frontend-compatible format
      const frontendQuiz = this.formatConverter.convertToFrontendFormat(quiz, request)

      logger.info('Quiz generation successful', {
        questionsGenerated: frontendQuiz.questions.length,
        title: frontendQuiz.title
      })

      return {
        success: true,
        quiz: frontendQuiz,
        debugInfo: {
          prompt,
          rawResponse: response.content
        }
      }

    } catch (error: any) {
      const formattedError = ErrorHandler.handleError(error, 'simple-ai-quiz-generator.generateSimpleQuiz')

      return {
        success: false,
        error: formattedError.message
      }
    }
  }

  // Test the AI connection
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const testRequest: SimpleQuizRequest = {
        topic: 'Basic Math',
        subject: 'Mathematics',
        questionCount: 2,
        difficulty: 'beginner'
      }
      
      const result = await this.generateQuiz(testRequest)
      
      return {
        success: result.success,
        error: result.error
      }
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// The SimpleAIQuizGenerator class should only be instantiated on the server side
