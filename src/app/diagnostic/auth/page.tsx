'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthDiagnosticPage() {
  const [supabaseStatus, setSupabaseStatus] = useState<string>('checking...')
  const [sessionStatus, setSessionStatus] = useState<string>('checking...')
  const [userQueryStatus, setUserQueryStatus] = useState<string>('checking...')
  const { user, loading } = useAuth()

  useEffect(() => {
    const checkAuth = async () => {
      // Test 1: Check if Supabase client is initialized
      try {
        if (supabase && supabase.auth) {
          setSupabaseStatus('✅ Supabase client initialized')
        } else {
          setSupabaseStatus('❌ Supabase client not initialized')
        }
      } catch (error) {
        setSupabaseStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`)
      }

      // Test 2: Check session
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          setSessionStatus(`❌ Session error: ${error.message}`)
        } else if (data.session) {
          setSessionStatus(`✅ Session found: ${data.session.user.email}`)
        } else {
          setSessionStatus('⚠️ No active session')
        }
      } catch (error) {
        setSessionStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`)
      }

      // Test 3: Try to query users table (will fail with CORS on custom domain)
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, name')
          .limit(1)
        
        if (error) {
          setUserQueryStatus(`❌ User query error: ${error.message}`)
        } else {
          setUserQueryStatus(`✅ User query successful: ${data?.length || 0} records`)
        }
      } catch (error) {
        setUserQueryStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`)
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Auth Diagnostic</h1>
        
        <div className="bg-card p-6 rounded-lg border space-y-4">
          <h2 className="text-xl font-semibold">Environment</h2>
          <div className="space-y-2 text-sm font-mono">
            <div>URL: {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</div>
            <div>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border space-y-4">
          <h2 className="text-xl font-semibold">Supabase Client Tests</h2>
          <div className="space-y-2">
            <div className="p-3 bg-muted rounded">{supabaseStatus}</div>
            <div className="p-3 bg-muted rounded">{sessionStatus}</div>
            <div className="p-3 bg-muted rounded">{userQueryStatus}</div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border space-y-4">
          <h2 className="text-xl font-semibold">AuthContext Status</h2>
          <div className="space-y-2">
            <div className="p-3 bg-muted rounded">Loading: {loading ? 'Yes' : 'No'}</div>
            <div className="p-3 bg-muted rounded">
              User: {user ? `✅ ${user.email} (${user.role})` : '❌ No user'}
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h3 className="font-semibold mb-2">Expected Behavior:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Dev/Vercel:</strong> All tests should pass ✅</li>
            <li><strong>Custom Domain:</strong> User query test will likely fail ❌ (CORS issue)</li>
            <li>If session test fails, auth isn&apos;t working at all</li>
            <li>If AuthContext shows no user despite valid session, there&apos;s a context issue</li>
          </ul>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Browser Console</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Check the browser console (F12) for additional errors. Look for:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>CORS errors</li>
            <li>Network failed errors</li>
            <li>Auth initialization errors</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
