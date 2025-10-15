'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { StandardQuizLayout } from '@/components/quiz/layouts/StandardQuizLayout';
import { QuizErrorBoundary } from '@/components/ErrorBoundary';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function QuizTakingPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  
  // Get quizId directly from params (synchronous, no state needed)
  const quizId = params?.id as string | undefined;
  
  // Refs for cleanup and abort control
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const isLoadingQuizRef = useRef(false); // Track if quiz is currently being loaded

  // State
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loadingStage, setLoadingStage] = useState<'auth' | 'params' | 'quiz'>('auth');

  // Mount/unmount tracking and cleanup
  useEffect(() => {
    // Set mounted to true on mount
    isMountedRef.current = true;

    return () => {
      // Set to false on unmount
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
    };
  }, []); // Empty deps - only run on mount/unmount

  // Submit quiz with proper error handling and cleanup
  const submitQuiz = useCallback(async () => {
    if (submitting || !isMountedRef.current || !quizId) return;

    setSubmitting(true);

    try {
      // Create abort controller for submit request
      const submitController = new AbortController();

      // Calculate time taken
      const timeTaken = quiz?.time_limit_minutes
        ? (quiz.time_limit_minutes * 60) - timeLeft
        : 0;

      // Submit to API with abort signal
      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: submitController.signal,
        body: JSON.stringify({
          answers,
          time_taken: timeTaken
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to submit quiz`);
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

        // Navigate to results page with the result ID
        router.push(`/quizzes/${quizId}/results/${result.result.id}`);
      }
    } catch (err) {
      // Only handle error if not aborted and component is mounted
      if (!isMountedRef.current) return;

      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Quiz submission aborted');
        return;
      }

      console.error('Error submitting quiz:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit quiz. Please try again.');
    } finally {
      if (isMountedRef.current) {
        setSubmitting(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitting, quizId, answers, timeLeft, quiz?.time_limit_minutes]);

  // Safety timeout - prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading && !error) {
        console.error('⏱️ Quiz loading timeout after 20 seconds');
        setError('Loading timeout. Please check your connection and try again.');
        setLoading(false);
      }
    }, 20000); // 20 second safety timeout

    return () => clearTimeout(timeoutId);
  }, [loading, error]);

  // Development debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Quiz Take Effect State:', {
        quizId,
        hasUser: !!user,
        authLoading,
        loading,
        loadingStage,
        error
      });
    }
  }, [quizId, user, authLoading, loading, loadingStage, error]);

  // Load quiz data with proper cleanup and error handling
  useEffect(() => {
    // CRITICAL FIX: Wait for auth to finish loading
    if (authLoading) {
      setLoadingStage('auth');
      return;
    }

    // Wait for params to be resolved (quizId to be set)
    if (!quizId) {
      setLoadingStage('params');
      return;
    }

    // Check if user is authenticated
    if (!user || !isMountedRef.current) {
      console.log('❌ User check failed:', { hasUser: !!user, isMounted: isMountedRef.current });
      return;
    }

    console.log('✅ User authenticated, proceeding to load quiz');

    // Prevent multiple simultaneous loads
    if (isLoadingQuizRef.current) {
      console.log('⏭️ Quiz already loading, skipping duplicate request');
      return;
    }

    const loadQuiz = async () => {
      try {
        // Mark as loading
        isLoadingQuizRef.current = true;

        // Create new abort controller (don't abort previous, just replace)
        abortControllerRef.current = new AbortController();

        if (!isMountedRef.current) return;

        setLoadingStage('quiz');
        setLoading(true);
        setError(null);

        console.log('🔄 Loading quiz data for ID:', quizId);

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
                  // Note: submitQuiz will be called via separate effect watching timeLeft
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
        // Reset loading flag
        isLoadingQuizRef.current = false;

        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadQuiz();
    // No cleanup needed here - handled by main unmount effect
  }, [quizId, user, authLoading]);

  // Auto-submit when time runs out
  useEffect(() => {
    // Only auto-submit if quiz is loaded AND timer actually expired (was > 0 before)
    if (timeLeft === 0 && quiz && questions.length > 0 && !submitting && quiz.time_limit_minutes) {
      console.log('⏰ Time expired - auto-submitting quiz');
      submitQuiz();
    }
  }, [timeLeft, quiz, questions.length, submitting, submitQuiz]);

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

  // Enhanced loading state with stage information
  if (loading) {
    const loadingMessage = 
      loadingStage === 'auth' ? 'Checking authentication...' :
      loadingStage === 'params' ? 'Loading quiz...' :
      'Preparing quiz questions...'

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {loadingMessage}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This should only take a moment...
          </p>
        </div>
      </div>
    );
  }

  // Enhanced error state with retry and navigation options
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-red-950">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Error Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-3">
            {error?.includes('Invalid') ? 'Invalid Quiz' :
             error?.includes('timeout') ? 'Loading Timeout' :
             error?.includes('not found') ? 'Quiz Not Found' :
             'Failed to Load Quiz'}
          </h2>

          {/* Error Description */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>

          {/* Secondary Action */}
          <button
            onClick={() => router.push('/quizzes')}
            className="w-full mt-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Browse All Quizzes
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