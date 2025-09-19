"use client"

import { useState } from "react"
import { StandardQuizLayout } from '@/components/quiz/layouts/StandardQuizLayout'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Sample quiz data for testing
const SAMPLE_QUESTIONS = [
  {
    id: "q1",
    question: "What is the capital of France?",
    question_type: "multiple_choice" as const,
    options: ["London", "Berlin", "Paris", "Madrid"],
    correct_answer: 2,
    explanation: "Paris is the capital and largest city of France.",
    points: 10
  },
  {
    id: "q2", 
    question: "The Earth is flat.",
    question_type: "true_false" as const,
    correct_answer: false,
    explanation: "The Earth is an oblate spheroid, not flat.",
    points: 5
  },
  {
    id: "q3",
    question: "Complete this sentence: 'To be or not to ___'",
    question_type: "fill_blank" as const,
    correct_answer: "be",
    explanation: "This is from Shakespeare's Hamlet: 'To be or not to be, that is the question.'",
    points: 15
  },
  {
    id: "q4",
    question: "Which of the following are programming languages? (Select all that apply)",
    question_type: "single_choice" as const,
    options: ["JavaScript", "HTML", "Python", "CSS", "Java"],
    correct_answer: [0, 2, 4], // JavaScript, Python, Java
    explanation: "JavaScript, Python, and Java are programming languages. HTML and CSS are markup/styling languages.",
    points: 20
  },
  {
    id: "q5",
    question: "Explain the concept of photosynthesis in plants.",
    question_type: "essay" as const,
    explanation: "Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen.",
    points: 25
  }
]

export default function QuizTestPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes
  const [submitting, setSubmitting] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handlePrevious = () => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentQuestionIndex(prev => Math.min(SAMPLE_QUESTIONS.length - 1, prev + 1))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    
    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setSubmitting(false)
    setShowResults(true)
  }

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setAnswers({})
    setTimeLeft(1800)
    setSubmitting(false)
    setQuizStarted(false)
    setShowResults(false)
  }

  // Results view
  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Quiz Completed! ✅</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>You answered {Object.keys(answers).length} out of {SAMPLE_QUESTIONS.length} questions.</p>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Your Answers:</h3>
                  {SAMPLE_QUESTIONS.map((q, index) => (
                    <div key={q.id} className="p-3 bg-muted/30 rounded">
                      <p className="text-sm font-medium">Q{index + 1}: {q.question}</p>
                      <p className="text-sm text-muted-foreground">
                        Answer: {answers[q.id] !== undefined ? String(answers[q.id]) : "Not answered"}
                      </p>
                    </div>
                  ))}
                </div>

                <Button onClick={resetQuiz} className="w-full">
                  Take Quiz Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Start screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Component Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  This is a test page to validate our modular quiz components. 
                  It includes all question types we built.
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Questions:</span> {SAMPLE_QUESTIONS.length}
                  </div>
                  <div>
                    <span className="font-medium">Time Limit:</span> 30 minutes
                  </div>
                  <div>
                    <span className="font-medium">Question Types:</span> All types
                  </div>
                  <div>
                    <span className="font-medium">Purpose:</span> Component testing
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Components Being Tested:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✅ MultipleChoice, TrueFalse, FillBlank, Essay, MultiSelect</li>
                    <li>✅ QuestionWrapper, Timer, Navigation, Progress</li>
                    <li>✅ StandardQuizLayout integration</li>
                  </ul>
                </div>

                <Button 
                  onClick={() => setQuizStarted(true)}
                  className="w-full"
                >
                  Start Component Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Quiz in progress
  return (
    <StandardQuizLayout
      questions={SAMPLE_QUESTIONS}
      currentQuestionIndex={currentQuestionIndex}
      answers={answers}
      timeLeft={timeLeft}
      showTimer={true}
      onAnswerChange={handleAnswerChange}
      onPrevious={handlePrevious}
      onNext={handleNext}
      onSubmit={handleSubmit}
      submitting={submitting}
    />
  )
}