'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function CreateAdminPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const createAdminUser = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'admin01@acadex.com',
        password: 'admin123',
        options: {
          data: { name: 'Admin User' }
        }
      })

      if (authError) {
        setError(`Auth error: ${authError.message}`)
        setLoading(false)
        return
      }

      // Step 2: Update user role in database
      if (authData.user) {
        const { error: updateError } = await supabase
          .from('users')
          .upsert({
            id: authData.user.id,
            email: 'admin01@acadex.com',
            name: 'Admin User',
            role: 'admin'
          })

        if (updateError) {
          setError(`Database error: ${updateError.message}`)
        } else {
          setMessage('✅ Admin user created successfully!\n\nCredentials:\nEmail: admin01@acadex.com\nPassword: admin123')
        }
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Create Admin User
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 text-sm mb-4">
            This will create an admin user for testing the admin panel.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-blue-900 mb-2">Admin Credentials:</h3>
            <p className="text-sm text-secondary">Email: admin01@acadex.com</p>
            <p className="text-sm text-secondary">Password: admin123</p>
          </div>
        </div>

        {error && (
          <div className="bg-primary/5 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm whitespace-pre-line">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 text-sm whitespace-pre-line">{message}</p>
          </div>
        )}

        <button
          onClick={createAdminUser}
          disabled={loading}
          className="w-full bg-secondary hover:bg-secondary/90 disabled:opacity-50 text-secondary-foreground font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Creating Admin User...' : 'Create Admin User'}
        </button>

        <div className="mt-6 text-center">
          <a 
            href="/login" 
            className="text-secondary hover:text-blue-700 text-sm"
          >
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  )
}
