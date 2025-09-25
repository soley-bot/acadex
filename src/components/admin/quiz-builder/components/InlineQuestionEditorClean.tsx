import React, { memo, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Edit3, 
  Save, 
  X, 
  AlertTriangle,
  Copy,
  Trash2
} from 'lucide-react'
import type { QuizQuestion } from '@/lib/supabase'

interface InlineQuestionEditorProps {
  question: QuizQuestion
  questionIndex: number
  errors: string[]
  onUpdate: (index: number, updates: Partial<QuizQuestion>) => void
  onDuplicate: (index: number) => void
  onRemove: (index: number) => void
}

export const InlineQuestionEditor = memo<InlineQuestionEditorProps>(({
  question,
  questionIndex,
  errors,
  onUpdate,
  onDuplicate,
  onRemove
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null)

  const handleStartEdit = useCallback(() => {
    setEditingQuestion({ ...question })
    setIsEditing(true)
  }, [question])

  const handleCancelEdit = useCallback(() => {
    setEditingQuestion(null)
    setIsEditing(false)
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (editingQuestion) {
      onUpdate(questionIndex, editingQuestion)
      setEditingQuestion(null)
      setIsEditing(false)
    }
  }, [editingQuestion, onUpdate, questionIndex])

  const handleQuestionChange = useCallback((updates: Partial<QuizQuestion>) => {
    if (editingQuestion) {
      setEditingQuestion({ ...editingQuestion, ...updates })
    }
  }, [editingQuestion])

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'multiple_choice': 'Multiple Choice',
      'true_false': 'True/False',
      'fill_blank': 'Fill in Blank',
      'essay': 'Essay',
      'matching': 'Matching',
      'ordering': 'Ordering'
    }
    return labels[type] || type
  }

  const renderQuestionEditor = () => {
    if (!editingQuestion) return null

    return (
      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question
          </label>
          <textarea
            value={editingQuestion.question || ''}
            onChange={(e) => handleQuestionChange({ question: e.target.value })}
            placeholder="Enter your question..."
            className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Multiple Choice Options */}
        {editingQuestion.question_type === 'multiple_choice' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer Options
            </label>
            <div className="space-y-2">
              {(editingQuestion.options || ['', '']).map((option: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct_answer"
                    checked={editingQuestion.correct_answer === idx}
                    onChange={() => handleQuestionChange({ correct_answer: idx })}
                    className="shrink-0"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(editingQuestion.options || [])]
                      newOptions[idx] = e.target.value
                      handleQuestionChange({ options: newOptions })
                    }}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 p-2 border border-gray-300 rounded"
                  />
                  {(editingQuestion.options || []).length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newOptions = (editingQuestion.options || []).filter((_: string, i: number) => i !== idx)
                        handleQuestionChange({ options: newOptions })
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = [...(editingQuestion.options || []), '']
                  handleQuestionChange({ options: newOptions })
                }}
              >
                Add Option
              </Button>
            </div>
          </div>
        )}

        {/* True/False */}
        {editingQuestion.question_type === 'true_false' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tf_answer"
                  checked={editingQuestion.correct_answer === 1}
                  onChange={() => handleQuestionChange({ correct_answer: 1 })}
                  className="mr-2"
                />
                True
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tf_answer"
                  checked={editingQuestion.correct_answer === 0}
                  onChange={() => handleQuestionChange({ correct_answer: 0 })}
                  className="mr-2"
                />
                False
              </label>
            </div>
          </div>
        )}

        {/* Fill in Blank */}
        {editingQuestion.question_type === 'fill_blank' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correct Answer
            </label>
            <input
              type="text"
              value={editingQuestion.correct_answer_text || ''}
              onChange={(e) => handleQuestionChange({ correct_answer_text: e.target.value })}
              placeholder="Enter the correct answer..."
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        )}

        {/* Essay */}
        {editingQuestion.question_type === 'essay' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sample Answer (Optional)
            </label>
            <textarea
              value={editingQuestion.correct_answer_text || ''}
              onChange={(e) => handleQuestionChange({ correct_answer_text: e.target.value })}
              placeholder="Provide a sample answer or grading criteria..."
              className="w-full min-h-[60px] p-3 border border-gray-300 rounded-md"
            />
          </div>
        )}

        {/* Points and Explanation */}
        <div className="flex gap-4 items-start">
          <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
            <label className="text-sm font-medium text-gray-700">Points:</label>
            <input
              type="number"
              min="1"
              max="100"
              value={editingQuestion.points || 1}
              onChange={(e) => handleQuestionChange({ points: parseInt(e.target.value) || 1 })}
              className="w-16 h-8 p-1 text-center border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Explanation (Optional)
            </label>
            <textarea
              value={editingQuestion.explanation || ''}
              onChange={(e) => handleQuestionChange({ explanation: e.target.value })}
              placeholder="Explain the correct answer..."
              className="w-full min-h-[60px] p-3 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
    )
  }

  const renderPreview = () => {
    return (
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              #{questionIndex + 1}
            </Badge>
            <Badge variant="outline">
              {getQuestionTypeLabel(question.question_type)}
            </Badge>
            {question.points && (
              <Badge variant="outline" className="text-green-700 border-green-300">
                {question.points} pts
              </Badge>
            )}
            {errors.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errors.length} issue{errors.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleStartEdit}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDuplicate(questionIndex)}
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            >
              <Copy className="h-4 w-4 mr-1" />
              Duplicate
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onRemove(questionIndex)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>

        {/* Question Preview */}
        <div className="prose max-w-none">
          <p className="text-sm font-medium mb-2">
            {question.question || 'No question text'}
          </p>
          
          {/* Multiple Choice Preview */}
          {question.question_type === 'multiple_choice' && question.options && (
            <div className="space-y-1">
              {question.options.map((option: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    question.correct_answer === idx 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-300'
                  }`}>
                    {question.correct_answer === idx && '✓'}
                  </span>
                  <span className={question.correct_answer === idx ? 'font-medium' : ''}>
                    {option}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* True/False Preview */}
          {question.question_type === 'true_false' && (
            <div className="flex items-center gap-4 text-sm">
              <span className={`px-2 py-1 rounded ${
                question.correct_answer === 1 ? 'bg-green-100 text-green-800 font-medium' : 'text-gray-600'
              }`}>
                True
              </span>
              <span className={`px-2 py-1 rounded ${
                question.correct_answer === 0 ? 'bg-green-100 text-green-800 font-medium' : 'text-gray-600'
              }`}>
                False
              </span>
            </div>
          )}

          {/* Fill Blank Preview */}
          {question.question_type === 'fill_blank' && (
            <div className="text-sm">
              <strong>Answer:</strong> {question.correct_answer_text || 'No answer provided'}
            </div>
          )}
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <div className="text-sm">
                <strong>Issues:</strong> {errors.join(', ')}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  return (
    <Card className={`border ${errors.length > 0 ? 'border-red-300 shadow-red-100' : 'border-gray-200'}`}>
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-4">
            {/* Editing Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  Editing Question #{questionIndex + 1}
                </Badge>
                <Badge variant="outline">
                  {getQuestionTypeLabel(editingQuestion?.question_type || '')}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button 
                  variant="secondary"
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editingQuestion}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
              </div>
            </div>
            
            {/* Editor Content */}
            <div className="border-t pt-4">
              {renderQuestionEditor()}
            </div>
          </div>
        ) : (
          renderPreview()
        )}
      </CardContent>
    </Card>
  )
})

InlineQuestionEditor.displayName = 'InlineQuestionEditor'
