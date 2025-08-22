'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, ArrowRight, AlertTriangle, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmailField, PasswordField } from '@/components/auth/FormField'

function EnhancedLoginForm() {
  const { signIn, signUp, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Handle redirect if already logged in
  useEffect(() => {
    if (user) {
      // Check for redirect parameter first
      const redirectTo = searchParams.get('redirect') || searchParams.get('redirectTo')
      
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        // Default redirect based on role
        const defaultRedirect = user.role === 'admin' ? '/admin' : '/dashboard'
        router.push(defaultRedirect)
      }
    }
  }, [user, router, searchParams])

  // Don't render the form if user is already logged in
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return {
      isValid: emailRegex.test(email),
      message: emailRegex.test(email) ? 'Valid email address' : 'Please enter a valid email address'
    }
  }

  const validatePassword = (password: string) => {
    return {
      isValid: password.length >= 6,
      message: password.length >= 6 ? 'Password looks good' : 'Password must be at least 6 characters'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Basic validation
    if (!validateEmail(formData.email).isValid) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    if (!validatePassword(formData.password).isValid) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    const { error } = await signIn(formData.email, formData.password)
    
    if (error) {
      // Enhanced error messages
      if (error.includes('Invalid login credentials')) {
        setError('Email or password is incorrect. Please check your credentials and try again.')
      } else if (error.includes('Too many failed attempts')) {
        setError('Too many failed login attempts. Please wait a few minutes before trying again.')
      } else if (error.includes('Email not confirmed')) {
        setError('Please check your email and click the verification link before signing in.')
      } else {
        setError(error)
      }
    }
    
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { error: signInError } = await signUp('', '', '', {
        provider: 'google'
      })
      
      if (signInError) {
        setError(signInError.message || 'Failed to sign in with Google')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-warning/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-secondary/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative w-full max-w-md space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-gray-900 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium mb-4 lg:mb-6 shadow-lg">
            <Sparkles className="w-3 h-3 lg:w-4 lg:h-4" />
            Welcome Back to Acadex
          </div>
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">
            Sign in to your account
          </h1>
          <p className="text-gray-600 text-sm lg:text-lg">
            Continue your learning journey with thousands of students worldwide
          </p>
        </div>

        {/* Form Card */}
        <Card variant="glass" className="bg-white/90">
          <CardContent className="p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            {/* Global Error */}
            {error && (
              <div className="bg-primary/5 border border-red-200 rounded-xl p-3 lg:p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-red-800 font-medium">Unable to sign in</h4>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <EmailField
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
              validation={formData.email ? validateEmail(formData.email) : undefined}
            />

            {/* Password Field */}
            <PasswordField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              validation={formData.password ? validatePassword(formData.password) : undefined}
            />

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-primary hover:text-red-800 font-medium transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary/90 text-gray-900 py-3 px-4 rounded-xl font-medium text-lg shadow-lg hover:from-primary/90 hover:to-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing you in...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </button>
          </form>

          {/* Google Sign In */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Continue with Google'
              )}
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600">
              New to Acadex?{' '}
              <Link 
                href="/auth/signup" 
                className="text-primary hover:text-red-800 font-medium transition-colors"
              >
                Create your free account
              </Link>
            </p>
          </div>

          {/* Additional Features */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-center text-sm text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Free Forever
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              No Credit Card
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:text-red-800">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-primary hover:text-red-800">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}

export default function EnhancedLoginPage() {
  return (
    <div>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }>
        <EnhancedLoginForm />
      </Suspense>
    </div>
  )
}
