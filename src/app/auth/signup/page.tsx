'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight, AlertTriangle, Sparkles, User, BadgeCheck, Crown, Star } from 'lucide-react'
import { FormField, EmailField, PasswordField } from '@/components/auth/FormField'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BlobBackground } from '@/components/ui/BlobBackground'
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter'

function EnhancedSignupForm() {
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
  const [passwordValid, setPasswordValid] = useState(false)
  const [passwordFieldFocused, setPasswordFieldFocused] = useState(false)
  const [step, setStep] = useState(1) // Multi-step form

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return {
      isValid: emailRegex.test(email),
      message: emailRegex.test(email) ? 'Email looks great!' : 'Please enter a valid email address'
    }
  }

  const validateName = (name: string) => {
    return {
      isValid: name.trim().length >= 2,
      message: name.trim().length >= 2 ? 'Name looks good!' : 'Name must be at least 2 characters'
    }
  }

  const validatePasswordMatch = (password: string, confirmPassword: string) => {
    if (!confirmPassword) return { isValid: false, message: 'Please confirm your password' }
    return {
      isValid: password === confirmPassword,
      message: password === confirmPassword ? 'Passwords match!' : 'Passwords do not match'
    }
  }

  const canProceedToStep2 = () => {
    return formData.name.trim().length >= 2 && validateEmail(formData.email).isValid
  }

  const canSubmit = () => {
    return canProceedToStep2() && 
           passwordValid && 
           validatePasswordMatch(formData.password, formData.confirmPassword).isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 1) {
      if (canProceedToStep2()) {
        setStep(2)
      }
      return
    }

    if (!canSubmit()) {
      setError('Please fill in all fields correctly')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await signUp(formData.email, formData.password, formData.name)
    
    if (error) {
      // Enhanced error messages
      if (error.includes('User already registered')) {
        setError('An account with this email already exists. Try signing in instead.')
      } else if (error.includes('Password should be at least')) {
        setError('Your password doesn\'t meet the minimum requirements. Please choose a stronger password.')
      } else if (error.includes('Invalid email')) {
        setError('Please enter a valid email address.')
      } else {
        setError(error)
      }
      setLoading(false)
    } else {
      // Success - redirect to dashboard
      router.push('/dashboard')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) setError('')
  }

  const benefits = [
    { icon: <BadgeCheck className="w-5 h-5" />, text: "Access to curated English courses" },
    { icon: <BadgeCheck className="w-5 h-5" />, text: "Interactive quizzes and exercises" },
    { icon: <Crown className="w-5 h-5" />, text: "Progress tracking and certificates" },
    { icon: <BadgeCheck className="w-5 h-5" />, text: "Join our growing learning community" }
  ]

  // Password validation summary for display
  const getPasswordValidationSummary = () => {
    if (!formData.password) return null
    
    const requirements = [
      { id: 'length', label: 'At least 8 characters', regex: /.{8,}/ },
      { id: 'uppercase', label: 'One uppercase letter (A-Z)', regex: /[A-Z]/ },
      { id: 'lowercase', label: 'One lowercase letter (a-z)', regex: /[a-z]/ },
      { id: 'number', label: 'One number (0-9)', regex: /\d/ },
      { id: 'special', label: 'One special character (!@#$%^&*)', regex: /[!@#$%^&*(),.?":{}|<>]/ }
    ]

    const metRequirements = requirements.filter(req => req.regex.test(formData.password))
    const unmetRequirements = requirements.filter(req => !req.regex.test(formData.password))
    
    return {
      met: metRequirements,
      unmet: unmetRequirements,
      isValid: metRequirements.length >= 4
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { error: signInError } = await signUp('', '', '', {
        provider: 'google'
      })
      
      if (signInError) {
        setError(signInError.message)
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 flex flex-col py-4 px-4 sm:py-8 sm:px-6 lg:px-8">
      {/* Standardized Background for Auth Pages */}
      <BlobBackground variant="default" />
      
      {/* Main Content Container */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-4xl flex flex-col lg:flex-row gap-4 lg:gap-8 items-start lg:items-center">
        {/* Left Side - Benefits - Hidden on small mobile, visible on tablet+ */}
        <div className="hidden sm:block w-full lg:w-1/2 space-y-4 sm:space-y-6 lg:space-y-8 mb-4 sm:mb-6 lg:mb-0">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary text-white px-3 py-2 sm:px-4 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 shadow-lg">
              <Star className="w-3 h-3 sm:w-4 sm:h-4" />
              New Platform Launch
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 lg:mb-6 leading-tight">
              Start Your English Learning Journey
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-4 sm:mb-6 lg:mb-8 leading-relaxed">
              Master English with interactive courses, real-time feedback, and join our growing community of dedicated learners.
            </p>
          </div>

          <div className="space-y-4 lg:space-y-4">
            {/* Dynamic content based on form state */}
            {error && (
              <div className="alert-error space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-5 h-5" />
                  Sign Up Error
                </div>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Password validation feedback */}
            {step === 2 && formData.password && (
              <div className="alert-info space-y-3">
                <div className="flex items-center gap-2 font-medium">
                  <User className="w-5 h-5" />
                  Password Requirements
                </div>
                {(() => {
                  const validation = getPasswordValidationSummary()
                  if (!validation) return null
                  
                  return (
                    <div className="space-y-2">
                      {validation.isValid ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <BadgeCheck className="w-4 h-4" />
                          <span className="text-sm font-medium">Password meets requirements!</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {validation.unmet.length} requirement{validation.unmet.length === 1 ? '' : 's'} remaining:
                            </span>
                          </div>
                          {validation.unmet.slice(0, 3).map((req, index) => (
                            <div key={req.id} className="text-sm text-gray-600 ml-6">
                              • {req.label}
                            </div>
                          ))}
                          {validation.unmet.length > 3 && (
                            <div className="text-sm text-gray-500 ml-6">
                              +{validation.unmet.length - 3} more...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}

          {/* Default benefits when no errors/validation */}
          {!error && (step === 1 || !formData.password) && benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3 text-gray-900">
              <div className="text-green-600 flex-shrink-0">
                {benefit.icon}
              </div>
              <span className="text-base lg:text-lg">{benefit.text}</span>
            </div>
          ))}
        </div>

        {/* Mobile-only header - visible only on small screens */}
        <div className="sm:hidden w-full mb-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white px-3 py-2 rounded-full text-xs font-medium mb-4 shadow-lg">
              <Star className="w-3 h-3" />
              New Platform Launch
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3 leading-tight">
              Start Learning English
            </h1>
            <p className="text-base text-muted-foreground mb-4 leading-relaxed">
              Be among the first to experience our innovative English learning platform
            </p>
          </div>
        </div>

        {/* Mobile benefits bar */}
        <div className="sm:hidden w-full mb-6">
          <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                100% Free
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                No Credit Card
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                Cancel Anytime
              </div>
            </div>
          </div>
        </div>          <div className="hidden sm:flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              100% Free to Start
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              No Credit Card Required
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              Cancel Anytime
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 lg:max-w-md">
          <Card variant="glass" className="bg-white/80">
            <CardContent className="p-4 sm:p-6 lg:p-8">
            {/* Progress Bar */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2 sm:mb-3">
                <span>Step {step} of 2</span>
                <span>{step === 1 ? 'Basic Info' : 'Secure Password'}</span>
              </div>
              <div className="w-full bg-muted/60 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(step / 2) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Global Error */}
              {error && (
                <div className="alert-error">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Unable to create account</h4>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <>
                  <div className="text-center mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Let&apos;s get started!</h2>
                    <p className="text-muted-foreground text-sm sm:text-base">Tell us a bit about yourself</p>
                  </div>

                  {/* Name Field */}
                  <FormField
                    label="Full Name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    icon={<User className="w-5 h-5" />}
                  />                  {/* Email Field */}
                  <EmailField
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <div className="text-center mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Secure your account</h2>
                    <p className="text-muted-foreground text-sm sm:text-base">Create a strong password to protect your progress</p>
                  </div>

                  {/* Password Field */}
                  <div>
                    <PasswordField
                      label="Create Password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a secure password"
                      required
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                      onFocus={() => setPasswordFieldFocused(true)}
                      onBlur={() => setPasswordFieldFocused(false)}
                    />
                    <PasswordStrengthMeter 
                      password={formData.password}
                      onValidationChange={setPasswordValid}
                      isInputFocused={passwordFieldFocused}
                    />
                  </div>

                  {/* Confirm Password Field */}
                  <PasswordField
                    label="Confirm Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    showPassword={showConfirmPassword}
                    onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                </>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 sm:gap-3">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full bg-muted/40 text-muted-foreground py-3 px-4 rounded-xl font-medium hover:bg-muted/60 transition-colors"
                  >
                    Back
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={loading || (step === 1 && !canProceedToStep2()) || (step === 2 && !canSubmit())}
                  className="btn btn-default btn-lg w-full"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating account...
                    </div>
                  ) : step === 1 ? (
                    <div className="flex items-center justify-center gap-2">
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Create My Account
                    </div>
                  )}
                </button>
              </div>
            </form>

            {/* Google Sign Up */}
            <div className="mt-4 sm:mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="btn btn-outline w-full mt-4"
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

            {/* Terms and Privacy */}
            <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
              <p className="text-center text-xs sm:text-sm text-gray-500 leading-relaxed">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-primary hover:text-red-800">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-primary hover:text-red-800">Privacy Policy</Link>
              </p>
            </div>

            {/* Sign In Link */}
            <div className="mt-4 sm:mt-6">
              <p className="text-center text-gray-900 text-sm sm:text-base">
                Already have an account?{' '}
                <Link 
                  href="/auth/login" 
                  className="text-primary hover:text-red-800 font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  )
}

export default function EnhancedSignupPage() {
  return (
    <div>
      <EnhancedSignupForm />
    </div>
  )
}
