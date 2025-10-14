'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface DiagnosticInfo {
  timestamp: string
  url: string
  hostname: string
  protocol: string
  supabaseUrl: string | null
  supabaseConfigured: boolean
  clientInitialized: boolean
  testQueryResult: 'pending' | 'success' | 'error'
  testQueryError: string | null
  testQueryData: any
  networkInfo: {
    online: boolean
    effectiveType?: string
  }
}

export default function ConnectionDiagnosticPage() {
  const [diagnostic, setDiagnostic] = useState<DiagnosticInfo>({
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    hostname: typeof window !== 'undefined' ? window.location.hostname : '',
    protocol: typeof window !== 'undefined' ? window.location.protocol : '',
    supabaseUrl: null,
    supabaseConfigured: false,
    clientInitialized: false,
    testQueryResult: 'pending',
    testQueryError: null,
    testQueryData: null,
    networkInfo: {
      online: typeof navigator !== 'undefined' ? navigator.onLine : false,
    }
  })

  useEffect(() => {
    const runDiagnostics = async () => {
      console.log('🔍 Starting connection diagnostics...')
      
      // Check environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      console.log('Environment check:', {
        supabaseUrl,
        hasAnonKey,
        hostname: window.location.hostname
      })

      setDiagnostic(prev => ({
        ...prev,
        supabaseUrl: supabaseUrl || null,
        supabaseConfigured: !!(supabaseUrl && hasAnonKey),
        clientInitialized: typeof supabase?.from === 'function'
      }))

      // Test actual query
      if (supabase && typeof supabase.from === 'function') {
        try {
          console.log('📡 Testing Supabase query...')
          
          const { data, error } = await supabase
            .from('courses')
            .select('id, title')
            .eq('is_published', true)
            .limit(1)

          console.log('Query result:', { data, error })

          if (error) {
            setDiagnostic(prev => ({
              ...prev,
              testQueryResult: 'error',
              testQueryError: error.message
            }))
          } else {
            setDiagnostic(prev => ({
              ...prev,
              testQueryResult: 'success',
              testQueryData: data
            }))
          }
        } catch (err) {
          console.error('Query exception:', err)
          setDiagnostic(prev => ({
            ...prev,
            testQueryResult: 'error',
            testQueryError: err instanceof Error ? err.message : 'Unknown error'
          }))
        }
      } else {
        console.error('❌ Supabase client not initialized')
        setDiagnostic(prev => ({
          ...prev,
          testQueryResult: 'error',
          testQueryError: 'Supabase client not initialized'
        }))
      }
    }

    runDiagnostics()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50'
      case 'error':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-yellow-600 bg-yellow-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '⏳'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Connection Diagnostic Tool
          </h1>
          <p className="text-gray-600 mb-8">
            Diagnosing Supabase connection on your custom domain
          </p>

          {/* Current Environment */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">🌐 Current Environment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-blue-900">Full URL:</span>
                <span className="text-blue-700 font-mono text-xs">{diagnostic.url}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-blue-900">Hostname:</span>
                <span className="text-blue-700 font-mono">{diagnostic.hostname}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-blue-900">Protocol:</span>
                <span className="text-blue-700 font-mono">{diagnostic.protocol}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-blue-900">Online:</span>
                <span className={diagnostic.networkInfo.online ? 'text-green-600' : 'text-red-600'}>
                  {diagnostic.networkInfo.online ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>
          </div>

          {/* Supabase Configuration */}
          <div className="mb-6 p-4 bg-purple-50 rounded-lg">
            <h2 className="text-lg font-semibold text-purple-900 mb-3">⚙️ Supabase Configuration</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium text-purple-900">Environment Variables:</span>
                <span className={diagnostic.supabaseConfigured ? 'text-green-600' : 'text-red-600'}>
                  {diagnostic.supabaseConfigured ? '✅ Configured' : '❌ Missing'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-purple-900">Supabase URL:</span>
                <span className="text-purple-700 font-mono text-xs">
                  {diagnostic.supabaseUrl || '❌ Not set'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-purple-900">Client Initialized:</span>
                <span className={diagnostic.clientInitialized ? 'text-green-600' : 'text-red-600'}>
                  {diagnostic.clientInitialized ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>
          </div>

          {/* Test Query Result */}
          <div className={`mb-6 p-4 rounded-lg ${getStatusColor(diagnostic.testQueryResult)}`}>
            <h2 className="text-lg font-semibold mb-3">
              {getStatusIcon(diagnostic.testQueryResult)} Database Connection Test
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium">Query Status:</span>
                <span className="font-mono uppercase">{diagnostic.testQueryResult}</span>
              </div>
              
              {diagnostic.testQueryError && (
                <div className="mt-3 p-3 bg-white rounded border border-red-200">
                  <div className="font-medium text-red-900 mb-1">Error Details:</div>
                  <pre className="text-xs overflow-x-auto">{diagnostic.testQueryError}</pre>
                </div>
              )}

              {diagnostic.testQueryData && (
                <div className="mt-3 p-3 bg-white rounded border border-green-200">
                  <div className="font-medium text-green-900 mb-1">Query Response:</div>
                  <pre className="text-xs overflow-x-auto">{JSON.stringify(diagnostic.testQueryData, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Troubleshooting Guide */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">🔧 Troubleshooting Steps</h2>
            <div className="space-y-3 text-sm">
              {diagnostic.testQueryResult === 'error' && (
                <>
                  <div className="p-3 bg-yellow-50 rounded">
                    <div className="font-semibold text-yellow-900 mb-2">⚠️ Connection Failed</div>
                    <ul className="list-disc list-inside space-y-1 text-yellow-800">
                      <li>Check Supabase dashboard → Settings → API</li>
                      <li>Verify your custom domain is added to &quot;Allowed Origins&quot;</li>
                      <li>Ensure RLS policies allow public read on courses table</li>
                      <li>Check browser console for CORS errors (F12)</li>
                      <li>Verify Supabase project is not paused</li>
                    </ul>
                  </div>

                  {diagnostic.testQueryError?.includes('cors') || diagnostic.testQueryError?.includes('origin') && (
                    <div className="p-3 bg-red-50 rounded border-2 border-red-300">
                      <div className="font-semibold text-red-900 mb-2">🚨 CORS Issue Detected!</div>
                      <div className="text-red-800 space-y-2">
                        <p><strong>Your custom domain is likely NOT whitelisted in Supabase.</strong></p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>Go to: <code className="bg-white px-1 rounded">supabase.com/dashboard</code></li>
                          <li>Select your project</li>
                          <li>Go to: <strong>Settings → API → URL Configuration</strong></li>
                          <li>Add your domain: <code className="bg-white px-1 rounded">{diagnostic.hostname}</code></li>
                          <li>Save and redeploy your site</li>
                        </ol>
                      </div>
                    </div>
                  )}
                </>
              )}

              {diagnostic.testQueryResult === 'success' && (
                <div className="p-3 bg-green-50 rounded border-2 border-green-300">
                  <div className="font-semibold text-green-900 mb-2">✅ Connection Successful!</div>
                  <p className="text-green-800">
                    Your Supabase connection is working correctly. If you&apos;re still experiencing issues on the courses page,
                    please check the browser console for additional errors.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Browser Console Reminder */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="font-semibold text-blue-900 mb-2">💡 Check Browser Console</div>
            <p className="text-sm text-blue-800">
              Press <kbd className="px-2 py-1 bg-white rounded border border-blue-300 font-mono">F12</kbd> to open 
              Developer Tools and check the Console tab for additional error messages.
            </p>
          </div>

          {/* Timestamp */}
          <div className="mt-6 text-center text-xs text-gray-500">
            Diagnostic run at: {diagnostic.timestamp}
          </div>
        </div>
      </div>
    </div>
  )
}
