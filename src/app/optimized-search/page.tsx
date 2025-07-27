'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { QueryPerformance } from '@/lib/optimizedDatabase';

interface OptimizedQuiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  duration_minutes: number;
  total_questions: number;
  is_published: boolean;
  created_at: string;
}

export default function OptimizedSearchPage() {
  const [quizzes, setQuizzes] = useState<OptimizedQuiz[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'quizzes' | 'courses' | 'both'>('both');

  // Optimized search function using full-text search indexes
  const performSearch = useCallback(async (query: string, type: 'quizzes' | 'courses' | 'both') => {
    if (!query.trim()) {
      setQuizzes([]);
      setCourses([]);
      return;
    }

    setIsLoading(true);
    
    try {
      let quizResults: any = { data: [] };
      let courseResults: any = { data: [] };

      if (type === 'quizzes' || type === 'both') {
        // Use full-text search index for quizzes
        quizResults = await QueryPerformance.measure('quiz-search', async () => {
          return await supabase
            .from('quizzes')
            .select(`
              id,
              title,
              description,
              difficulty,
              category,
              duration_minutes,
              total_questions,
              is_published,
              created_at
            `)
            .eq('is_published', true)
            .textSearch('title', query, { type: 'websearch' })
            .limit(10);
        });
      }

      if (type === 'courses' || type === 'both') {
        // Use full-text search index for courses
        courseResults = await QueryPerformance.measure('course-search', async () => {
          return await supabase
            .from('courses')
            .select(`
              id,
              title,
              description,
              instructor_name,
              category,
              level,
              price,
              duration,
              rating,
              student_count,
              created_at
            `)
            .eq('is_published', true)
            .textSearch('title', query, { type: 'websearch' })
            .limit(10);
        });
      }

      // Handle results
      if ('error' in quizResults && quizResults.error) throw quizResults.error;
      if ('error' in courseResults && courseResults.error) throw courseResults.error;

      setQuizzes('data' in quizResults ? quizResults.data || [] : []);
      setCourses('data' in courseResults ? courseResults.data || [] : []);

    } catch (error) {
      console.error('Search error:', error);
      // Fallback to regular search if full-text search fails
      await fallbackSearch(query, type);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fallback search using ILIKE (still fast with indexes)
  const fallbackSearch = async (query: string, type: 'quizzes' | 'courses' | 'both') => {
    let quizResults: any = { data: [] };
    let courseResults: any = { data: [] };

    if (type === 'quizzes' || type === 'both') {
      quizResults = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          description,
          difficulty,
          category,
          duration_minutes,
          total_questions,
          is_published,
          created_at
        `)
        .eq('is_published', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(10);
    }

    if (type === 'courses' || type === 'both') {
      courseResults = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          instructor_name,
          category,
          level,
          price,
          duration,
          rating,
          student_count,
          created_at
        `)
        .eq('is_published', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(10);
    }

    setQuizzes('data' in quizResults ? quizResults.data || [] : []);
    setCourses('data' in courseResults ? courseResults.data || [] : []);
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery, searchType);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchType, performSearch]);

  const totalResults = quizzes.length + courses.length;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ⚡ Optimized Search
          </h1>
          <p className="text-xl text-gray-600">
            Lightning-fast search powered by database indexes
          </p>
        </div>

        {/* Search Interface */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="space-y-4">
            {/* Search Input */}
            <div>
              <input
                type="text"
                placeholder="Search for courses, quizzes, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff5757] focus:border-[#ff5757]"
              />
            </div>

            {/* Search Type Selector */}
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="both"
                  checked={searchType === 'both'}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="mr-2"
                />
                Both
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="courses"
                  checked={searchType === 'courses'}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="mr-2"
                />
                Courses Only
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="quizzes"
                  checked={searchType === 'quizzes'}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="mr-2"
                />
                Quizzes Only
              </label>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              {isLoading ? (
                <span>Searching...</span>
              ) : searchQuery ? (
                <span>Found {totalResults} results for &ldquo;{searchQuery}&rdquo;</span>
              ) : (
                <span>Type to search courses and quizzes</span>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff5757]"></div>
          </div>
        )}

        {/* Results */}
        {!isLoading && searchQuery && (
          <div className="space-y-8">
            {/* Quiz Results */}
            {quizzes.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  🧩 Quizzes ({quizzes.length})
                </h2>
                <div className="grid gap-4">
                  {quizzes.map((quiz) => (
                    <Link
                      key={quiz.id}
                      href={`/quizzes/${quiz.id}`}
                      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                        <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {quiz.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{quiz.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{quiz.category}</span>
                        <span>{quiz.total_questions} questions</span>
                        <span>{quiz.duration_minutes} min</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Course Results */}
            {courses.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  📚 Courses ({courses.length})
                </h2>
                <div className="grid gap-4">
                  {courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                        <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">
                          {course.level}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{course.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{course.category}</span>
                        <span>by {course.instructor_name}</span>
                        <span>{course.duration}</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {totalResults === 0 && searchQuery && !isLoading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">
                  Try different keywords or browse our categories
                </p>
              </div>
            )}
          </div>
        )}

        {/* Performance Stats */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Search Performance:</h3>
            <pre className="text-xs">
              {JSON.stringify(QueryPerformance.getStats(), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
