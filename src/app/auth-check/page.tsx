'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthDiagnosticPublicPage() {
  const [authState, setAuthState] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      // 1. Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      // 2. Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      // 3. If we have a user, try to get their profile
      let userProfile = null
      let profileError = null
      
      if (user) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()
          
          userProfile = data
          profileError = error
        } catch (err: any) {
          profileError = err
        }
      }

      setAuthState({
        session: {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          accessToken: session?.access_token ? 'Present' : 'Missing',
          sessionError: sessionError?.message
        },
        user: {
          hasUser: !!user,
          userId: user?.id,
          email: user?.email,
          userError: userError?.message
        },
        profile: {
          hasProfile: !!userProfile,
          role: userProfile?.role,
          name: userProfile?.name,
          profileError: profileError?.message
        }
      })
      
    } catch (error: any) {
      setAuthState({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    // Redirect to login
    window.location.href = '/auth/login?redirectTo=/auth-check'
  }

  const testLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Checking authentication state...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">🔍 Authentication Diagnostic</h1>
          
          {/* Quick Actions */}
          <div className="mb-8 text-center space-x-4">
            <button 
              onClick={checkAuthState}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              🔄 Refresh Check
            </button>
            <button 
              onClick={testLogin}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              🔐 Go to Login
            </button>
            <button 
              onClick={testLogout}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              🚪 Logout
            </button>
          </div>

          {/* Auth State Display */}
          <div className="space-y-6">
            {/* Session Info */}
            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-3 flex items-center">
                📋 Session Information
                {authState.session?.hasSession ? (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm rounded">✅ Active</span>
                ) : (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-sm rounded">❌ None</span>
                )}
              </h2>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{JSON.stringify(authState.session, null, 2)}
              </pre>
            </div>

            {/* User Info */}
            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-3 flex items-center">
                👤 User Information
                {authState.user?.hasUser ? (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm rounded">✅ Found</span>
                ) : (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-sm rounded">❌ Missing</span>
                )}
              </h2>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{JSON.stringify(authState.user, null, 2)}
              </pre>
            </div>

            {/* Profile Info */}
            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-3 flex items-center">
                🏷️ Profile Information
                {authState.profile?.hasProfile ? (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm rounded">✅ Found</span>
                ) : (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-sm rounded">❌ Missing</span>
                )}
                {authState.profile?.role === 'admin' && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">👑 ADMIN</span>
                )}
              </h2>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{JSON.stringify(authState.profile, null, 2)}
              </pre>
            </div>

            {/* Summary & Next Steps */}
            <div className="border rounded-lg p-4 bg-yellow-50">
              <h2 className="text-xl font-semibold mb-3">📝 Diagnosis Summary</h2>
              {authState.session?.hasSession && authState.user?.hasUser && authState.profile?.hasProfile ? (
                authState.profile?.role === 'admin' ? (
                  <div className="text-green-800">
                    ✅ <strong>Everything looks good!</strong> You are authenticated as an admin user.
                    <br />
                    <em>If you&apos;re still getting redirected, there might be an issue with the AuthContext or AdminRoute component.</em>
                  </div>
                ) : (
                  <div className="text-orange-800">
                    ⚠️ <strong>You are logged in but not as admin.</strong> Current role: {authState.profile?.role || 'unknown'}
                    <br />
                    <em>You need admin role to access admin pages.</em>
                  </div>
                )
              ) : (
                <div className="text-red-800">
                  ❌ <strong>Authentication issue detected:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {!authState.session?.hasSession && <li>No active session</li>}
                    {!authState.user?.hasUser && <li>No user found</li>}
                    {!authState.profile?.hasProfile && <li>No user profile in database</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
