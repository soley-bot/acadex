'use client'

import Link from 'next/link'
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
      const mobileMenu = document.querySelector('.mobile-nav')
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
    <header className="header">
      <div className="container">
        <div className="header-left">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-xl md:text-2xl font-primary tracking-tight group-hover:scale-105 transition-transform duration-200">
              <span className="font-light text-black">ACAD</span>
              <span className="font-bold text-red">EX</span>
            </span>
          </Link>
        </div>

        <div className="header-center">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/courses" className="nav-item text-gray-700 hover:text-black transition-colors flex items-center gap-2">
              <SvgIcon icon="book" size={16} />
              Courses
            </Link>
            <Link href="/quizzes" className="nav-item text-gray-700 hover:text-black transition-colors flex items-center gap-2">
              <SvgIcon icon="check" size={16} />
              Quizzes
            </Link>
            <Link href="/about" className="nav-item text-gray-700 hover:text-black transition-colors flex items-center gap-2">
              <SvgIcon icon="info" size={16} />
              About
            </Link>
            <Link href="/contact" className="nav-item text-gray-700 hover:text-black transition-colors flex items-center gap-2">
              <SvgIcon icon="heart" size={16} />
              Contact
            </Link>
          </nav>
        </div>

        <div className="header-right">
          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-24 h-10 bg-gray-200 animate-pulse rounded-md"></div>
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-gray-800 font-medium text-sm">Welcome, {user.name}</span>
                  <svg className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 animate-fade-in">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700 hover:text-black"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <SvgIcon icon="home" size={16} />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700 hover:text-black"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <SvgIcon icon="user" size={16} />
                      Profile
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left text-gray-500 hover:text-red"
                    >
                      <SvgIcon icon="signOut" size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-ghost">
                  Sign In
                </Link>
                <Link href="/signup" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-md hover:bg-gray-50 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <div className="w-6 h-6 relative flex flex-col justify-center items-center">
              <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${
                isMenuOpen 
                  ? 'rotate-45 translate-y-0' 
                  : '-translate-y-1.5'
              }`} />
              <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${
                isMenuOpen 
                  ? 'opacity-0' 
                  : 'opacity-100'
              }`} />
              <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${
                isMenuOpen 
                  ? '-rotate-45 -translate-y-0.5' 
                  : 'translate-y-1.5'
              }`} />
            </div>
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className={`mobile-nav ${isMenuOpen ? 'active' : ''}`}>
        <div className="px-6 py-6">
          <nav className="flex flex-col gap-2">
            <Link 
              href="/courses" 
              className="nav-item flex items-center gap-3"
              onClick={handleMobileNavClick}
            >
              <SvgIcon icon="book" size={16} />
              Courses
            </Link>
            <Link 
              href="/quizzes" 
              className="nav-item flex items-center gap-3"
              onClick={handleMobileNavClick}
            >
              <SvgIcon icon="check" size={16} />
              Quizzes
            </Link>
            <Link 
              href="/about" 
              className="nav-item flex items-center gap-3"
              onClick={handleMobileNavClick}
            >
              <SvgIcon icon="info" size={16} />
              About
            </Link>
            <Link 
              href="/contact" 
              className="nav-item flex items-center gap-3"
              onClick={handleMobileNavClick}
            >
              <SvgIcon icon="heart" size={16} />
              Contact
            </Link>
            
            {/* Mobile Auth Section */}
            <div className="border-t border-gray-100 mt-6 pt-6">
              {user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="nav-item flex items-center gap-3"
                    onClick={handleMobileNavClick}
                  >
                    <SvgIcon icon="home" size={16} />
                    Dashboard
                  </Link>
                  <Link 
                    href="/profile" 
                    className="nav-item flex items-center gap-3"
                    onClick={handleMobileNavClick}
                  >
                    <SvgIcon icon="user" size={16} />
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="nav-item w-full text-left text-red hover:bg-gray-50 flex items-center gap-3"
                  >
                    <SvgIcon icon="signOut" size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="nav-item flex items-center gap-3"
                    onClick={handleMobileNavClick}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/signup" 
                    className="btn-primary mt-4 w-full justify-center"
                    onClick={handleMobileNavClick}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
      
      {/* Mobile Backdrop */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-30 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  )
}
