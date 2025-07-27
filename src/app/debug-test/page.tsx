'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function DebugTestPage() {
  const { user, loading: authLoading } = useAuth()
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const runTests = useCallback(async () => {
    setLoading(true)
    const results: any[] = []

    try {
      // Test 1: Database Connection
      results.push({ test: 'Database Connection', status: 'running' })
      const { data: dbTest, error: dbError } = await supabase.from('users').select('count').limit(1)
      results[results.length - 1] = {
        test: 'Database Connection',
        status: dbError ? 'failed' : 'passed',
        details: dbError ? dbError.message : 'Connected successfully'
      }

      // Test 2: Authentication Status
      results.push({
        test: 'Authentication',
        status: user ? 'passed' : 'failed',
        details: user ? `Authenticated as: ${user.email}` : 'Not authenticated'
      })

      // Test 3: Courses Table
      results.push({ test: 'Courses Table Query', status: 'running' })
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, instructor_name, price, category, level, is_published')
        .limit(5)
      
      results[results.length - 1] = {
        test: 'Courses Table Query',
        status: coursesError ? 'failed' : 'passed',
        details: coursesError ? coursesError.message : `Found ${courses?.length || 0} courses`,
        data: courses?.slice(0, 2) // Show first 2 courses
      }

      // Test 4: Users Table (Admin check)
      results.push({ test: 'Users Table Query', status: 'running' })
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, role, name')
        .limit(3)
      
      results[results.length - 1] = {
        test: 'Users Table Query',
        status: usersError ? 'failed' : 'passed',
        details: usersError ? usersError.message : `Found ${users?.length || 0} users`,
        data: users
      }

      // Test 5: Quizzes Table
      results.push({ test: 'Quizzes Table Query', status: 'running' })
      const { data: quizzes, error: quizzesError } = await supabase
        .from('quizzes')
        .select('id, title, difficulty, duration_minutes, is_published')
        .limit(3)
      
      results[results.length - 1] = {
        test: 'Quizzes Table Query',
        status: quizzesError ? 'failed' : 'passed',
        details: quizzesError ? quizzesError.message : `Found ${quizzes?.length || 0} quizzes`,
        data: quizzes
      }

      // Test 6: Enrollments Table
      results.push({ test: 'Enrollments Table Query', status: 'running' })
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('id, user_id, course_id, enrolled_at, progress')
        .limit(3)
      
      results[results.length - 1] = {
        test: 'Enrollments Table Query',
        status: enrollmentsError ? 'failed' : 'passed',
        details: enrollmentsError ? enrollmentsError.message : `Found ${enrollments?.length || 0} enrollments`,
        data: enrollments
      }

      // Test 7: Quiz Questions Table  
      results.push({ test: 'Quiz Questions Query', status: 'running' })
      const { data: quizQuestions, error: quizQuestionsError } = await supabase
        .from('quiz_questions')
        .select('id, quiz_id, question, options, correct_answer')
        .limit(2)
      
      results[results.length - 1] = {
        test: 'Quiz Questions Query',
        status: quizQuestionsError ? 'failed' : 'passed',
        details: quizQuestionsError ? quizQuestionsError.message : 
                 `Found ${quizQuestions?.length || 0} quiz questions`,
        data: quizQuestions?.slice(0, 1)
      }

    } catch (error: any) {
      results.push({
        test: 'General Error Catch',
        status: 'failed',
        details: error.message
      })
    }

    setTestResults(results)
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!authLoading) {
      runTests()
    }
  }, [authLoading, runTests])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-50'
      case 'failed': return 'text-red-600 bg-red-50'
      case 'running': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 Debug Test Suite</h1>
        <p className="text-gray-600">Comprehensive testing of database connections and admin functionality</p>
        <button 
          onClick={runTests}
          disabled={loading}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run Tests Again'}
        </button>
      </div>

      <div className="space-y-4">
        {testResults.map((result, index) => (
          <div key={index} className="border rounded-lg p-6 bg-white shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
                {result.status.toUpperCase()}
              </span>
              <h3 className="text-lg font-semibold">{result.test}</h3>
            </div>
            
            <p className="text-gray-600 mb-3">{result.details}</p>
            
            {result.data && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Data Sample:</h4>
                <pre className="text-sm text-gray-700 overflow-x-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {testResults.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Click &ldquo;Run Tests&rdquo; to start debugging</p>
        </div>
      )}
    </div>
  )
}
