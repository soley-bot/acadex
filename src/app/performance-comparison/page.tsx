'use client'

import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { QueryPerformance, clearAllCaches } from '@/lib/optimizedDatabase';

export default function PerformanceComparisonPage() {
  const [results, setResults] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  const runPerformanceTests = async () => {
    setIsRunning(true);
    setResults({});
    
    const testResults: any = {};

    try {
      // Test 1: Basic Quiz Query (Old Way)
      setCurrentTest('Testing old quiz query...');
      const oldQuizStart = performance.now();
      const oldQuizQuery = await supabase.from('quizzes').select('*');
      const oldQuizTime = performance.now() - oldQuizStart;
      testResults.oldQuizQuery = { time: Math.round(oldQuizTime), count: oldQuizQuery.data?.length || 0 };

      // Test 2: Optimized Quiz Query (New Way)
      setCurrentTest('Testing optimized quiz query...');
      const newQuizStart = performance.now();
      const newQuizQuery = await supabase
        .from('quizzes')
        .select('id, title, description, difficulty, category, duration_minutes, total_questions')
        .eq('is_published', true)
        .limit(20);
      const newQuizTime = performance.now() - newQuizStart;
      testResults.newQuizQuery = { time: Math.round(newQuizTime), count: newQuizQuery.data?.length || 0 };

      // Test 3: Course Query with Filtering (Old Way)
      setCurrentTest('Testing old course filtering...');
      const oldCourseStart = performance.now();
      const oldCourseQuery = await supabase.from('courses').select('*').eq('category', 'English Grammar');
      const oldCourseTime = performance.now() - oldCourseStart;
      testResults.oldCourseQuery = { time: Math.round(oldCourseTime), count: oldCourseQuery.data?.length || 0 };

      // Test 4: Optimized Course Query (New Way)
      setCurrentTest('Testing optimized course filtering...');
      const newCourseStart = performance.now();
      const newCourseQuery = await supabase
        .from('courses')
        .select('id, title, description, category, level, price, duration, rating, student_count')
        .eq('is_published', true)
        .eq('category', 'English Grammar')
        .limit(20);
      const newCourseTime = performance.now() - newCourseStart;
      testResults.newCourseQuery = { time: Math.round(newCourseTime), count: newCourseQuery.data?.length || 0 };

      // Test 5: User Dashboard Data (Parallel)
      setCurrentTest('Testing parallel dashboard queries...');
      const dashboardStart = performance.now();
      const [userCount, courseCount, quizCount] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('quizzes').select('id', { count: 'exact', head: true })
      ]);
      const dashboardTime = performance.now() - dashboardStart;
      testResults.dashboardParallel = { 
        time: Math.round(dashboardTime), 
        counts: {
          users: userCount.count || 0,
          courses: courseCount.count || 0,
          quizzes: quizCount.count || 0
        }
      };

      // Test 6: Search Performance
      setCurrentTest('Testing search performance...');
      const searchStart = performance.now();
      const searchQuery = await supabase
        .from('quizzes')
        .select('id, title, description, category')
        .eq('is_published', true)
        .ilike('title', '%grammar%')
        .limit(10);
      const searchTime = performance.now() - searchStart;
      testResults.searchQuery = { time: Math.round(searchTime), count: searchQuery.data?.length || 0 };

    } catch (error) {
      logger.error('Performance test error:', error);
    }

    setResults(testResults);
    setCurrentTest('');
    setIsRunning(false);
  };

  const getPerformanceRating = (time: number) => {
    if (time < 100) return { label: '🚀 Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (time < 300) return { label: '⚡ Good', color: 'text-secondary', bg: 'bg-secondary/10' };
    if (time < 500) return { label: '👍 Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (time < 1000) return { label: '🐌 Slow', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: '❌ Very Slow', color: 'text-primary', bg: 'bg-destructive/20' };
  };

  const calculateImprovement = (oldTime: number, newTime: number) => {
    const improvement = ((oldTime - newTime) / oldTime) * 100;
    return Math.round(improvement);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Performance Comparison Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Compare old vs optimized database queries with real metrics
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={runPerformanceTests}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isRunning
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-[#ff5757] hover:bg-[#ff4444] text-white'
              }`}
            >
              {isRunning ? '🔄 Running Tests...' : '🚀 Run Performance Tests'}
            </button>
            
            <button
              onClick={clearAllCaches}
              disabled={isRunning}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
            >
              🧹 Clear Cache
            </button>
          </div>

          {currentTest && (
            <div className="mt-4 text-secondary font-medium">
              {currentTest}
            </div>
          )}
        </div>

        {/* Test Results */}
        {Object.keys(results).length > 0 && (
          <div className="space-y-6">
            
            {/* Quiz Query Comparison */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">🧩 Quiz Query Performance</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Old Query */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">❌ Old Query (SELECT *)</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span className={getPerformanceRating(results.oldQuizQuery?.time || 0).color}>
                          {results.oldQuizQuery?.time}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Records:</span>
                        <span>{results.oldQuizQuery?.count}</span>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${getPerformanceRating(results.oldQuizQuery?.time || 0).bg} ${getPerformanceRating(results.oldQuizQuery?.time || 0).color}`}>
                        {getPerformanceRating(results.oldQuizQuery?.time || 0).label}
                      </div>
                    </div>
                  </div>

                  {/* New Query */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">✅ Optimized Query (Selective Fields + Limit)</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span className={getPerformanceRating(results.newQuizQuery?.time || 0).color}>
                          {results.newQuizQuery?.time}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Records:</span>
                        <span>{results.newQuizQuery?.count}</span>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${getPerformanceRating(results.newQuizQuery?.time || 0).bg} ${getPerformanceRating(results.newQuizQuery?.time || 0).color}`}>
                        {getPerformanceRating(results.newQuizQuery?.time || 0).label}
                      </div>
                      {results.oldQuizQuery && results.newQuizQuery && (
                        <div className="text-green-600 font-semibold">
                          {calculateImprovement(results.oldQuizQuery.time, results.newQuizQuery.time)}% faster!
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Course Query Comparison */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">📚 Course Query Performance</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Old Course Query */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">❌ Old Filtering (SELECT *)</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span className={getPerformanceRating(results.oldCourseQuery?.time || 0).color}>
                          {results.oldCourseQuery?.time}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Records:</span>
                        <span>{results.oldCourseQuery?.count}</span>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${getPerformanceRating(results.oldCourseQuery?.time || 0).bg} ${getPerformanceRating(results.oldCourseQuery?.time || 0).color}`}>
                        {getPerformanceRating(results.oldCourseQuery?.time || 0).label}
                      </div>
                    </div>
                  </div>

                  {/* New Course Query */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">✅ Optimized Filtering (Indexes + Selective)</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span className={getPerformanceRating(results.newCourseQuery?.time || 0).color}>
                          {results.newCourseQuery?.time}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Records:</span>
                        <span>{results.newCourseQuery?.count}</span>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${getPerformanceRating(results.newCourseQuery?.time || 0).bg} ${getPerformanceRating(results.newCourseQuery?.time || 0).color}`}>
                        {getPerformanceRating(results.newCourseQuery?.time || 0).label}
                      </div>
                      {results.oldCourseQuery && results.newCourseQuery && (
                        <div className="text-green-600 font-semibold">
                          {calculateImprovement(results.oldCourseQuery.time, results.newCourseQuery.time)}% faster!
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Dashboard & Search Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Dashboard Performance */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">📊 Dashboard Queries</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Parallel Execution:</span>
                      <span className={getPerformanceRating(results.dashboardParallel?.time || 0).color}>
                        {results.dashboardParallel?.time}ms
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Users: {results.dashboardParallel?.counts?.users}</div>
                      <div>Courses: {results.dashboardParallel?.counts?.courses}</div>
                      <div>Quizzes: {results.dashboardParallel?.counts?.quizzes}</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${getPerformanceRating(results.dashboardParallel?.time || 0).bg} ${getPerformanceRating(results.dashboardParallel?.time || 0).color}`}>
                      {getPerformanceRating(results.dashboardParallel?.time || 0).label}
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Performance */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">🔍 Search Performance</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Search Time:</span>
                      <span className={getPerformanceRating(results.searchQuery?.time || 0).color}>
                        {results.searchQuery?.time}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Results Found:</span>
                      <span>{results.searchQuery?.count}</span>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${getPerformanceRating(results.searchQuery?.time || 0).bg} ${getPerformanceRating(results.searchQuery?.time || 0).color}`}>
                      {getPerformanceRating(results.searchQuery?.time || 0).label}
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Action Items */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">🎯 Next Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-secondary mb-2">1. Database Indexes:</h3>
              <p className="text-blue-700 text-sm mb-2">
                Run the SQL file I created in your Supabase dashboard to create performance indexes.
              </p>
              <Link 
                href="/performance-preview"
                className="text-secondary hover:text-secondary underline text-sm"
              >
                View Performance Preview →
              </Link>
            </div>
            <div>
              <h3 className="font-semibold text-secondary mb-2">2. Test Optimized Pages:</h3>
              <div className="space-y-1 text-sm">
                <Link href="/optimized-search" className="block text-secondary hover:text-secondary underline">
                  Test Optimized Search →
                </Link>
                <Link href="/quizzes" className="block text-secondary hover:text-secondary underline">
                  Test Quiz Performance →
                </Link>
                <Link href="/courses" className="block text-secondary hover:text-secondary underline">
                  Test Course Performance →
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
