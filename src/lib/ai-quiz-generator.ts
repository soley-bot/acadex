import { GoogleGenerativeAI } from '@google/generative-ai'
import { logger } from './logger'

// Simplified quiz generation request - only essential fields
export interface QuizGenerationRequest {
  topic: string
  question_count: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface GeneratedQuizQuestion {
  question: string
  question_type: 'multiple_choice' | 'true_false'
  options?: string[] // For multiple choice
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

  async generateQuiz(request: QuizGenerationRequest): Promise<{ success: boolean; quiz?: GeneratedQuiz; error?: string }> {
    if (!this.genAI) {
      return { 
        success: false, 
        error: 'Google AI API not configured. Please check your GOOGLE_AI_API_KEY environment variable.' 
      }
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
      
      // Simple, focused prompt
      const prompt = `Generate a ${request.difficulty} level English quiz about "${request.topic}" with ${request.question_count} questions.

Requirements:
- Mix of multiple choice (4 options) and true/false questions
- Questions should be clear and educational
- Include brief explanations for correct answers
- Return valid JSON only

JSON format:
{
  "title": "Quiz: ${request.topic}",
  "description": "Test your knowledge of ${request.topic}",
  "category": "English",
  "difficulty": "${request.difficulty}",
  "duration_minutes": ${Math.max(10, request.question_count * 2)},
  "questions": [
    {
      "question": "Question text here",
      "question_type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Brief explanation of why this is correct"
    },
    {
      "question": "True/False question here",
      "question_type": "true_false", 
      "options": ["True", "False"],
      "correct_answer": 0,
      "explanation": "Brief explanation"
    }
  ]
}`
      
      logger.info('Generating simple AI quiz...', { topic: request.topic, count: request.question_count })
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Clean and parse response
      const cleanedText = text.replace(/```json|```/g, '').trim()
      
      try {
        const generatedQuiz = JSON.parse(cleanedText)
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
