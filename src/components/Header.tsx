'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SvgIcon from '@/components/ui/SvgIcon'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, signOut, loading } = useAuth()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
  }

  const handleMobileNavClick = () => {
    setIsMenuOpen(false)
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
  }, [pathname])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

    // Handle click outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const target = event.target as Node
      const mobileMenu = document.querySelector('.mobile-menu')
      const mobileMenuButton = document.querySelector('[aria-label="Toggle mobile menu"]')
      
      if (isMenuOpen && 
          mobileMenu && 
          !mobileMenu.contains(target) && 
          mobileMenuButton && 
          !mobileMenuButton.contains(target)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <header className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-2xl md:text-3xl font-black tracking-tight group-hover:scale-105 transition-transform duration-200">
              <span className="text-black">ACAD</span>
              <span className="text-red-600">E</span>
              <span className="text-black">X</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/courses" className="text-foreground hover:text-primary font-medium transition-colors duration-200 text-lg">
              Courses
            </Link>
            <Link href="/quizzes" className="text-foreground hover:text-primary font-medium transition-colors duration-200 text-lg">
              Quizzes
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary font-medium transition-colors duration-200 text-lg">
              About
            </Link>
            <Link href="/contact" className="text-foreground hover:text-primary font-medium transition-colors duration-200 text-lg">
              Contact
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-24 h-10 bg-muted animate-pulse rounded-lg"></div>
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 bg-background border border-border rounded-lg px-4 py-2 hover:bg-muted transition-colors shadow-sm"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-foreground font-medium">Welcome, {user.name}</span>
                  <svg className={`w-4 h-4 transition-transform text-muted-foreground ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-xl py-1 z-50">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-foreground"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-foreground"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </Link>
                    <div className="border-t border-border my-1"></div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-destructive/10 transition-colors w-full text-left text-muted-foreground hover:text-destructive"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="text-foreground hover:text-primary font-medium transition-colors duration-200 px-4 py-2 text-lg">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Toggle mobile menu"
          >
            <div className="w-6 h-6 relative flex flex-col justify-center items-center">
              <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${
                isMenuOpen 
                  ? 'rotate-45 translate-y-0' 
                  : '-translate-y-1.5'
              }`} />
              <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${
                isMenuOpen 
                  ? 'opacity-0' 
                  : 'opacity-100'
              }`} />
              <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${
                isMenuOpen 
                  ? '-rotate-45 -translate-y-0.5' 
                  : 'translate-y-1.5'
              }`} />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
            <div className="mobile-menu fixed top-16 left-0 w-full bg-background border-b border-border shadow-xl z-50 md:hidden">
              <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex flex-col space-y-2">
                  <Link 
                    href="/courses" 
                    className="text-foreground hover:text-primary hover:bg-muted py-4 px-4 rounded-lg font-medium transition-colors text-lg"
                    onClick={handleMobileNavClick}
                  >
                    Courses
                  </Link>
                  <Link 
                    href="/quizzes" 
                    className="text-foreground hover:text-primary hover:bg-muted py-4 px-4 rounded-lg font-medium transition-colors text-lg"
                    onClick={handleMobileNavClick}
                  >
                    Quizzes
                  </Link>
                  <Link 
                    href="/about" 
                    className="text-foreground hover:text-primary hover:bg-muted py-4 px-4 rounded-lg font-medium transition-colors text-lg"
                    onClick={handleMobileNavClick}
                  >
                    About
                  </Link>
                  <Link 
                    href="/contact" 
                    className="text-foreground hover:text-primary hover:bg-muted py-4 px-4 rounded-lg font-medium transition-colors text-lg"
                    onClick={handleMobileNavClick}
                  >
                    Contact
                  </Link>
                  
                  {/* Mobile User Section */}
                  <div className="flex flex-col space-y-3 pt-6 border-t border-border">
                    {loading ? (
                      <div className="w-full h-12 bg-muted animate-pulse rounded-lg"></div>
                    ) : user ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 bg-muted border border-border rounded-lg px-4 py-4">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="text-foreground font-medium">Welcome, {user.name}</span>
                        </div>
                        <Link 
                          href="/dashboard" 
                          className="text-foreground hover:text-primary hover:bg-muted py-3 px-4 rounded-lg font-medium transition-colors w-full text-left block" 
                          onClick={handleMobileNavClick}
                        >
                          Dashboard
                        </Link>
                        <Link 
                          href="/profile" 
                          className="text-foreground hover:text-primary hover:bg-muted py-3 px-4 rounded-lg font-medium transition-colors w-full text-left block" 
                          onClick={handleMobileNavClick}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive px-4 py-3 rounded-lg font-medium transition-colors w-full"
                        >
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Link 
                          href="/auth/login" 
                          className="border-2 border-primary bg-background hover:bg-primary/10 text-primary px-4 py-3 rounded-lg font-semibold transition-colors w-full text-center block"
                          onClick={handleMobileNavClick}
                        >
                          Sign In
                        </Link>
                        <Link 
                          href="/auth/signup" 
                          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 rounded-lg font-semibold transition-colors w-full text-center block shadow-lg"
                          onClick={handleMobileNavClick}
                        >
                          Get Started
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
