'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useLoadingState } from '@/hooks/useAsyncState'

export default function AuthDiagnosticPage() {
  const { user, supabaseUser, loading } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [apiTestResult, setApiTestResult] = useState<any>(null)
  
  // 🔄 CONSOLIDATED: Replaced duplicate loading state with unified hook
  const { loading: apiLoading, withLoading } = useLoadingState()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      setSessionInfo({
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        accessToken: session?.access_token ? 'Present' : 'Missing',
        refreshToken: session?.refresh_token ? 'Present' : 'Missing',
        error: error?.message
      })
    } catch (error: any) {
      setSessionInfo({ error: error.message })
    }
  }

  const testApiAuth = async () => {
    // 🔄 CONSOLIDATED: Using unified loading pattern
    const result = await withLoading(async () => {
      // Test the diagnostic API
      const response = await fetch('/api/admin/auth-diagnostic', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      return {
        status: response.status,
        success: result.success,
        data: result
      }
    })
    
    if (result) {
      setApiTestResult(result)
    }
  }

  const testWithAuthHeader = async () => {
    await withLoading(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setApiTestResult({ error: 'No access token available', method: 'Authorization Header' });
        return;
      }
      const response = await fetch('/api/admin/auth-diagnostic', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const result = await response.json();
      setApiTestResult({
        status: response.status,
        success: result.success,
        data: result,
        method: 'Authorization Header'
      });
    });
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Authentication Diagnostic</h1>
      
      {/* User Context Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Auth Context</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>User:</strong>
            <pre className="bg-gray-100 p-2 rounded text-sm mt-1">
              {JSON.stringify({
                hasUser: !!user,
                email: user?.email,
                role: user?.role,
                id: user?.id
              }, null, 2)}
            </pre>
          </div>
          <div>
            <strong>Supabase User:</strong>
            <pre className="bg-gray-100 p-2 rounded text-sm mt-1">
              {JSON.stringify({
                hasSupabaseUser: !!supabaseUser,
                email: supabaseUser?.email,
                id: supabaseUser?.id
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Session Info</h2>
        <button 
          onClick={checkSession}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Session Info
        </button>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
          {JSON.stringify(sessionInfo, null, 2)}
        </pre>
      </div>

      {/* API Test */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">API Authentication Test</h2>
        <div className="space-x-4 mb-4">
          <button 
            onClick={testApiAuth}
            disabled={apiLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {apiLoading ? 'Testing...' : 'Test API (Cookies)'}
          </button>
          <button 
            onClick={testWithAuthHeader}
            disabled={apiLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {apiLoading ? 'Testing...' : 'Test API (Auth Header)'}
          </button>
        </div>
        
        {apiTestResult && (
          <div>
            <h3 className="font-semibold mb-2">API Test Result:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(apiTestResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
