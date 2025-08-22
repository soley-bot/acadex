import React, { useState, useMemo } from 'react'
import { 
  CheckSquare, 
  Square, 
  Edit3, 
  Copy, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Target, 
  Clock, 
  MoreHorizontal,
  Download,
  Upload
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuestionTypeIndicator } from './QuestionTypeIndicators'
import { FEATURE_FLAGS } from '@/lib/featureFlags'
import { trackFormEvent } from '@/lib/quizFormMonitoring'
import type { QuestionType } from '@/lib/supabase'

interface Question {
  id?: string
  question: string
  question_type: QuestionType
  options: string[] | any[]
  correct_answer: any
  explanation?: string
  points?: number
  difficulty_level?: string
}

interface BulkOperation {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  action: 'edit' | 'duplicate' | 'delete' | 'reorder' | 'export' | 'points' | 'difficulty'
  requiresInput?: boolean
}

interface BulkOperationsProps {
  questions: Question[]
  selectedQuestions: Set<number>
  onSelectQuestion: (index: number) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onBulkOperation: (operation: string, data?: any) => void
  className?: string
}

export function BulkOperations({
  questions,
  selectedQuestions,
  onSelectQuestion,
  onSelectAll,
  onDeselectAll,
  onBulkOperation,
  className = ''
}: BulkOperationsProps) {
  const [showOperations, setShowOperations] = useState(false)
  const [operationData, setOperationData] = useState<Record<string, any>>({})

  const availableOperations: BulkOperation[] = [
    {
      id: 'duplicate',
      label: 'Duplicate Questions',
      description: 'Create copies of selected questions',
      icon: Copy,
      action: 'duplicate'
    },
    {
      id: 'delete',
      label: 'Delete Questions',
      description: 'Remove selected questions from quiz',
      icon: Trash2,
      action: 'delete'
    },
    {
      id: 'set-points',
      label: 'Set Points',
      description: 'Update points for selected questions',
      icon: Target,
      action: 'points',
      requiresInput: true
    },
    {
      id: 'set-difficulty',
      label: 'Set Difficulty',
      description: 'Update difficulty level for selected questions',
      icon: Clock,
      action: 'difficulty',
      requiresInput: true
    },
    {
      id: 'move-up',
      label: 'Move Up',
      description: 'Move selected questions up in order',
      icon: ArrowUp,
      action: 'reorder'
    },
    {
      id: 'move-down',
      label: 'Move Down',
      description: 'Move selected questions down in order',
      icon: ArrowDown,
      action: 'reorder'
    },
    {
      id: 'export',
      label: 'Export Questions',
      description: 'Export selected questions as JSON',
      icon: Download,
      action: 'export'
    }
  ]

  const selectedCount = selectedQuestions.size
  const allSelected = selectedCount === questions.length && questions.length > 0

  const handleOperation = (operation: BulkOperation) => {
    const selectedIndexes = Array.from(selectedQuestions)
    
    trackFormEvent('bulk_operation_applied', {
      operation: operation.action,
      questionCount: selectedCount,
      totalQuestions: questions.length
    })

    let data: any = { selectedIndexes }
    
    if (operation.requiresInput) {
      data = { ...data, ...operationData[operation.id] }
    }
    
    if (operation.action === 'reorder') {
      data.direction = operation.id.includes('up') ? 'up' : 'down'
    }

    onBulkOperation(operation.action, data)
    setShowOperations(false)
  }

  const updateOperationData = (operationId: string, key: string, value: any) => {
    setOperationData(prev => ({
      ...prev,
      [operationId]: {
        ...prev[operationId],
        [key]: value
      }
    }))
  }

  if (!FEATURE_FLAGS.BULK_OPERATIONS) {
    return null
  }

  return (
    <div className={`${className}`}>
      {/* Selection Bar */}
      <Card variant="base" className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={allSelected ? onDeselectAll : onSelectAll}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                {allSelected ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                Select All ({questions.length})
              </button>
              
              {selectedCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {selectedCount} selected
                  </span>
                  <button
                    onClick={onDeselectAll}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {selectedCount > 0 && (
              <button
                onClick={() => setShowOperations(!showOperations)}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-secondary hover:text-black transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
                Bulk Actions
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Operations Panel */}
      {showOperations && selectedCount > 0 && (
        <Card variant="base" className="mb-4 border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-900">
              Bulk Operations ({selectedCount} questions)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableOperations.map((operation) => (
                <OperationCard
                  key={operation.id}
                  operation={operation}
                  isDisabled={selectedCount === 0}
                  onExecute={() => handleOperation(operation)}
                  operationData={operationData[operation.id] || {}}
                  onUpdateData={(key, value) => updateOperationData(operation.id, key, value)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question List with Selection */}
      <div className="space-y-2">
        {questions.map((question, index) => (
          <QuestionSelectionRow
            key={index}
            question={question}
            index={index}
            isSelected={selectedQuestions.has(index)}
            onToggleSelect={() => onSelectQuestion(index)}
          />
        ))}
      </div>
    </div>
  )
}

interface OperationCardProps {
  operation: BulkOperation
  isDisabled: boolean
  onExecute: () => void
  operationData: Record<string, any>
  onUpdateData: (key: string, value: any) => void
}

function OperationCard({ 
  operation, 
  isDisabled, 
  onExecute, 
  operationData, 
  onUpdateData 
}: OperationCardProps) {
  const Icon = operation.icon
  
  const getButtonColor = () => {
    switch (operation.action) {
      case 'delete':
        return 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
      case 'duplicate':
      case 'export':
        return 'bg-success hover:bg-success/90 text-success-foreground'
      default:
        return 'bg-primary hover:bg-primary/90 text-primary-foreground'
    }
  }

  const canExecute = !operation.requiresInput || 
    (operation.action === 'points' && operationData.points) ||
    (operation.action === 'difficulty' && operationData.difficulty)

  return (
    <Card variant="base" className="p-3">
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-gray-600 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm">{operation.label}</h4>
          <p className="text-xs text-gray-600 mb-3">{operation.description}</p>
          
          {/* Input fields for operations that require them */}
          {operation.requiresInput && (
            <div className="mb-3">
              {operation.action === 'points' && (
                <input
                  type="number"
                  placeholder="Points (1-10)"
                  min="1"
                  max="10"
                  value={operationData.points || ''}
                  onChange={(e) => onUpdateData('points', parseInt(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              )}
              
              {operation.action === 'difficulty' && (
                <select
                  value={operationData.difficulty || ''}
                  onChange={(e) => onUpdateData('difficulty', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="">Select difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              )}
            </div>
          )}
          
          <button
            onClick={onExecute}
            disabled={isDisabled || !canExecute}
            className={`w-full px-3 py-1.5 text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColor()}`}
          >
            Execute
          </button>
        </div>
      </div>
    </Card>
  )
}

interface QuestionSelectionRowProps {
  question: Question
  index: number
  isSelected: boolean
  onToggleSelect: () => void
}

function QuestionSelectionRow({ 
  question, 
  index, 
  isSelected, 
  onToggleSelect 
}: QuestionSelectionRowProps) {
  return (
    <Card 
      variant="base" 
      className={`cursor-pointer transition-all ${
        isSelected ? 'border-primary bg-primary/5' : 'hover:border-gray-300'
      }`}
      onClick={onToggleSelect}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {isSelected ? (
              <CheckSquare className="h-4 w-4 text-primary" />
            ) : (
              <Square className="h-4 w-4 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-500">
                Q{index + 1}
              </span>
              <QuestionTypeIndicator 
                questionType={question.question_type}
                size="sm"
              />
            </div>
            
            <p className="text-sm text-gray-900 line-clamp-2">
              {question.question || `Question ${index + 1}`}
            </p>
            
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span>{question.points || 1} pts</span>
              {question.difficulty_level && (
                <span className="capitalize">{question.difficulty_level}</span>
              )}
              {question.options && Array.isArray(question.options) && (
                <span>{question.options.length} options</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
