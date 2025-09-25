/**
 * Enhanced Question Type Indicators
 * Visual indicators for different question types with color coding and icons
 */

import React from 'react'
import { 
  CheckSquare, 
  Circle, 
  ToggleLeft, 
  Type, 
  FileText, 
  Link, 
  ArrowUpDown,
  Brain,
  Clock,
  Target
} from 'lucide-react'

export type QuestionType = 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'

interface QuestionTypeConfig {
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export const questionTypeConfigs: Record<QuestionType, QuestionTypeConfig> = {
  multiple_choice: {
    label: 'Multiple Choice',
    icon: <CheckSquare className="h-4 w-4" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Students can select multiple correct answers',
    difficulty: 'medium'
  },
  single_choice: {
    label: 'Single Choice',
    icon: <Circle className="h-4 w-4" />,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Students select one correct answer',
    difficulty: 'easy'
  },
  true_false: {
    label: 'True/False',
    icon: <ToggleLeft className="h-4 w-4" />,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Simple true or false question',
    difficulty: 'easy'
  },
  fill_blank: {
    label: 'Fill in the Blank',
    icon: <Type className="h-4 w-4" />,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Students type the correct answer',
    difficulty: 'medium'
  },
  essay: {
    label: 'Essay',
    icon: <FileText className="h-4 w-4" />,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Long-form written response',
    difficulty: 'hard'
  },
  matching: {
    label: 'Matching',
    icon: <Link className="h-4 w-4" />,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    description: 'Match items from two columns',
    difficulty: 'hard'
  },
  ordering: {
    label: 'Ordering',
    icon: <ArrowUpDown className="h-4 w-4" />,
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    description: 'Arrange items in correct order',
    difficulty: 'medium'
  }
}

interface QuestionTypeIndicatorProps {
  type: QuestionType
  showDescription?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const QuestionTypeIndicator: React.FC<QuestionTypeIndicatorProps> = ({
  type,
  showDescription = false,
  size = 'md',
  className = ''
}) => {
  const config = questionTypeConfigs[type]
  
  if (!config) {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-sm ${className}`}>
        Unknown Type
      </span>
    )
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm', 
    lg: 'px-4 py-2 text-base'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span 
        className={`
          inline-flex items-center gap-1.5 rounded-lg border font-medium
          ${config.color} ${config.bgColor} ${config.borderColor}
          ${sizeClasses[size]}
        `}
      >
        <span className={iconSizes[size]}>{config.icon}</span>
        {config.label}
      </span>
      
      {showDescription && (
        <span className="text-sm text-gray-500">
          {config.description}
        </span>
      )}
    </div>
  )
}

interface DifficultyIndicatorProps {
  difficulty: 'easy' | 'medium' | 'hard'
  size?: 'sm' | 'md'
}

export const DifficultyIndicator: React.FC<DifficultyIndicatorProps> = ({
  difficulty,
  size = 'sm'
}) => {
  const configs = {
    easy: {
      label: 'Easy',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      icon: <Target className="h-3 w-3" />
    },
    medium: {
      label: 'Medium', 
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      icon: <Brain className="h-3 w-3" />
    },
    hard: {
      label: 'Hard',
      color: 'text-red-700', 
      bgColor: 'bg-red-100',
      icon: <Clock className="h-3 w-3" />
    }
  }

  const config = configs[difficulty]
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span 
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${config.color} ${config.bgColor} ${sizeClass}
      `}
    >
      {config.icon}
      {config.label}
    </span>
  )
}

interface QuestionTypeStatsProps {
  types: QuestionType[]
  className?: string
}

export const QuestionTypeStats: React.FC<QuestionTypeStatsProps> = ({
  types,
  className = ''
}) => {
  const typeCounts = types.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<QuestionType, number>)

  const totalQuestions = types.length
  const difficultyDistribution = types.reduce((acc, type) => {
    const difficulty = questionTypeConfigs[type]?.difficulty || 'medium'
    acc[difficulty] = (acc[difficulty] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="font-medium">Question Types:</span>
        <span>{totalQuestions} total</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {Object.entries(typeCounts).map(([type, count]) => {
          const config = questionTypeConfigs[type as QuestionType]
          if (!config) return null
          
          return (
            <div
              key={type}
              className={`
                flex items-center gap-1.5 px-2 py-1 rounded-md text-xs
                ${config.bgColor} ${config.color} border ${config.borderColor}
              `}
            >
              {config.icon}
              <span>{config.label}</span>
              <span className="font-semibold">({count})</span>
            </div>
          )
        })}
      </div>
      
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>Difficulty:</span>
        {Object.entries(difficultyDistribution).map(([difficulty, count]) => (
          <DifficultyIndicator
            key={difficulty}
            difficulty={difficulty as 'easy' | 'medium' | 'hard'}
          />
        ))}
      </div>
    </div>
  )
}

