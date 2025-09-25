'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { EmailField } from '@/components/auth/FormField'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return {
      isValid: emailRegex.test(email),
      message: emailRegex.test(email) ? 'Email looks good!' : 'Please enter a valid email address'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateEmail(email).isValid) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        if (error.message.includes('User not found')) {
          setError('No account found with this email address. Please check your email or create a new account.')
        } else {
          setError(error.message)
        }
      } else {
        setSent(true)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) setError('')
  }

  if (sent) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-md space-y-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h2>
            <p className="text-gray-900 mb-6">
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </p>
            
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
              <p className="text-primary text-sm">
                <strong>Next steps:</strong>
              </p>
              <ol className="text-primary text-sm mt-2 list-decimal list-inside space-y-1">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the password reset link</li>
                <li>Create your new password</li>
                <li>Sign in with your new password</li>
              </ol>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setSent(false)
                  setEmail('')
                }}
                className="w-full bg-muted/40 text-gray-900 py-3 px-4 rounded-xl font-medium hover:bg-muted/60 transition-colors"
              >
                Send to different email
              </button>
              
              <Link
                href="/auth/login"
                className="block w-full bg-muted hover:bg-muted/80 text-muted-foreground py-3 px-4 rounded-xl font-medium text-center transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
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
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>
      
      <div className="relative w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Forgot your password?
          </h1>
          <p className="text-gray-900 text-lg">
            No worries! Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-destructive-foreground font-medium">Unable to send reset email</h4>
                    <p className="text-destructive text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <EmailField
              label="Email Address"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your account email"
              required
              validation={email ? validateEmail(email) : undefined}
            />

            {/* Info Box */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-primary text-sm">
                <strong>What happens next?</strong>
              </p>
              <p className="text-primary text-sm mt-1">
                We&apos;ll send you a secure link to reset your password. 
                The link will expire in 1 hour for your security.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !validateEmail(email).isValid}
              className="w-full bg-primary hover:bg-secondary text-white py-3 px-4 rounded-xl font-medium text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending reset email...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-8 pt-6 border-t border-border">
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Still having trouble?{' '}
            <Link href="/contact" className="text-secondary hover:text-secondary">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

