import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Edit, Plus, Trash2, Copy, Eye, Save, AlertCircle } from 'lucide-react'
import { useQuizBuilderState, QuizBuilderState } from '@/contexts/QuizBuilderContext'
import { useQuizEditor, QuizWithQuestions } from '@/hooks/useQuizEditor'
import { useQuizValidation, ValidationError } from '@/hooks/useQuizValidation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CategorySelector } from '@/components/admin/CategorySelector'
import { QuizQuestion } from '@/lib/supabase'
import { NewQuestionModal } from '../NewQuestionModal'

interface QuizEditorStepProps {
  onPreview?: () => void
  onSave?: () => void
}

export const QuizEditorStep: React.FC<QuizEditorStepProps> = ({
  onPreview,
  onSave
}) => {
  const { data, transitionTo } = useQuizBuilderState()
  const { validateQuiz } = useQuizValidation()
  const [showNewQuestionModal, setShowNewQuestionModal] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const initialQuiz: QuizWithQuestions = {
    title: '',
    description: '',
    questions: data.questions || [],
    category: '',
    difficulty: 'intermediate',
    duration_minutes: 30,
    is_published: false
  }

  const {
    quiz,
    updateQuiz,
    updateQuestion,
    addQuestion,
    removeQuestion,
    duplicateQuestion,
    hasUnsavedChanges
  } = useQuizEditor(initialQuiz)

  // Cleanup timeout on unmount
  useEffect(() => {
    const currentTimeout = timeoutRef.current
    return () => {
      if (currentTimeout) {
        clearTimeout(currentTimeout)
      }
    }
  }, [])

  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: ValidationError[]; warnings: ValidationError[] }>({
    isValid: true,
    errors: [],
    warnings: []
  })

  const handleValidation = () => {
    const result = validateQuiz({
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions,
      category: quiz.category,
      duration_minutes: quiz.duration_minutes
    })
    setValidationResult(result)
    return result
  }

  const handlePreview = () => {
    const validation = handleValidation()
    if (validation.isValid) {
      transitionTo(QuizBuilderState.PREVIEW, { questions: quiz.questions })
      onPreview?.()
    }
  }

  const handleSave = () => {
    const validation = handleValidation()
    if (validation.isValid) {
      transitionTo(QuizBuilderState.SAVING, { questions: quiz.questions })
      onSave?.()
    }
  }

  const handleCreateQuestion = useCallback((questionType: string) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Create a new question with the selected type
    const newQuestion: Partial<QuizQuestion> = {
      question_type: questionType as any,
      question: '',
      points: 1,
      options: questionType === 'multiple_choice' ? ['', '', '', ''] : [],
      correct_answer: questionType === 'true_false' ? 0 : (questionType === 'multiple_choice' ? 0 : undefined),
      order_index: quiz.questions.length,
      difficulty_level: 'medium'
    }
    
    // Add the question and show it expanded
    addQuestion()
    
    // Update the last question with the specific type and defaults
    timeoutRef.current = setTimeout(() => {
      updateQuestion(quiz.questions.length, newQuestion)
      timeoutRef.current = null
    }, 100)
  }, [addQuestion, updateQuestion, quiz.questions.length])

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Quiz Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Edit className="h-6 w-6 text-primary" />
            <span>Quiz Information</span>
            {hasUnsavedChanges && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Unsaved changes
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                value={quiz.title}
                onChange={(e) => updateQuiz({ title: e.target.value })}
                placeholder="Enter quiz title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <CategorySelector
                value={quiz.category || ''}
                onChange={(value) => updateQuiz({ category: value })}
                type="general"
                placeholder="Select quiz category..."
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={quiz.duration_minutes || ''}
                onChange={(e) => updateQuiz({ duration_minutes: parseInt(e.target.value) || undefined })}
                placeholder="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={quiz.difficulty || 'intermediate'}
                onChange={(e) => updateQuiz({ difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={quiz.description}
              onChange={(e) => updateQuiz({ description: e.target.value })}
              placeholder="Enter quiz description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
        <Card>
          <CardContent className="p-4">
            {validationResult.errors.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="font-medium text-red-700">Errors</span>
                </div>
                <ul className="text-red-600 text-sm space-y-1">
                  {validationResult.errors.map((error, index) => (
                    <li key={index}>
                      • {error.message}
                      {error.questionIndex !== undefined && ` (Question ${error.questionIndex + 1})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {validationResult.warnings.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium text-yellow-700">Warnings</span>
                </div>
                <ul className="text-yellow-600 text-sm space-y-1">
                  {validationResult.warnings.map((warning, index) => (
                    <li key={index}>
                      • {warning.message}
                      {warning.questionIndex !== undefined && ` (Question ${warning.questionIndex + 1})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span>Questions ({quiz.questions.length})</span>
            </CardTitle>
            <button
              onClick={() => setShowNewQuestionModal(true)}
              className="flex items-center space-x-2 bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Question</span>
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {quiz.questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No questions yet. Add your first question to get started.</p>
            </div>
          ) : (
            quiz.questions.map((question, index) => (
              <QuestionEditor
                key={question.id}
                question={question}
                index={index}
                onUpdate={(updates) => updateQuestion(index, updates)}
                onDuplicate={() => duplicateQuestion(index)}
                onRemove={() => removeQuestion(index)}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleValidation}
          className="text-primary hover:text-secondary transition-colors"
        >
          Validate Quiz
        </button>

        <div className="flex space-x-3">
          <button
            onClick={handlePreview}
            className="flex items-center space-x-2 border border-primary text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </button>
          
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 rounded-lg transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Quiz</span>
          </button>
        </div>
      </div>

      {/* New Question Modal */}
      <NewQuestionModal
        isOpen={showNewQuestionModal}
        onClose={() => setShowNewQuestionModal(false)}
        onCreateQuestion={handleCreateQuestion}
      />
    </div>
  )
}

// Question Editor Component
interface QuestionEditorProps {
  question: QuizQuestion
  index: number
  onUpdate: (updates: Partial<QuizQuestion>) => void
  onDuplicate: () => void
  onRemove: () => void
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  index,
  onUpdate,
  onDuplicate,
  onRemove
}) => {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
          <div className="flex space-x-2">
            <button
              onClick={onDuplicate}
              className="text-gray-400 hover:text-primary transition-colors"
              title="Duplicate question"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={onRemove}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Remove question"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text *
          </label>
          <textarea
            value={question.question}
            onChange={(e) => onUpdate({ question: e.target.value })}
            placeholder="Enter your question"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Type
            </label>
            <select
              value={question.question_type}
              onChange={(e) => onUpdate({ question_type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True/False</option>
              <option value="fill_blank">Fill in the Blank</option>
              <option value="essay">Essay</option>
              <option value="matching">Matching</option>
              <option value="ordering">Ordering</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points
            </label>
            <input
              type="number"
              min="1"
              value={question.points}
              onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Question-type specific editors */}
        {question.question_type === 'multiple_choice' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options
            </label>
            <div className="space-y-2">
              {question.options?.map((option: string, optionIndex: number) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correct_answer === optionIndex}
                    onChange={() => onUpdate({ correct_answer: optionIndex })}
                    className="text-primary"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])]
                      newOptions[optionIndex] = e.target.value
                      onUpdate({ options: newOptions })
                    }}
                    placeholder={`Option ${optionIndex + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [...(question.options || []), '']
                  onUpdate({ options: newOptions })
                }}
                className="text-primary hover:text-secondary text-sm font-medium"
              >
                + Add Option
              </button>
            </div>
          </div>
        )}

        {question.question_type === 'true_false' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`tf-${question.id}`}
                  checked={question.correct_answer === 1}
                  onChange={() => onUpdate({ correct_answer: 1 })}
                  className="text-primary"
                />
                <span>True</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`tf-${question.id}`}
                  checked={question.correct_answer === 0}
                  onChange={() => onUpdate({ correct_answer: 0 })}
                  className="text-primary"
                />
                <span>False</span>
              </label>
            </div>
          </div>
        )}

        {question.question_type === 'fill_blank' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer(s)
            </label>
            <input
              type="text"
              value={question.correct_answer_text || ''}
              onChange={(e) => onUpdate({ correct_answer_text: e.target.value })}
              placeholder="Enter the correct answer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              For multiple acceptable answers, separate with commas
            </p>
          </div>
        )}

        {question.question_type === 'essay' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grading Guidelines
            </label>
            <textarea
              value={question.correct_answer_text || ''}
              onChange={(e) => onUpdate({ correct_answer_text: e.target.value })}
              placeholder="Enter grading guidelines for this essay question"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        )}

        {(question.question_type === 'matching' || question.question_type === 'ordering') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              📝 {question.question_type === 'matching' ? 'Matching' : 'Ordering'} questions are coming soon! 
              Please use a different question type for now.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation (Optional)
          </label>
          <textarea
            value={question.explanation || ''}
            onChange={(e) => onUpdate({ explanation: e.target.value })}
            placeholder="Explain the correct answer"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </CardContent>
    </Card>
  )
}
