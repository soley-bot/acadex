/**
 * Quiz Progress Indicator
 * Shows overall quiz creation progress and completion status
 */

import React from 'react'
import { CheckCircle2, AlertCircle, Clock, Target, Users, FileText } from 'lucide-react'

export type QuestionType = 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'

interface Question {
  question: string
  question_type: QuestionType
  options: string[] | Array<{left: string; right: string}>
  correct_answer: number | string | number[] | string[] // ✅ FIX: Add string[] for ordering questions
  correct_answer_text?: string | null
  explanation?: string
  points?: number
  difficulty_level?: 'easy' | 'medium' | 'hard'
}

interface QuizData {
  title: string
  description: string
  category: string
  duration_minutes: number
  passing_score: number
  max_attempts: number
}

interface ValidationError {
  field: string
  message: string
  questionIndex?: number
}

interface QuizProgressIndicatorProps {
  formData: QuizData
  questions: Question[]
  errors: ValidationError[]
  className?: string
}

interface ProgressSection {
  id: string
  label: string
  icon: React.ReactNode
  progress: number
  status: 'complete' | 'incomplete' | 'error'
  details: string[]
}

export const QuizProgressIndicator: React.FC<QuizProgressIndicatorProps> = ({
  formData,
  questions,
  errors,
  className = ''
}) => {
  const sections = calculateProgress(formData, questions, errors)
  const overallProgress = Math.round(sections.reduce((sum, s) => sum + s.progress, 0) / sections.length)
  const hasErrors = errors.length > 0
  const isComplete = overallProgress === 100 && !hasErrors

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Overall Progress Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isComplete ? 'bg-green-100 text-green-700' :
            hasErrors ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {isComplete ? <CheckCircle2 className="h-5 w-5" /> :
             hasErrors ? <AlertCircle className="h-5 w-5" /> :
             <Clock className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Quiz Progress</h3>
            <p className="text-sm text-gray-600">
              {isComplete ? 'Ready to publish!' :
               hasErrors ? `${errors.length} issue${errors.length > 1 ? 's' : ''} to fix` :
               'Keep building your quiz'}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{overallProgress}%</div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              isComplete ? 'bg-green-500' :
              hasErrors ? 'bg-red-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Section Progress */}
      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.id} className="flex items-start gap-3">
            <div className={`p-1.5 rounded-lg mt-0.5 ${
              section.status === 'complete' ? 'bg-green-100 text-green-700' :
              section.status === 'error' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {section.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{section.label}</span>
                <span className="text-sm text-gray-500">{section.progress}%</span>
              </div>
              
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full transition-all duration-300 ${
                    section.status === 'complete' ? 'bg-green-500' :
                    section.status === 'error' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`}
                  style={{ width: `${section.progress}%` }}
                />
              </div>
              
              {section.details.length > 0 && (
                <ul className="text-xs text-gray-600 space-y-0.5">
                  {section.details.map((detail, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <span className="text-gray-400">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">{questions.length}</div>
            <div className="text-xs text-gray-500">Questions</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">{formData.duration_minutes}</div>
            <div className="text-xs text-gray-500">Minutes</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">{formData.passing_score}%</div>
            <div className="text-xs text-gray-500">Pass Score</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Calculate progress for each section
 */
function calculateProgress(
  formData: QuizData, 
  questions: Question[], 
  errors: ValidationError[]
): ProgressSection[] {
  const basicInfoErrors = errors.filter(e => !e.questionIndex)
  const questionErrors = errors.filter(e => e.questionIndex !== undefined)

  // Basic Information Section
  const basicInfoProgress = calculateBasicInfoProgress(formData)
  const basicInfoStatus = basicInfoErrors.length > 0 ? 'error' : 
                         basicInfoProgress === 100 ? 'complete' : 'incomplete'

  // Questions Section
  const questionsProgress = calculateQuestionsProgress(questions)
  const questionsStatus = questionErrors.length > 0 ? 'error' :
                         questionsProgress === 100 ? 'complete' : 'incomplete'

  // Settings Section
  const settingsProgress = calculateSettingsProgress(formData)
  const settingsStatus = settingsProgress === 100 ? 'complete' : 'incomplete'

  return [
    {
      id: 'basic_info',
      label: 'Basic Information',
      icon: <FileText className="h-4 w-4" />,
      progress: basicInfoProgress,
      status: basicInfoStatus,
      details: getBasicInfoDetails(formData, basicInfoErrors)
    },
    {
      id: 'questions',
      label: 'Questions',
      icon: <Target className="h-4 w-4" />,
      progress: questionsProgress,
      status: questionsStatus,
      details: getQuestionsDetails(questions, questionErrors)
    },
    {
      id: 'settings',
      label: 'Quiz Settings',
      icon: <Users className="h-4 w-4" />,
      progress: settingsProgress,
      status: settingsStatus,
      details: getSettingsDetails(formData)
    }
  ]
}

function calculateBasicInfoProgress(formData: QuizData): number {
  let completed = 0
  const total = 4

  if (formData.title?.trim()) completed++
  if (formData.description?.trim()) completed++
  if (formData.category) completed++
  if (formData.duration_minutes > 0) completed++

  return Math.round((completed / total) * 100)
}

function calculateQuestionsProgress(questions: Question[]): number {
  if (questions.length === 0) return 0

  const completeQuestions = questions.filter(q => {
    if (!q.question?.trim()) return false
    
    if (['multiple_choice', 'single_choice', 'true_false'].includes(q.question_type)) {
      const options = q.options as string[]
      return options && options.length >= 2 && 
             options.every(opt => opt?.trim()) &&
             q.correct_answer !== undefined
    }
    
    if (q.question_type === 'fill_blank') {
      // For fill_blank questions, check correct_answer_text field
      return q.correct_answer_text && q.correct_answer_text.trim()
    }
    
    if (q.question_type === 'matching') {
      const matchingOptions = q.options as Array<{left: string; right: string}>
      return matchingOptions && matchingOptions.length >= 2 &&
             matchingOptions.every(pair => pair?.left?.trim() && pair?.right?.trim())
    }
    
    if (q.question_type === 'ordering') {
      const options = q.options as string[]
      return options && options.length >= 2 && options.every(opt => opt?.trim())
    }
    
    return true // Essay questions just need text
  })

  return Math.round((completeQuestions.length / questions.length) * 100)
}

function calculateSettingsProgress(formData: QuizData): number {
  let completed = 0
  const total = 3

  if (formData.passing_score > 0) completed++
  if (formData.max_attempts >= 0) completed++
  if (formData.duration_minutes > 0) completed++ // Already counted in basic info

  return Math.round((completed / total) * 100)
}

function getBasicInfoDetails(formData: QuizData, errors: ValidationError[]): string[] {
  const details: string[] = []
  
  if (formData.title?.trim()) details.push('✓ Title added')
  else details.push('○ Add quiz title')
  
  if (formData.description?.trim()) details.push('✓ Description added')
  else details.push('○ Add description')
  
  if (formData.category) details.push('✓ Category selected')
  else details.push('○ Select category')
  
  if (errors.length > 0) {
    details.push(`⚠ ${errors.length} issue${errors.length > 1 ? 's' : ''} to fix`)
  }
  
  return details
}

function getQuestionsDetails(questions: Question[], errors: ValidationError[]): string[] {
  const details: string[] = []
  
  if (questions.length === 0) {
    details.push('○ Add your first question')
  } else {
    details.push(`✓ ${questions.length} question${questions.length > 1 ? 's' : ''} added`)
    
    const typeDistribution = questions.reduce((acc, q) => {
      acc[q.question_type] = (acc[q.question_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const types = Object.keys(typeDistribution)
    if (types.length > 1) {
      details.push(`✓ ${types.length} question types used`)
    }
  }
  
  if (errors.length > 0) {
    details.push(`⚠ ${errors.length} question issue${errors.length > 1 ? 's' : ''}`)
  }
  
  return details
}

function getSettingsDetails(formData: QuizData): string[] {
  const details: string[] = []
  
  details.push(`✓ ${formData.duration_minutes} minute time limit`)
  details.push(`✓ ${formData.passing_score}% passing score`)
  
  if (formData.max_attempts === 0) {
    details.push('✓ Unlimited attempts')
  } else {
    details.push(`✓ ${formData.max_attempts} max attempts`)
  }
  
  return details
}
