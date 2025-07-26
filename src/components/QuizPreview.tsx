'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getRandomQuizQuestions } from '@/lib/database'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  quiz?: {
    title: string
    category: string
    difficulty: string
  }
}

// Static fallback questions for better performance
const STATIC_QUESTIONS: QuizQuestion[] = [
  {
    id: '1',
    question: "What is the past tense of 'go'?",
    options: ["goed", "went", "gone", "going"],
    correct_answer: 1,
    explanation: "The past tense of 'go' is 'went'. This is an irregular verb."
  },
  {
    id: '2',
    question: "Which article should you use before 'university'?",
    options: ["a", "an", "the", "no article needed"],
    correct_answer: 0,
    explanation: "Use 'a' before 'university' because it starts with a consonant sound (/j/)."
  },
  {
    id: '3',
    question: "Choose the correct sentence:",
    options: [
      "I have been living here since 5 years",
      "I have been living here for 5 years",
      "I am living here since 5 years",
      "I was living here for 5 years"
    ],
    correct_answer: 1,
    explanation: "Use 'for' with a period of time and 'since' with a point in time."
  }
]

export default function QuizPreview() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>(STATIC_QUESTIONS)
  const [loading, setLoading] = useState(false)

  // Optional: Load dynamic questions in the background
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getRandomQuizQuestions(3)
        if (data && data.length > 0) {
          const formattedQuestions = data.map(q => ({
            ...q,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
          }))
          setQuestions(formattedQuestions)
        }
      } catch (error) {
        console.error('Error fetching preview questions:', error)
        // Keep static questions as fallback
      }
    }

    // Delay the API call to improve initial page load
    const timer = setTimeout(fetchQuestions, 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(null)
    }
  }

  if (loading) {
    return (
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    )
  }

  if (questions.length === 0) {
    return (
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">No quiz questions available at the moment.</p>
        </div>
      </section>
    )
  }

  const currentQuestionData = questions[currentQuestion]
  if (!currentQuestionData) {
    return (
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">Question not found.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium mb-4 border">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            Quick Quiz
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Test Your Knowledge
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of students learning from industry experts. Start your journey today.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h3 className="text-2xl font-semibold tracking-tight mb-6">
              {questions.length > 0 && questions[0]?.quiz?.title ? questions[0].quiz.title : 'Interactive Learning Experience'}
            </h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Test your knowledge with our interactive quiz system. Get instant feedback 
              and track your progress as you master new concepts.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-muted-foreground">Instant feedback on every answer</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-muted-foreground">Detailed explanations for each question</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-muted-foreground">Progress tracking and analytics</span>
              </div>
            </div>

            <Link href="/quizzes" className="btn-primary">
              Start Practicing
            </Link>
          </div>

          {/* Interactive Quiz Demo */}
          <div className="card p-8">
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-8">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            {/* Question */}
            <h3 className="text-xl font-semibold text-foreground mb-6">
              {currentQuestionData.question}
            </h3>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {currentQuestionData.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border transition-colors ${
                    selectedAnswer === index
                      ? 'border-primary bg-primary/10 text-primary-foreground'
                      : 'border-border hover:border-border/80 hover:bg-muted/50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === index
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {selectedAnswer === index && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </span>
                    {option}
                  </span>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  currentQuestion === 0
                    ? 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentQuestion === questions.length - 1 || selectedAnswer === null}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  currentQuestion === questions.length - 1 || selectedAnswer === null
                    ? 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
