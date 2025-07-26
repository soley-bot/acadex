'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDB() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function testDatabase() {
      try {
        console.log('Testing database connections...')
        
        // Test basic connection first
        const { data: healthCheck, error: healthError } = await supabase
          .from('users')
          .select('count')
          .limit(1)
        
        console.log('Health check:', { data: healthCheck, error: healthError })

        // Test each table
        const [usersTest, coursesTest, quizzesTest, questionsTest] = await Promise.all([
          supabase.from('users').select('*').limit(5),
          supabase.from('courses').select('*').limit(5),
          supabase.from('quizzes').select('*').limit(5),
          supabase.from('questions').select('*').limit(5)
        ])

        console.log('Database test results:', {
          users: usersTest,
          courses: coursesTest, 
          quizzes: quizzesTest,
          questions: questionsTest
        })

        setResults({
          healthCheck: {
            error: healthError?.message,
            success: !healthError
          },
          users: {
            error: usersTest.error?.message,
            count: usersTest.data?.length || 0,
            data: usersTest.data
          },
          courses: {
            error: coursesTest.error?.message,
            count: coursesTest.data?.length || 0,
            data: coursesTest.data
          },
          quizzes: {
            error: quizzesTest.error?.message,
            count: quizzesTest.data?.length || 0,
            data: quizzesTest.data
          },
          questions: {
            error: questionsTest.error?.message,
            count: questionsTest.data?.length || 0,
            data: questionsTest.data
          }
        })
      } catch (error) {
        console.error('Database test error:', error)
        setResults({
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      } finally {
        setLoading(false)
      }
    }

    testDatabase()
  }, [])

  if (loading) return <div className="p-8">Testing database connection...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>
      
      {results.error && (
        <div className="mb-6 p-4 border border-red-300 bg-red-50 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Connection Error</h2>
          <p className="text-red-600">{results.error}</p>
        </div>
      )}

      {results.healthCheck && (
        <div className={`mb-6 p-4 border rounded-lg ${results.healthCheck.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
          <h2 className="text-lg font-semibold mb-2">
            Health Check: {results.healthCheck.success ? '✅ Connected' : '❌ Failed'}
          </h2>
          {results.healthCheck.error && <p className="text-red-600">{results.healthCheck.error}</p>}
        </div>
      )}
      
      {Object.entries(results).filter(([key]) => !['error', 'healthCheck'].includes(key)).map(([tableName, result]: [string, any]) => (
        <div key={tableName} className="mb-6 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">{tableName.toUpperCase()}</h2>
          <p>Count: {result.count}</p>
          {result.error && <p className="text-red-600">Error: {result.error}</p>}
          {result.data && (
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-600">View Data</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      ))}
    </div>
  )
}
