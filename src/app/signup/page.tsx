'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const { signUp } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    const { error } = await signUp(formData.email, formData.password, formData.name)
    
    if (error) {
      setError(error.message)
    } else {
      router.push('/')
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
    <div className="relative min-h-screen bg-background flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 pt-32">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
      
      <div className="relative w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-2 rounded-full text-base font-medium mb-8 border border-brand/20">
            Join 10,000+ Students
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
            Start Learning Today
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Create your free account in under 30 seconds
          </p>
          <p className="text-lg text-muted-foreground">
            No credit card required • Cancel anytime
          </p>
        </div>

        <div className="card p-8 shadow-lg border backdrop-blur-sm bg-card/95">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <p className="text-destructive text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-base font-medium text-foreground mb-3">
                  <div className="flex items-center gap-2">
                    Full Name
                  </div>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-base font-medium text-foreground mb-3">
                  <div className="flex items-center gap-2">
                    Email Address
                  </div>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-base font-medium text-foreground mb-3">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/icons8/icons8-lock-100.png"
                      alt="Lock"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                    Create Password
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="input pr-12"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                  <Image
                    src="/icons8/icons8-info-100.png"
                    alt="Info"
                    width={12}
                    height={12}
                    className="w-3 h-3"
                  />
                  Must be at least 6 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-base font-medium text-foreground mb-3">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/icons8/icons8-padlock-100.png"
                      alt="Shield"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                    Confirm Password
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="input pr-12"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-lg font-semibold"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-brand-foreground/30 border-t-brand-foreground rounded-full animate-spin"></div>
                    Creating your account...
                  </div>
                ) : (
                  <span>Start Learning Now</span>
                )}
              </button>

              {/* Benefits Section */}
              <div className="mt-6 p-4 bg-brand/5 rounded-lg border border-brand/20">
                <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Image
                    src="/icons8/icons8-done-100.png"
                    alt="Star"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                  What you&apos;ll get:
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Image
                      src="/icons8/icons8-checkmark-100.png"
                      alt="Check"
                      width={16}
                      height={16}
                      className="w-4 h-4 text-green-600"
                    />
                    Access to all courses and quizzes
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Image
                      src="/icons8/icons8-checkmark-100.png"
                      alt="Check"
                      width={16}
                      height={16}
                      className="w-4 h-4 text-green-600"
                    />
                    Track your learning progress
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Image
                      src="/icons8/icons8-checkmark-100.png"
                      alt="Check"
                      width={16}
                      height={16}
                      className="w-4 h-4 text-green-600"
                    />
                    Get certificates of completion
                  </div>
                </div>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t">
              <p className="text-center text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-brand hover:text-brand/80 font-medium transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
    </div>
  )
}
