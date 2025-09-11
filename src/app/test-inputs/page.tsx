'use client'

import React, { useState } from 'react'
import { MultipleChoiceEditor } from '@/components/admin/quiz/question-types/MultipleChoiceEditor'
import { TrueFalseEditor } from '@/components/admin/quiz/question-types/TrueFalseEditor'
import { FillBlankEditor } from '@/components/admin/quiz/question-types/FillBlankEditor'

const TestInputs = () => {
  const [mcQuestion, setMcQuestion] = useState({
    id: 'test-mc',
    quiz_id: 'test',
    question: '',
    question_type: 'multiple_choice' as const,
    options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
    correct_answer: 0,
    partial_credit: false,
    randomize_options: false,
    explanation: '',
    order_index: 0,
    points: 1,
    difficulty_level: 'easy' as const,
    image_url: null,
    audio_url: null,
    video_url: null,
  })

  const [tfQuestion, setTfQuestion] = useState({
    id: 'test-tf',
    quiz_id: 'test',
    question: '',
    question_type: 'true_false' as const,
    correct_answer: true,
    explanation: '',
    order_index: 0,
    points: 1,
    difficulty_level: 'easy' as const,
    image_url: null,
    audio_url: null,
    video_url: null,
  })

  const [fbQuestion, setFbQuestion] = useState({
    id: 'test-fb',
    quiz_id: 'test',
    question: '',
    question_type: 'fill_blank' as const,
    text_with_blanks: '',
    correct_answers: [''],
    case_sensitive: false,
    allow_partial_credit: true,
    explanation: '',
    order_index: 0,
    points: 1,
    difficulty_level: 'easy' as const,
    image_url: null,
    audio_url: null,
    video_url: null,
  })

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Input Test Page</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Multiple Choice Editor</h2>
          <div className="mb-4 p-4 bg-yellow-100 rounded">
            <p><strong>Debug - Current MC Question:</strong></p>
            <p>Question: &quot;{mcQuestion.question}&quot;</p>
            <p>Options: {JSON.stringify(mcQuestion.options)}</p>
            <p>Correct Answer: {mcQuestion.correct_answer}</p>
          </div>
          <MultipleChoiceEditor
            question={mcQuestion}
            onChange={(updates) => {
              console.log('MC onChange:', updates)
              setMcQuestion(prev => ({ ...prev, ...updates } as any))
            }}
            onRemove={() => console.log('MC remove')}
            isValid={true}
            errors={{}}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">True/False Editor</h2>
          <TrueFalseEditor
            question={tfQuestion}
            onChange={(updates) => {
              console.log('TF onChange:', updates)
              setTfQuestion(prev => ({ ...prev, ...updates } as any))
            }}
            onRemove={() => console.log('TF remove')}
            isValid={true}
            errors={{}}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Fill in the Blanks Editor</h2>
          <FillBlankEditor
            question={fbQuestion}
            onChange={(updates) => {
              console.log('FB onChange:', updates)
              setFbQuestion(prev => ({ ...prev, ...updates } as any))
            }}
            onRemove={() => console.log('FB remove')}
            isValid={true}
            errors={{}}
          />
        </div>
      </div>
    </div>
  )
}

export default TestInputs
