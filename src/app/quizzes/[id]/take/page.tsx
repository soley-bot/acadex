'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { StandardQuizLayout } from '@/components/quiz/layouts/StandardQuizLayout';
import { ReadingQuizLayout } from '@/components/quiz/layouts/ReadingQuizLayout';
import { QuizErrorBoundary } from '@/components/ErrorBoundary';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function QuizTakingPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();

  const quizId = params?.id as string | undefined;

  // State
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasFetchedRef = useRef(false);

  // Load quiz data - only once when auth is ready
  useEffect(() => {
    // Wait for auth to complete
    if (authLoading) {
      return;
    }

    // Check if user is logged in
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Check if we have quizId
    if (!quizId) {
      setError('Invalid quiz ID');
      setLoading(false);
      return;
    }

    // Prevent duplicate fetches
    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;

    // Fetch quiz data
    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/quizzes/${quizId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch quiz: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !result.quiz || !result.questions) {
          throw new Error('Invalid quiz data received');
        }

        setQuiz(result.quiz);
        setQuestions(result.questions);

        // Initialize timer if quiz has time limit
        if (result.quiz.time_limit_minutes && result.quiz.time_limit_minutes > 0) {
          const timeInSeconds = result.quiz.time_limit_minutes * 60;
          setTimeLeft(timeInSeconds);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError(err instanceof Error ? err.message : 'Failed to load quiz');
        setLoading(false);
      }
    };

    loadQuiz();
  }, [authLoading, user, quizId, router]);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timeLeft]);

  // Auto-submit when timer reaches 0
  useEffect(() => {
    if (timeLeft === 0 && !submitting) {
      console.log('⏰ Time expired - auto-submitting quiz');
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // Submit quiz
  const handleSubmit = useCallback(async () => {
    if (submitting || !quizId || !user) {
      return;
    }

    setSubmitting(true);

    try {
      const timeTaken = quiz?.time_limit_minutes
        ? (quiz.time_limit_minutes * 60) - (timeLeft || 0)
        : 0;

      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          time_taken: timeTaken
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to submit quiz: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit quiz');
      }

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Navigate to results
      router.push(`/quizzes/${quizId}/results/${result.result.id}`);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
      setSubmitting(false);
    }
  }, [submitting, quizId, user, quiz, timeLeft, answers, router]);

  // Handle answer changes
  const handleAnswerChange = useCallback((questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  }, []);

  // Navigation
  const goNext = useCallback(() => {
    setCurrentQuestionIndex(prev => Math.min(prev + 1, questions.length - 1));
  }, [questions.length]);

  const goPrevious = useCallback(() => {
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
  }, []);

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {authLoading ? 'Checking authentication...' : 'Loading quiz...'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This should only take a moment...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-red-950">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-3">
            Failed to Load Quiz
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
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
        </div>
      </div>
    );
  }

  // Quiz not loaded
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
            onClick={() => router.push('/quizzes')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Determine if this is a reading quiz
  const isReadingQuiz = quiz?.reading_passage && quiz.reading_passage.trim().length > 0;

  // Main quiz interface
  return (
    <QuizErrorBoundary>
      {isReadingQuiz ? (
        <ReadingQuizLayout
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          timeLeft={timeLeft ?? undefined}
          showTimer={true}
          onAnswerChange={handleAnswerChange}
          onPrevious={goPrevious}
          onNext={goNext}
          onSubmit={handleSubmit}
          submitting={submitting}
          readingPassage={quiz.reading_passage}
          passageTitle={quiz.passage_title}
          passageSource={quiz.passage_source}
          passageAudioUrl={quiz.passage_audio_url}
          wordCount={quiz.word_count}
          estimatedReadTime={quiz.estimated_read_time}
        />
      ) : (
        <StandardQuizLayout
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          timeLeft={timeLeft ?? undefined}
          showTimer={true}
          onAnswerChange={handleAnswerChange}
          onPrevious={goPrevious}
          onNext={goNext}
          onSubmit={handleSubmit}
          submitting={submitting}
          quizTitle={quiz.title || "Quiz"}
        />
      )}
    </QuizErrorBoundary>
  );
}
