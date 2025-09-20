'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { StandardQuizLayout } from '@/components/quiz/layouts/StandardQuizLayout';

interface QuizTakingPageProps {
  params: Promise<{ id: string }>;
}

export default function QuizTakingPage({ params }: QuizTakingPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  // State
  const [quizId, setQuizId] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Resolve params
  useEffect(() => {
    params.then(({ id }) => setQuizId(id));
  }, [params]);

  // Load quiz data
  useEffect(() => {
    if (!quizId || !user) return;

    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch quiz data using the working API endpoint
        const response = await fetch(`/api/quizzes/${quizId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch quiz');
        }

        const result = await response.json();
        
        if (result.success && result.quiz && result.questions) {
          setQuiz(result.quiz);
          setQuestions(result.questions);
          
          // Set timer if quiz has time limit
          if (result.quiz.time_limit_minutes) {
            setTimeLeft(result.quiz.time_limit_minutes * 60);
          }
        } else {
          throw new Error(result.error || 'Failed to load quiz');
        }
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError(err instanceof Error ? err.message : 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, user]);

  // Handle answer changes
  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  // Navigation
  const goNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Submit quiz
  const submitQuiz = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      // Calculate score (simple version)
      let score = 0;
      questions.forEach(question => {
        const userAnswer = answers[question.id];
        if (question.question_type === 'multiple_choice') {
          if (userAnswer === question.correct_answer) {
            score += question.points || 1;
          }
        }
      });

      // Submit to API (simplified)
      const response = await fetch('/api/quiz-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: quizId,
          answers,
          score,
          total_questions: questions.length,
        }),
      });

      if (response.ok) {
        router.push(`/quizzes/${quizId}/results`);
      } else {
        throw new Error('Failed to submit quiz');
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="p-8 text-center max-w-md mx-auto">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Loading Quiz...
          </h2>
          <p className="mt-2 text-gray-600">
            Preparing your quiz experience
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 14.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Quiz Loading Failed
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Quiz not found
  if (!quiz || !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="p-8 text-center max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Quiz Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The quiz you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Main quiz interface using StandardQuizLayout
  return (
    <StandardQuizLayout
      questions={questions}
      currentQuestionIndex={currentQuestionIndex}
      answers={answers}
      timeLeft={timeLeft}
      showTimer={timeLeft > 0}
      onAnswerChange={handleAnswerChange}
      onPrevious={goPrevious}
      onNext={goNext}
      onSubmit={submitQuiz}
      submitting={submitting}
    />
  );
}