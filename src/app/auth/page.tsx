'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertTriangle } from 'lucide-react'
import { getSecureRedirect } from '@/lib/redirect-security'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

type TabType = 'signin' | 'signup'

export default function AuthPage() {
  const { signIn, signUp, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>('signup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Sign In form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  // Sign Up form state
  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })

  // Handle redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectTo = searchParams.get('redirect') || searchParams.get('redirectTo')
      const secureRedirect = getSecureRedirect(redirectTo, user.role)
      router.push(secureRedirect)
    }
  }, [user, router, searchParams])

  // Check for tab parameter in URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'signin' || tab === 'signup') {
      setActiveTab(tab)
    }
  }, [searchParams])

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signInError } = await signIn(signInData.email, signInData.password)
    
    if (signInError) {
      setError(signInError.message || 'Failed to sign in')
      setLoading(false)
    }
    // Don't set loading false on success - redirect will happen
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fullName = `${signUpData.firstName} ${signUpData.lastName}`.trim()
    const { error: signUpError } = await signUp(signUpData.email, signUpData.password, fullName)
    
    if (signUpError) {
      setError(signUpError.message || 'Failed to sign up')
      setLoading(false)
    }
    // Don't set loading false on success - redirect will happen
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (oauthError) {
        setError(oauthError.message || 'Failed to authenticate with Google')
        setLoading(false)
      }
      // Don't set loading false - user is being redirected
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google')
      setLoading(false)
    }
  }

  const handleFacebookAuth = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      })
      
      if (oauthError) {
        setError(oauthError.message || 'Failed to authenticate with Facebook')
        setLoading(false)
      }
      // Don't set loading false - user is being redirected
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Facebook')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Gradient Background with Brand Colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary/80" />
      
      {/* Glassmorphism Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/20 backdrop-blur-2xl rounded-[32px] p-8 shadow-2xl border border-white/20">
          {/* Header with Tabs and Close Button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex bg-white/10 backdrop-blur-sm rounded-full p-1">
              <button
                onClick={() => setActiveTab('signup')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === 'signup'
                    ? 'bg-white text-primary shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                Sign up
              </button>
              <button
                onClick={() => setActiveTab('signin')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === 'signin'
                    ? 'bg-white text-primary shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                Sign in
              </button>
            </div>
            <Link 
              href="/" 
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <span className="text-white text-xl">×</span>
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-8">
            {activeTab === 'signup' ? 'Create an account' : 'Welcome back'}
          </h1>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-300/30 rounded-2xl p-4 backdrop-blur-sm mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-white" />
                <p className="text-sm text-white">{error}</p>
              </div>
            </div>
          )}

          {/* Forms Container with Slide Animation */}
          <div className="relative overflow-hidden">
            {/* Sign Up Form */}
            <div
              className={`transition-all duration-500 ease-in-out ${
                activeTab === 'signup'
                  ? 'translate-x-0 opacity-100'
                  : '-translate-x-full opacity-0 absolute inset-0 pointer-events-none'
              }`}
            >
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={signUpData.firstName}
                    onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                    placeholder="First name"
                    required
                    autoComplete="given-name"
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  />
                  <input
                    type="text"
                    value={signUpData.lastName}
                    onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                    placeholder="Last name"
                    autoComplete="family-name"
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  />
                </div>

                {/* Email */}
                <input
                  type="email"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                />

                {/* Password */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  placeholder="Create a password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-primary hover:bg-white/95 font-semibold rounded-2xl py-4 mt-6 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating account...
                    </div>
                  ) : (
                    'Create an account'
                  )}
                </button>
              </form>
            </div>

            {/* Sign In Form */}
            <div
              className={`transition-all duration-500 ease-in-out ${
                activeTab === 'signin'
                  ? 'translate-x-0 opacity-100'
                  : 'translate-x-full opacity-0 absolute inset-0 pointer-events-none'
              }`}
            >
              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Email */}
                <input
                  type="email"
                  value={signInData.email}
                  onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                />

                {/* Password */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                />

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={signInData.rememberMe}
                      onChange={(e) => setSignInData({ ...signInData, rememberMe: e.target.checked })}
                      className="w-4 h-4 rounded bg-white/10 border-white/20"
                    />
                    <span className="text-sm text-white/70">Remember me</span>
                  </label>
                  <Link href="/auth/forgot-password" className="text-sm text-white/70 hover:text-white transition-colors">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-primary hover:bg-white/95 font-semibold rounded-2xl py-4 mt-6 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-white/20" />
            <span className="px-4 text-white/50 text-sm font-medium">
              {activeTab === 'signup' ? 'OR SIGN UP WITH' : 'OR CONTINUE WITH'}
            </span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl h-14 flex items-center justify-center hover:bg-white/20 transition-all disabled:opacity-50"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#FFF" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#FFF" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FFF" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#FFF" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={handleFacebookAuth}
              disabled={loading}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl h-14 flex items-center justify-center hover:bg-white/20 transition-all disabled:opacity-50"
            >
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
          </div>

          {/* Footer Text */}
          <p className="text-center text-white/50 text-sm mt-8">
            By {activeTab === 'signup' ? 'creating an account' : 'signing in'}, you agree to our Terms & Service
          </p>
        </div>
      </div>
    </div>
  )
}
