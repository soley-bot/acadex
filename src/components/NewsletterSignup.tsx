'use client'

import { useState } from 'react'
import { useHydrationSafe } from '@/hooks/useHydrationSafe'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const mounted = useHydrationSafe()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter signup
    console.log('Newsletter signup:', email)
  }

  // Always render the same structure to prevent hydration mismatch
  return (
    <div className="max-w-lg mx-auto">
      <form onSubmit={mounted ? handleSubmit : (e) => e.preventDefault()}>
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="email" 
            placeholder="Enter your email"
            value={mounted ? email : ''}
            onChange={(e) => mounted && setEmail(e.target.value)}
            className="flex-1 px-4 py-3 sm:px-6 sm:py-4 border border-gray-300 bg-white text-secondary rounded-xl focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 font-medium text-sm sm:text-base"
            autoComplete="email"
            required={mounted}
            suppressHydrationWarning
          />
          <button 
            type={mounted ? "submit" : "button"}
            className="bg-primary hover:bg-secondary text-white hover:text-black px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base whitespace-nowrap"
            suppressHydrationWarning
          >
            Subscribe
          </button>
        </div>
      </form>
    </div>
  )
}
