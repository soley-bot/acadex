'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function QuizDebug() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testQueries = [
    {
      name: 'Basic Count',
      query: () => supabase.from('quizzes').select('count')
    },
    {
      name: 'Select All',
      query: () => supabase.from('quizzes').select('*')
    },
    {
      name: 'Select ID Only',
      query: () => supabase.from('quizzes').select('id')
    },
    {
      name: 'Select with Limit',
      query: () => supabase.from('quizzes').select('*').limit(1)
    },
    {
      name: 'Order by Created At',
      query: () => supabase.from('quizzes').select('*').order('created_at', { ascending: false })
    },
    {
      name: 'Specific Columns',
      query: () => supabase.from('quizzes').select('id, title, description, difficulty')
    }
  ]

  const runTest = async (test: typeof testQueries[0]) => {
    setLoading(true)
    setResult(`Testing: ${test.name}...\n`)
    
    try {
      const { data, error } = await test.query()
      
      if (error) {
        setResult(prev => prev + `❌ FAILED: ${error.message}\n` +
          `Code: ${error.code}\n` +
          `Details: ${error.details}\n` +
          `Hint: ${error.hint}\n\n`)
      } else {
        setResult(prev => prev + `✅ SUCCESS: Found ${Array.isArray(data) ? data.length : 'N/A'} records\n` +
          `Data: ${JSON.stringify(data, null, 2)}\n\n`)
      }
    } catch (err) {
      setResult(prev => prev + `❌ ERROR: ${err instanceof Error ? err.message : 'Unknown error'}\n\n`)
    } finally {
      setLoading(false)
    }
  }

  const runAllTests = async () => {
    setResult('')
    for (const test of testQueries) {
      await runTest(test)
      await new Promise(resolve => setTimeout(resolve, 500)) // Small delay between tests
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quiz Query Debug</h1>
      
      <div className="space-y-2 mb-6">
        <button
          onClick={runAllTests}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 mr-2"
        >
          Run All Tests
        </button>
        
        {testQueries.map((test, index) => (
          <button
            key={index}
            onClick={() => runTest(test)}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 mr-2"
          >
            {test.name}
          </button>
        ))}
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}
    </div>
  )
}
