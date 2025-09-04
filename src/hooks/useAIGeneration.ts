import { useState, useCallback, useMemo, useRef } from 'react'
import { EnhancedQuizGenerationService, EnhancedQuizGenerationRequest } from '@/lib/enhanced-ai-services'
import { logger } from '@/lib/logger'
import type { QuizQuestion } from '@/lib/supabase'

interface QuizWithQuestions {
  id?: string
  title: string
  description: string
  questions: QuizQuestion[]
  category?: string
  difficulty?: string
  duration_minutes?: number
}

interface UseAIGenerationReturn {
  isGenerating: boolean
  progress: number
  error: string | null
  lastGenerated: QuizWithQuestions | null
  generateQuiz: (config: EnhancedQuizGenerationRequest) => Promise<QuizWithQuestions>
  regenerateQuestion: (questionIndex: number, config: Partial<EnhancedQuizGenerationRequest>) => Promise<QuizQuestion>
  cancelGeneration: () => void
  clearError: () => void
  getGenerationHistory: () => QuizWithQuestions[]
}

export const useAIGeneration = (): UseAIGenerationReturn => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [lastGenerated, setLastGenerated] = useState<QuizWithQuestions | null>(null)
  const [generationHistory, setGenerationHistory] = useState<QuizWithQuestions[]>([])
  
  const aiService = useMemo(() => new EnhancedQuizGenerationService(), [])
  const abortControllerRef = useRef<AbortController | null>(null)

  const updateProgress = useCallback((newProgress: number) => {
    setProgress(Math.min(100, Math.max(0, newProgress)))
  }, [])

  const generateQuiz = useCallback(async (config: EnhancedQuizGenerationRequest): Promise<QuizWithQuestions> => {
    if (isGenerating) {
      throw new Error('Generation already in progress')
    }

    setIsGenerating(true)
    setProgress(0)
    setError(null)
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController()

    try {
      logger.info('Starting AI quiz generation', { config })
      
      // Simulate progress updates
      updateProgress(10)
      
      // Generate the quiz
      const result = await aiService.generateQuiz(config)
      
      updateProgress(50)
      
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Generation was cancelled')
      }

      if (!result.success || !result.quiz) {
        throw new Error(result.error || 'Failed to generate quiz')
      }

      // Transform the result to match our QuizWithQuestions interface
      const quiz: QuizWithQuestions = {
        title: result.quiz.title,
        description: result.quiz.description,
        category: config.subject,
        difficulty: config.difficulty,
        duration_minutes: result.quiz.duration_minutes || Math.ceil(result.quiz.questions.length * 2), // 2 minutes per question
        questions: result.quiz.questions.map((q: any, index: number) => ({
          id: `ai_${Date.now()}_${index}`,
          quiz_id: '',
          question: q.question_text || q.question, // Handle different field names
          question_type: q.question_type,
          points: q.points || 1,
          options: q.options || [],
          correct_answer: typeof q.correct_answer === 'number' ? q.correct_answer : 0,
          correct_answer_text: q.correct_answer_text || null,
          correct_answer_json: null,
          explanation: q.explanation || '',
          order_index: index,
          difficulty_level: q.difficulty_level || config.difficulty || 'medium',
          image_url: null,
          audio_url: null,
          video_url: null
        }))
      }

      updateProgress(90)

      setLastGenerated(quiz)
      setGenerationHistory(prev => [...prev, quiz].slice(-10)) // Keep last 10 generations
      
      updateProgress(100)
      logger.info('AI quiz generation completed', { 
        title: quiz.title, 
        questionCount: quiz.questions.length 
      })

      return quiz

    } catch (error: any) {
      logger.error('AI quiz generation failed', { error, config })
      
      if (error.message === 'Generation was cancelled') {
        setError('Generation was cancelled')
      } else {
        setError(error.message || 'Failed to generate quiz')
      }
      
      throw error
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
    }
  }, [aiService, isGenerating, updateProgress])

  const regenerateQuestion = useCallback(async (
    questionIndex: number, 
    config: Partial<EnhancedQuizGenerationRequest>
  ): Promise<QuizQuestion> => {
    if (!lastGenerated) {
      throw new Error('No quiz available for question regeneration')
    }

    const originalQuestion = lastGenerated.questions[questionIndex]
    if (!originalQuestion) {
      throw new Error('Invalid question index')
    }

    try {
      logger.info('Regenerating question', { questionIndex, config })
      
      // Create a mini-generation request for single question
      const questionConfig: EnhancedQuizGenerationRequest = {
        subject: config.subject || lastGenerated.category || 'General',
        topic: config.topic || originalQuestion.question.substring(0, 50),
        questionCount: 1,
        difficulty: (config.difficulty as 'beginner' | 'intermediate' | 'advanced') || (lastGenerated.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'intermediate',
        quizLanguage: config.quizLanguage || 'english',
        questionTypes: [originalQuestion.question_type as 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'],
        ...config
      }

      const result = await aiService.generateQuiz(questionConfig)
      
      if (!result.success || !result.quiz || !result.quiz.questions || result.quiz.questions.length === 0) {
        throw new Error(result.error || 'No question generated')
      }

      const newQuestion: QuizQuestion = {
        ...originalQuestion,
        id: `ai_regen_${Date.now()}`,
        question: result.quiz.questions[0].question_text || result.quiz.questions[0].question,
        options: result.quiz.questions[0].options || originalQuestion.options,
        correct_answer: typeof result.quiz.questions[0].correct_answer === 'number' 
          ? result.quiz.questions[0].correct_answer 
          : originalQuestion.correct_answer,
        explanation: result.quiz.questions[0].explanation || originalQuestion.explanation
      }

      logger.info('Question regenerated successfully', { questionIndex })
      return newQuestion

    } catch (error: any) {
      logger.error('Question regeneration failed', { error, questionIndex })
      throw error
    }
  }, [aiService, lastGenerated])

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      logger.info('AI generation cancelled by user')
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const getGenerationHistory = useCallback(() => {
    return [...generationHistory]
  }, [generationHistory])

  return {
    isGenerating,
    progress,
    error,
    lastGenerated,
    generateQuiz,
    regenerateQuestion,
    cancelGeneration,
    clearError,
    getGenerationHistory
  }
}

export type { UseAIGenerationReturn }
