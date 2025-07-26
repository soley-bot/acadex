'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function DebugPage() {
  const { user } = useAuth()
  const [dbInfo, setDbInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const [usersResult, coursesResult, quizzesResult, authResult] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact' }),
          supabase.from('courses').select('*', { count: 'exact' }),
          supabase.from('quizzes').select('*', { count: 'exact' }),
          supabase.auth.getUser()
        ])

        // Sample course and quiz for testing
        const sampleCourse = coursesResult.data?.[0]
        const sampleQuiz = quizzesResult.data?.[0]

        setDbInfo({
          users: usersResult.count || 0,
          courses: coursesResult.count || 0,
          quizzes: quizzesResult.count || 0,
          currentUser: user,
          authUser: authResult.data.user,
          dbConnection: 'Connected',
          sampleCourse,
          sampleQuiz,
          errors: {
            users: usersResult.error?.message,
            courses: coursesResult.error?.message,
            quizzes: quizzesResult.error?.message
          }
        })
      } catch (error: any) {
        setDbInfo({
          error: error.message,
          dbConnection: 'Failed'
        })
      } finally {
        setLoading(false)
      }
    }

    checkDatabase()
  }, [user])

  const createTestUser = async () => {
    try {
      const { error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpass123',
        options: {
          data: { name: 'Test User' }
        }
      })
      
      if (error) {
        alert(`Error: ${error.message}`)
      } else {
        alert('Test user created! Check your email for verification.')
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Debug Information</h1>
        
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold tracking-tight mb-4">Database Status</h2>
            <div className="space-y-2">
              <p><strong>Connection:</strong> {dbInfo.dbConnection}</p>
              <p><strong>Users count:</strong> {dbInfo.users}</p>
              <p><strong>Courses count:</strong> {dbInfo.courses}</p>
              <p><strong>Quizzes count:</strong> {dbInfo.quizzes}</p>
              
              {dbInfo.errors && (
                <div className="mt-4 space-y-1">
                  <p className="font-semibold text-destructive">Errors:</p>
                  {dbInfo.errors.users && <p className="text-destructive text-sm">Users: {dbInfo.errors.users}</p>}
                  {dbInfo.errors.courses && <p className="text-destructive text-sm">Courses: {dbInfo.errors.courses}</p>}
                  {dbInfo.errors.quizzes && <p className="text-destructive text-sm">Quizzes: {dbInfo.errors.quizzes}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold tracking-tight mb-4">Authentication</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Auth Context User:</h3>
                {user ? (
                  <div className="space-y-1 text-sm">
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No user in context</p>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Supabase Auth User:</h3>
                {dbInfo.authUser ? (
                  <div className="space-y-1 text-sm">
                    <p><strong>ID:</strong> {dbInfo.authUser.id}</p>
                    <p><strong>Email:</strong> {dbInfo.authUser.email}</p>
                    <p><strong>Confirmed:</strong> {dbInfo.authUser.email_confirmed_at ? 'Yes' : 'No'}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No authenticated user</p>
                )}
              </div>
            </div>
          </div>

          {(dbInfo.sampleCourse || dbInfo.sampleQuiz) && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sample Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dbInfo.sampleCourse && (
                  <div>
                    <h3 className="font-semibold mb-2">Sample Course:</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Title:</strong> {dbInfo.sampleCourse.title}</p>
                      <p><strong>ID:</strong> {dbInfo.sampleCourse.id}</p>
                      <a 
                        href={`/courses/${dbInfo.sampleCourse.id}`}
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        Visit Course Page →
                      </a>
                    </div>
                  </div>
                )}
                
                {dbInfo.sampleQuiz && (
                  <div>
                    <h3 className="font-semibold mb-2">Sample Quiz:</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Title:</strong> {dbInfo.sampleQuiz.title}</p>
                      <p><strong>ID:</strong> {dbInfo.sampleQuiz.id}</p>
                      <a 
                        href={`/quizzes/${dbInfo.sampleQuiz.id}`}  
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        Visit Quiz Page →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Test Actions</h2>
            <div className="space-y-4">
              <button
                onClick={createTestUser}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Test User
              </button>
            </div>
          </div>

          {dbInfo.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-red-900 mb-4">Error</h2>
              <p className="text-red-700">{dbInfo.error}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
