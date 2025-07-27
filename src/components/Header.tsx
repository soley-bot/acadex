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
    <header className="fixed top-0 w-full glass border-b z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-xl md:text-2xl font-inter tracking-tight group-hover:scale-105 transition-transform duration-200">
              <span className="font-light text-black">ACAD</span>
              <span className="font-bold text-[#ff5757]">EX</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/courses" className="nav-link hover:text-brand transition-colors flex items-center gap-2">
              <SvgIcon icon="book" size={16} />
              Courses
            </Link>
            <Link href="/quizzes" className="nav-link hover:text-brand transition-colors flex items-center gap-2">
              <SvgIcon icon="check" size={16} />
              Quizzes
            </Link>
            <Link href="/about" className="nav-link hover:text-brand transition-colors flex items-center gap-2">
              <SvgIcon icon="info" size={16} />
              About
            </Link>
            <Link href="/contact" className="nav-link hover:text-brand transition-colors flex items-center gap-2">
              <SvgIcon icon="heart" size={16} />
              Contact
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {loading ? (
              <div className="w-24 h-10 bg-muted animate-pulse rounded-md"></div>
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 bg-card border rounded-lg px-3 py-2 hover:bg-accent transition-colors"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold text-sm">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-foreground font-medium text-sm">Welcome, {user.name}</span>
                  <svg className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border rounded-lg shadow-lg py-1 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <SvgIcon icon="home" size={16} />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <SvgIcon icon="user" size={16} />
                      Profile
                    </Link>
                    <div className="border-t my-1"></div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors w-full text-left text-muted-foreground hover:text-destructive"
                    >
                      <SvgIcon icon="signOut" size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-ghost hover:text-brand transition-colors inline-flex items-center gap-2">
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : null}
                  Sign In
                </Link>
                <Link href="/signup" className="bg-brand text-brand-foreground hover:bg-brand/90 px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : null}
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Toggle mobile menu"
          >
            <div className="w-6 h-6 relative flex flex-col justify-center items-center">
              <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${
                isMenuOpen 
                  ? 'rotate-45 translate-y-0' 
                  : '-translate-y-1.5'
              }`} />
              <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${
                isMenuOpen 
                  ? 'opacity-0' 
                  : 'opacity-100'
              }`} />
              <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${
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
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
            <div className="mobile-menu fixed top-16 left-0 w-full bg-background border-b shadow-lg z-50 md:hidden animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex flex-col space-y-1">
                  <Link 
                    href="/courses" 
                    className="nav-link justify-start py-3 px-4 rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
                    onClick={handleMobileNavClick}
                  >
                    <SvgIcon icon="book" size={18} />
                    Courses
                  </Link>
                  <Link 
                    href="/quizzes" 
                    className="nav-link justify-start py-3 px-4 rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
                    onClick={handleMobileNavClick}
                  >
                    <SvgIcon icon="check" size={18} />
                    Quizzes
                  </Link>
                  <Link 
                    href="/about" 
                    className="nav-link justify-start py-3 px-4 rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
                    onClick={handleMobileNavClick}
                  >
                    <SvgIcon icon="info" size={18} />
                    About
                  </Link>
                  <Link 
                    href="/contact" 
                    className="nav-link justify-start py-3 px-4 rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
                    onClick={handleMobileNavClick}
                  >
                    <SvgIcon icon="heart" size={18} />
                    Contact
                  </Link>
                  
                  {/* Mobile User Section */}
                  <div className="flex flex-col space-y-2 pt-4 border-t">
                    {loading ? (
                      <div className="w-full h-12 bg-muted animate-pulse rounded-md"></div>
                    ) : user ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 bg-card border rounded-lg px-4 py-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground font-semibold">{user.name?.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="text-foreground font-medium">Welcome, {user.name}</span>
                        </div>
                        <Link 
                          href="/dashboard" 
                          className="nav-link justify-start w-full py-3 px-4 rounded-lg hover:bg-accent transition-colors" 
                          onClick={handleMobileNavClick}
                        >
                          Dashboard
                        </Link>
                        <Link 
                          href="/profile" 
                          className="nav-link justify-start w-full py-3 px-4 rounded-lg hover:bg-accent transition-colors" 
                          onClick={handleMobileNavClick}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="btn-secondary w-full py-3 justify-center"
                        >
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Link 
                          href="/login" 
                          className="btn-outline w-full justify-center py-3"
                          onClick={handleMobileNavClick}
                        >
                          Sign In
                        </Link>
                        <Link 
                          href="/signup" 
                          className="btn-default w-full justify-center py-3"
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
