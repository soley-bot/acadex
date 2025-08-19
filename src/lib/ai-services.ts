// AI Services - Unified abstraction for all AI-powered features
// This module consolidates AI logic from API routes into reusable services

import { GoogleGenerativeAI } from '@google/generative-ai'
import { logger } from './logger'

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
    logger.info('Gemini AI service initialized', { model: this.config.model || 'gemini-1.5-flash' })
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
        model: this.config.model || 'gemini-1.5-flash',
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
      const content = response.text()

      return {
        success: true,
        content,
        usage: {
          promptTokens: 0, // Gemini doesn't provide token counts
          completionTokens: 0,
          totalTokens: 0
        }
      }
    } catch (error: any) {
      logger.error('Gemini AI generation failed:', error)
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
      model: 'gemini-1.5-flash'
    })
  }
}

// Specialized AI Services for different use cases

// Quiz Generation Service
export interface QuizGenerationRequest {
  topic: string
  questionCount: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  questionTypes?: ('multiple_choice' | 'true_false' | 'fill_blank')[]
}

export interface GeneratedQuizQuestion {
  question: string
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank'
  options?: string[]
  correct_answer: string | number
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

export class QuizGenerationService {
  private aiService: BaseAIService

  constructor(aiService?: BaseAIService) {
    this.aiService = aiService || AIServiceFactory.getDefaultService()
  }

  async generateQuiz(request: QuizGenerationRequest): Promise<{ success: boolean; quiz?: GeneratedQuiz; error?: string }> {
    const questionTypes = request.questionTypes || ['multiple_choice', 'true_false']
    
    const systemPrompt = `You are an expert English language instructor creating educational quizzes. 
Generate high-quality, educational questions that test comprehension and application of knowledge.
Ensure questions are clear, accurate, and appropriate for the specified difficulty level.
Always provide helpful explanations for correct answers.`

    const prompt = `Generate a ${request.difficulty} level English quiz about "${request.topic}" with ${request.questionCount} questions.

Requirements:
- Mix of question types: ${questionTypes.join(', ')}
- Questions should be clear and educational
- Include brief explanations for correct answers
- Return valid JSON only

JSON format:
{
  "title": "Quiz: ${request.topic}",
  "description": "Test your knowledge of ${request.topic}",
  "category": "English",
  "difficulty": "${request.difficulty}",
  "duration_minutes": ${Math.max(10, request.questionCount * 2)},
  "questions": [
    {
      "question": "Question text here",
      "question_type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}`

    try {
      const response = await this.aiService.generateContent({
        prompt,
        systemPrompt,
        maxTokens: 2048,
        temperature: 0.7
      })

      if (!response.success) {
        return { success: false, error: response.error }
      }

      // Clean and parse JSON response
      const cleanedContent = response.content!.replace(/```json|```/g, '').trim()
      
      try {
        const quiz = JSON.parse(cleanedContent) as GeneratedQuiz
        
        // Validate the generated quiz
        if (!quiz.questions || quiz.questions.length === 0) {
          throw new Error('Generated quiz has no questions')
        }

        logger.info('Quiz generated successfully', { 
          topic: request.topic, 
          questionsCount: quiz.questions.length 
        })

        return { success: true, quiz }
      } catch (parseError: any) {
        logger.error('Failed to parse generated quiz JSON:', parseError)
        return { 
          success: false, 
          error: 'Failed to parse AI response. Please try again.' 
        }
      }
    } catch (error: any) {
      logger.error('Quiz generation failed:', error)
      return { 
        success: false, 
        error: error.message || 'Quiz generation failed' 
      }
    }
  }
}

// Course Generation Service
export interface CourseGenerationRequest {
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  topics: string[]
  moduleCount: number
  lessonsPerModule: number
}

export interface GeneratedModule {
  title: string
  description: string
  order_index: number
  lessons: GeneratedLesson[]
}

export interface GeneratedLesson {
  title: string
  content: string
  order_index: number
  duration_minutes: number
  quiz?: GeneratedQuiz
}

export interface GeneratedCourse {
  title: string
  description: string
  level: string
  duration: string
  modules: GeneratedModule[]
}

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
