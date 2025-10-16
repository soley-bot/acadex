'use client'

import { useState } from 'react'

export default function AdminDebugPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testQuizzesAPI = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log('🔍 Testing /api/admin/quizzes endpoint...')
      
      const response = await fetch('/api/admin/quizzes?page=1&limit=10&mode=slim', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', response.headers)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('✅ API Response:', data)
      setResult(data)
      
    } catch (err) {
      console.error('❌ Error testing API:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }
  
  const testCategoriesAPI = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log('🔍 Testing /api/admin/categories endpoint...')
      
      const response = await fetch('/api/admin/categories', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('✅ Categories Response:', data)
      setResult(data)
      
    } catch (err) {
      console.error('❌ Error testing categories API:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const testSupabaseConnection = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log('🔍 Testing Supabase connection...')
      
      const { createSupabaseClient } = await import('@/lib/supabase')
      const supabase = createSupabaseClient()
      const { data, error: supabaseError } = await supabase
        .from('quizzes')
        .select('id, title, category, is_published')
        .limit(5)
        
      if (supabaseError) {
        console.error('❌ Supabase Error:', supabaseError)
        throw new Error(`Supabase Error: ${supabaseError.message}`)
      }
      
      console.log('✅ Supabase Response:', data)
      setResult(data)
      
    } catch (err) {
      console.error('❌ Error testing Supabase:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin API Debug Tool</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={testQuizzesAPI}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Quizzes API
        </button>
        
        <button
          onClick={testCategoriesAPI}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
        >
          Test Categories API
        </button>
        
        <button
          onClick={testSupabaseConnection}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
        >
          Test Supabase Direct
        </button>
      </div>
      
      {loading && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Loading...
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <h3 className="font-bold mb-2">Result:</h3>
          <pre className="bg-white p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
