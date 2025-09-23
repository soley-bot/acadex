'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { StandardQuizLayout } from '@/components/quiz/layouts/StandardQuizLayout';
import { QuizErrorBoundary } from '@/components/ErrorBoundary';

interface QuizTakingPageProps {
  params: Promise<{ id: string }>;
}

export default function QuizTakingPage({ params }: QuizTakingPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  // Refs for cleanup and abort control
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  
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

  // Cleanup function
  const cleanup = useCallback(() => {
    isMountedRef.current = false;
    
    // Abort any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Submit quiz with proper error handling and cleanup
  const submitQuiz = useCallback(async () => {
    if (submitting || !isMountedRef.current) return;
    
    setSubmitting(true);
    
    try {
      // Create abort controller for submit request
      const submitController = new AbortController();
      
      // Calculate score (simple version)
      let score = 0;
      const totalPoints = questions.reduce((sum, question) => sum + (question.points || 1), 0);
      
      questions.forEach(question => {
        const userAnswer = answers[question.id];
        if (question.question_type === 'multiple_choice') {
          if (userAnswer === question.correct_answer) {
            score += question.points || 1;
          }
        }
      });

      // Submit to API with abort signal
      const response = await fetch('/api/quiz-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: submitController.signal,
        body: JSON.stringify({
          quiz_id: quizId,
          answers,
          score,
          total_questions: questions.length,
          total_points: totalPoints,
          time_taken: quiz?.time_limit_minutes ? (quiz.time_limit_minutes * 60) - timeLeft : 0
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to submit quiz`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit quiz');
      }

      // Only navigate if component is still mounted
      if (isMountedRef.current) {
        // Clear timer before navigation
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        router.push(`/quizzes/${quizId}/results`);
      }
    } catch (err) {
      // Only handle error if not aborted and component is mounted
      if (!isMountedRef.current) return;
      
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Quiz submission aborted');
        return;
      }
      
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
    } finally {
      if (isMountedRef.current) {
        setSubmitting(false);
      }
    }
  }, [submitting, questions, answers, quizId, quiz?.time_limit_minutes, timeLeft, router]);

  // Resolve params with proper error handling
  useEffect(() => {
    let mounted = true;
    
    params.then(({ id }) => {
      if (mounted && isMountedRef.current) {
        setQuizId(id);
      }
    }).catch((err) => {
      if (mounted && isMountedRef.current) {
        console.error('Error resolving params:', err);
        setError('Invalid quiz URL');
        setLoading(false);
      }
    });
    
    return () => {
      mounted = false;
    };
  }, [params]);

  // Load quiz data with proper cleanup and error handling
  useEffect(() => {
    if (!quizId || !user || !isMountedRef.current) return;

    const loadQuiz = async () => {
      try {
        // Abort previous request if any
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        // Create new abort controller
        abortControllerRef.current = new AbortController();
        
        if (!isMountedRef.current) return;
        
        setLoading(true);
        setError(null);

        // Fetch quiz data with abort signal
        const response = await fetch(`/api/quizzes/${quizId}`, {
          signal: abortControllerRef.current.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch quiz`);
        }

        const result = await response.json();
        
        // Check if component is still mounted before setting state
        if (!isMountedRef.current) return;
        
        if (result.success && result.quiz && result.questions) {
          setQuiz(result.quiz);
          setQuestions(result.questions);
          
          // Set timer if quiz has time limit
          if (result.quiz.time_limit_minutes && result.quiz.time_limit_minutes > 0) {
            const timeInSeconds = result.quiz.time_limit_minutes * 60;
            setTimeLeft(timeInSeconds);
            
            // Start timer with cleanup
            timerRef.current = setInterval(() => {
              if (!isMountedRef.current) {
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                  timerRef.current = null;
                }
                return;
              }
              
              setTimeLeft(prev => {
                if (prev <= 1) {
                  // Auto-submit when time runs out
                  submitQuiz();
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          }
        } else {
          throw new Error(result.error || 'Failed to load quiz data');
        }
      } catch (err) {
        // Only handle error if not aborted and component is mounted
        if (!isMountedRef.current) return;
        
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Quiz loading aborted');
          return;
        }
        
        console.error('Error loading quiz:', err);
        setError(err instanceof Error ? err.message : 'Failed to load quiz');
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadQuiz();

    // Cleanup function for this effect
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [quizId, user, submitQuiz]);

  // Handle answer changes with validation
  const handleAnswerChange = useCallback((questionId: string, answer: any) => {
    if (!isMountedRef.current) return;
    
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  }, []);

  // Navigation with bounds checking
  const goNext = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setCurrentQuestionIndex(prev => {
      const newIndex = Math.min(prev + 1, questions.length - 1);
      return newIndex;
    });
  }, [questions.length]);

  const goPrevious = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
  }, []);

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
    <QuizErrorBoundary>
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
    </QuizErrorBoundary>
  );
}