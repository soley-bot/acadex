'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cachedAPI, searchAPI, QueryPerformance } from '@/lib/optimizedDatabase';
import { QuizCardSkeleton, LoadingWrapper, useStaggeredLoading } from '@/components/SkeletonLoaders';
import type { Quiz } from '@/lib/supabase';

// ===============================================
// OPTIMIZED QUIZZES PAGE WITH ALL BEST PRACTICES
// ===============================================

interface OptimizedQuiz {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  duration_minutes: number;
  total_questions: number;
  is_published: boolean;
  created_at: string;
}

const DIFFICULTY_COLORS = {
  'Beginner': 'bg-green-100 text-green-800',
  'Intermediate': 'bg-yellow-100 text-yellow-800',
  'Advanced': 'bg-red-100 text-red-800'
} as const;

// Removed icon mapping - using clean text-only design

export default function OptimizedQuizzesPage() {
  // ===============================================
  // STATE MANAGEMENT
  // ===============================================
  const [quizzes, setQuizzes] = useState<OptimizedQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // ===============================================
  // OPTIMIZED DATA FETCHING
  // ===============================================
  const fetchQuizzes = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use performance monitoring
      const result = await QueryPerformance.measure('quiz-list', async () => {
        if (searchQuery.trim()) {
          // Use optimized search
          return await searchAPI.searchQuizzes(searchQuery, 20);
        } else {
          // Use cached API with selective fields
          return await cachedAPI.getQuizList(20, true);
        }
      });

      if (result && typeof result === 'object' && 'error' in result && (result as any).error) throw (result as any).error;
      
      const data = result && typeof result === 'object' && 'data' in result ? (result as any).data : [];
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
      setError('Failed to load quizzes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  // Fetch data on mount and search changes
  useEffect(() => {  
    const timeoutId = setTimeout(() => {
      fetchQuizzes();
    }, searchQuery ? 300 : 0); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [fetchQuizzes, searchQuery]);

  // ===============================================
  // MEMOIZED FILTERING (CLIENT-SIDE)
  // ===============================================
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(quiz => {
      const matchesDifficulty = !selectedDifficulty || quiz.difficulty === selectedDifficulty;
      const matchesCategory = !selectedCategory || quiz.category === selectedCategory;
      return matchesDifficulty && matchesCategory;
    });
  }, [quizzes, selectedDifficulty, selectedCategory]);

  // ===============================================
  // STAGGERED LOADING FOR BETTER UX
  // ===============================================
  const visibleQuizzes = useStaggeredLoading(filteredQuizzes, 100);

  // ===============================================
  // MEMOIZED UTILITY FUNCTIONS
  // ===============================================
  const getDifficultyColor = useMemo(() => {
    return (difficulty: string) => DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS] || 'bg-gray-100 text-gray-800';
  }, []);

  // Removed icon mapping - using clean text-only design

  // ===============================================
  // OPTIMIZED QUIZ CARD COMPONENT
  // ===============================================
  const QuizCard = React.memo<{ quiz: OptimizedQuiz }>(({ quiz }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        {/* Header with difficulty badge */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900 flex-1 mr-4">
            {quiz.title}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
            {quiz.difficulty}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-2">
          {quiz.description}
        </p>

        {/* Category and stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              {quiz.category}
            </span>
            <span>{quiz.total_questions} questions</span>
            <span>{quiz.duration_minutes} min</span>
          </div>
        </div>

        {/* Action button */}
        <Link
          href={`/quizzes/${quiz.id}`}
          className="block w-full bg-[#ff5757] text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-[#ff4444] transition-colors duration-200"
        >
          Take Quiz
        </Link>
      </div>
    </div>
  ));

  QuizCard.displayName = 'QuizCard';

  // ===============================================
  // RENDER
  // ===============================================
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            English Quizzes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Test your English skills with our comprehensive quizzes covering grammar, vocabulary, and more.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Quizzes
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5757] focus:border-[#ff5757]"
              />
            </div>

            {/* Difficulty Filter */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                id="difficulty"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5757] focus:border-[#ff5757]"
              >
                <option value="">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5757] focus:border-[#ff5757]"
              >
                <option value="">All Categories</option>
                <option value="Grammar">Grammar</option>
                <option value="Vocabulary">Vocabulary</option>
                <option value="Reading">Reading</option>
                <option value="Listening">Listening</option>
                <option value="Speaking">Speaking</option>
                <option value="Writing">Writing</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            {isLoading ? (
              <span>Loading quizzes...</span>
            ) : (
              <span>
                Showing {visibleQuizzes.length} of {filteredQuizzes.length} quizzes
                {visibleQuizzes.length < filteredQuizzes.length && (
                  <span className="text-[#ff5757]"> (loading more...)</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Quiz Grid with Loading States */}
        <LoadingWrapper
          isLoading={isLoading}
          skeleton={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <QuizCardSkeleton key={i} />
              ))}
            </div>
          }
          fallback={
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No quizzes found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedDifficulty || selectedCategory
                  ? 'Try adjusting your search criteria.'
                  : 'No quizzes are currently available.'}
              </p>
            </div>
          }
        >
          {error ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchQuizzes}
                className="bg-[#ff5757] text-white px-6 py-2 rounded-lg hover:bg-[#ff4444] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          )}
        </LoadingWrapper>

        {/* Performance Debug (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Performance Stats:</h3>
            <pre className="text-xs">
              {JSON.stringify(QueryPerformance.getStats(), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
