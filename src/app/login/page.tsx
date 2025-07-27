'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const { signIn, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Get redirect parameter
  const redirect = searchParams.get('redirect')

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectTo = redirect || (user.role === 'admin' ? '/admin' : '/dashboard')
      router.push(redirectTo)
    }
  }, [user, redirect, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(formData.email, formData.password)
    
    if (error) {
      setError(error.message)
    } else {
      // Redirect will be handled by the useEffect above
      // But we can also handle it here for immediate response
      const redirectTo = redirect || '/dashboard'
      router.push(redirectTo)
    }
    
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
      
      <div className="relative w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-3 py-1.5 rounded-full text-sm font-medium mb-6 border border-brand/20">
            <span className="w-2 h-2 bg-brand rounded-full"></span>
            Welcome Back
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-4">
            Sign in to your account
          </h1>
          <p className="text-muted-foreground">
            Continue your learning journey with Acadex
          </p>
        </div>

        <div className="card p-8 shadow-lg border backdrop-blur-sm bg-card/95">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/icons8/icons8-cancel-100.png"
                      alt="Error"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                    <p className="text-destructive text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-brand text-brand-foreground hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors duration-200 w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-brand-foreground/30 border-t-brand-foreground rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Sign In</span>
                    <Image
                      src="/icons8/icons8-user-100.png"
                      alt="Login"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                  </div>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t">
              <p className="text-center text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-brand hover:text-brand/80 font-medium transition-colors">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
