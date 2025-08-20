'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, AlertTriangle, Loader2, Lock } from 'lucide-react'
import { PasswordField } from '@/components/auth/FormField'
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter'
import { supabase } from '@/lib/supabase'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordValid, setPasswordValid] = useState(false)
  const [validatingToken, setValidatingToken] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)

  // Check if we have the required tokens
  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (!accessToken || !refreshToken) {
      setError('Invalid or missing reset link. Please request a new password reset.')
      setValidatingToken(false)
      return
    }

    // Set the session with the tokens from the URL
    const setSession = async () => {
      try {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })
        
        if (error) {
          setError('Reset link has expired or is invalid. Please request a new password reset.')
        } else {
          setTokenValid(true)
        }
      } catch (err) {
        setError('Something went wrong. Please try again.')
      } finally {
        setValidatingToken(false)
      }
    }

    setSession()
  }, [searchParams])

  const validatePasswordMatch = (password: string, confirmPassword: string) => {
    if (!confirmPassword) return { isValid: false, message: 'Please confirm your password' }
    return {
      isValid: password === confirmPassword,
      message: password === confirmPassword ? 'Passwords match!' : 'Passwords do not match'
    }
  }

  const canSubmit = () => {
    return passwordValid && 
           validatePasswordMatch(formData.password, formData.confirmPassword).isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canSubmit()) {
      setError('Please ensure your password meets all requirements and both passwords match')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) {
        if (error.message.includes('New password should be different')) {
          setError('Your new password must be different from your current password.')
        } else if (error.message.includes('Password should be at least')) {
          setError('Your password doesn\'t meet the minimum security requirements.')
        } else {
          setError(error.message)
        }
      } else {
        setSuccess(true)
        // Auto redirect after 3 seconds
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  // Loading state while validating token
  if (validatingToken) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-secondary" />
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-md space-y-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reset Link Invalid</h2>
            <p className="text-gray-600 mb-6">
              {error || 'This password reset link has expired or is invalid.'}
            </p>
            
            <div className="space-y-3">
              <Link
                href="/auth/forgot-password"
                className="block w-full bg-gradient-to-r from-primary/5 via-white to-secondary/5 text-secondary py-3 px-4 rounded-xl font-medium text-center hover:from-primary/90 hover:to-secondary/90 transition-all duration-200"
              >
                Request New Reset Link
              </Link>
              
              <Link
                href="/auth/login"
                className="block w-full bg-muted/40 text-gray-700 py-3 px-4 rounded-xl font-medium text-center hover:bg-muted/60 transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-md space-y-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Password Updated!</h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-700 text-sm">
                Redirecting you to sign in page in 3 seconds...
              </p>
            </div>

            <Link
              href="/auth/login"
              className="block w-full bg-gradient-to-r from-primary/5 via-white to-secondary/5 text-secondary py-3 px-4 rounded-xl font-medium text-center hover:from-primary/90 hover:to-secondary/90 transition-all duration-200"
            >
              Continue to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>
      
      <div className="relative w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Reset Your Password
          </h1>
          <p className="text-gray-600 text-lg">
            Choose a new, secure password for your account.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-primary/5 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-red-800 font-medium">Unable to update password</h4>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* New Password Field */}
            <div>
              <PasswordField
                label="New Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your new password"
                required
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
              <PasswordStrengthMeter 
                password={formData.password}
                onValidationChange={setPasswordValid}
              />
            </div>

            {/* Confirm Password Field */}
            <PasswordField
              label="Confirm New Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your new password"
              required
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              validation={formData.confirmPassword ? validatePasswordMatch(formData.password, formData.confirmPassword) : undefined}
            />

            {/* Security Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-secondary text-sm font-medium mb-2">Password Requirements:</p>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Contains uppercase and lowercase letters</li>
                <li>• Includes at least one number</li>
                <li>• Has at least one special character</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !canSubmit()}
              className="w-full bg-gradient-to-r from-primary/5 via-white to-secondary/5 text-secondary py-3 px-4 rounded-xl font-medium text-lg shadow-lg hover:from-primary/90 hover:to-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating password...
                </div>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-secondary hover:text-secondary">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function ResetPasswordFallback() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-secondary" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
