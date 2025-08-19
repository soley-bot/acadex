// Quiz preview and settings components
import React from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Question } from '@/lib/supabase'
import { 
  Clock, 
  Target, 
  Users, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Shuffle, 
  Award,
  CheckCircle
} from 'lucide-react'

// Define QuizFormData interface locally
interface QuizFormData {
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  image_url: string
  is_published: boolean
  passing_score: number
  max_attempts: number | null
  time_limit_type: string
  time_limit?: number | null
  randomize_questions?: boolean
  show_correct_answers?: boolean
  allow_review?: boolean
  certificate_enabled?: boolean
}

interface QuizPreviewProps {
  formData: QuizFormData
  questions: Question[]
  onTogglePreview: () => void
  isPreviewMode: boolean
}

export function QuizPreview({ 
  formData, 
  questions, 
  onTogglePreview, 
  isPreviewMode 
}: QuizPreviewProps) {
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0)
  
  return (
    <div className="space-y-6">
      {/* Preview Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quiz Preview</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onTogglePreview}
          className="flex items-center gap-2"
        >
          {isPreviewMode ? (
            <>
              <EyeOff className="h-4 w-4" />
              Edit Mode
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Preview Mode
            </>
          )}
        </Button>
      </div>

      {/* Quiz Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl mb-2">{formData.title || 'Untitled Quiz'}</CardTitle>
              <p className="text-gray-600 mb-4">{formData.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant={formData.is_published ? 'default' : 'secondary'}>
                  {formData.is_published ? 'Published' : 'Draft'}
                </Badge>
                <Badge variant="outline">{formData.difficulty}</Badge>
              </div>
            </div>
            {formData.image_url && (
              <Image
                src={formData.image_url}
                alt="Quiz thumbnail"
                width={80}
                height={80}
                className="object-cover rounded-lg"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span>Passing: {formData.passing_score}%</span>
            </div>
            {formData.time_limit && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>{formData.time_limit} min</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <span>{questions.length} questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-500" />
              <span>{totalPoints} points</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({questions.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No questions added yet</p>
          ) : (
            questions.map((question, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">
                    {index + 1}. {question.question_text}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Badge variant="outline">
                      {question.question_type.replace('_', ' ')}
                    </Badge>
                    <span>{question.points || 1} pts</span>
                  </div>
                </div>

                {/* Question Type Specific Preview */}
                {question.question_type === 'multiple_choice' && (
                  <div className="space-y-1">
                    {(question.options as string[])?.map((option, optIndex) => (
                      <div 
                        key={optIndex} 
                        className={`flex items-center gap-2 p-2 rounded ${
                          option === question.correct_answer 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="w-4 h-4 border border-gray-300 rounded-full" />
                        <span className="text-sm">{option}</span>
                        {option === question.correct_answer && (
                          <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {question.question_type === 'true_false' && (
                  <div className="space-y-1">
                    {['True', 'False'].map((option) => {
                      const booleanValue = option === 'True'
                      const correctAnswer = question.correct_answer as unknown as boolean
                      const isCorrect = booleanValue === correctAnswer
                      return (
                        <div 
                          key={option} 
                          className={`flex items-center gap-2 p-2 rounded ${
                            isCorrect
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className="w-4 h-4 border border-gray-300 rounded-full" />
                          <span className="text-sm">{option}</span>
                          {isCorrect && (
                            <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {question.question_type === 'fill_blank' && (
                  <div className="bg-gray-50 p-2 rounded text-sm">
                    <strong>Correct Answer:</strong> {question.correct_answer as string}
                  </div>
                )}

                {question.explanation && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface QuizSettingsProps {
  formData: QuizFormData
  onUpdateField: <K extends keyof QuizFormData>(field: K, value: QuizFormData[K]) => void
}

export function QuizSettings({ formData, onUpdateField }: QuizSettingsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Time Limit */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Time Limit</label>
              <p className="text-sm text-gray-500">Set a time limit for completing the quiz</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={formData.time_limit || ''}
                onChange={(e) => onUpdateField('time_limit', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Minutes"
                className="w-20 px-3 py-1 border border-gray-300 rounded text-sm"
                min="1"
              />
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <Separator />

          {/* Max Attempts */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Maximum Attempts</label>
              <p className="text-sm text-gray-500">Limit how many times users can take this quiz</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={formData.max_attempts || ''}
                onChange={(e) => onUpdateField('max_attempts', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Unlimited"
                className="w-20 px-3 py-1 border border-gray-300 rounded text-sm"
                min="1"
              />
              <RotateCcw className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <Separator />

          {/* Settings checkboxes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Randomize Questions</label>
                <p className="text-sm text-gray-500">Show questions in random order</p>
              </div>
              <Switch
                checked={formData.randomize_questions}
                onCheckedChange={(checked) => onUpdateField('randomize_questions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Show Correct Answers</label>
                <p className="text-sm text-gray-500">Display correct answers after completion</p>
              </div>
              <Switch
                checked={formData.show_correct_answers}
                onCheckedChange={(checked) => onUpdateField('show_correct_answers', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Allow Review</label>
                <p className="text-sm text-gray-500">Let users review their answers before submitting</p>
              </div>
              <Switch
                checked={formData.allow_review}
                onCheckedChange={(checked) => onUpdateField('allow_review', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Enable Certificates</label>
                <p className="text-sm text-gray-500">Award certificates for passing scores</p>
              </div>
              <Switch
                checked={formData.certificate_enabled}
                onCheckedChange={(checked) => onUpdateField('certificate_enabled', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passing Score */}
      <Card>
        <CardHeader>
          <CardTitle>Scoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Passing Score (%)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.passing_score}
                  onChange={(e) => onUpdateField('passing_score', parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="flex items-center gap-2 min-w-[80px]">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{formData.passing_score}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
