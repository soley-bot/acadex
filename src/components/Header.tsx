'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ChevronDown, 
  Home, 
  User, 
  ArrowRight, 
  Menu, 
  X, 
  Book, 
  Lightbulb, 
  Info, 
  Mail, 
  Rocket 
} from 'lucide-react'

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
    <header className="fixed top-0 w-full backdrop-blur-lg bg-white/80 border-b border-white/20 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-2xl md:text-3xl font-black tracking-tight group-hover:scale-105 transition-transform duration-200">
              <span className="text-black">ACAD</span>
              <span className="text-[hsl(var(--primary))]">E</span>
              <span className="text-black">X</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/courses" className="text-gray-800 hover:text-primary font-bold transition-colors duration-200 text-lg">
              Courses
            </Link>
            <Link href="/quizzes" className="text-gray-800 hover:text-primary font-bold transition-colors duration-200 text-lg">
              Quizzes
            </Link>
            <Link href="/about" className="text-gray-800 hover:text-primary font-bold transition-colors duration-200 text-lg">
              About
            </Link>
            <Link href="/contact" className="text-gray-800 hover:text-primary font-bold transition-colors duration-200 text-lg">
              Contact
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-24 h-10 bg-muted/60 animate-pulse rounded-lg"></div>
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 backdrop-blur-lg bg-white/60 border border-white/30 rounded-xl px-4 py-2 hover:bg-white/80 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-gray-900 font-bold text-sm">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-gray-800 font-bold">Welcome, {user.name}</span>
                  <div className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} className="text-gray-500" />
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 backdrop-blur-lg bg-white/90 border border-white/30 rounded-2xl shadow-2xl py-2 z-50">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors text-gray-800 font-medium"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Home size={16} />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors text-gray-800 font-medium"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors w-full text-left text-gray-600 hover:text-primary font-medium"
                    >
                      <ArrowRight size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-800 hover:text-primary font-bold transition-colors duration-200 px-4 py-2 text-lg">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="bg-primary hover:bg-secondary text-white hover:text-black px-6 py-2 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-white/60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur-sm bg-white/40 border border-white/30"
            aria-label="Toggle mobile menu"
          >
            <div className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`}>
              {isMenuOpen ? <X size={24} className="text-primary" /> : <Menu size={24} className="text-primary" />}
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
            <div className="mobile-menu fixed top-16 left-0 w-full backdrop-blur-lg bg-white/95 border-b border-white/30 shadow-2xl z-50 md:hidden">
              <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex flex-col space-y-1">
                  <Link 
                    href="/courses" 
                    className="text-gray-800 hover:text-primary hover:bg-primary/5 py-4 px-6 rounded-xl font-bold transition-all duration-300 text-lg flex items-center gap-3"
                    onClick={handleMobileNavClick}
                  >
                    <Book size={20} />
                    Courses
                  </Link>
                  <Link 
                    href="/quizzes" 
                    className="text-gray-800 hover:text-primary hover:bg-primary/5 py-4 px-6 rounded-xl font-bold transition-all duration-300 text-lg flex items-center gap-3"
                    onClick={handleMobileNavClick}
                  >
                    <Lightbulb size={20} />
                    Quizzes
                  </Link>
                  <Link 
                    href="/about" 
                    className="text-gray-800 hover:text-primary hover:bg-primary/5 py-4 px-6 rounded-xl font-bold transition-all duration-300 text-lg flex items-center gap-3"
                    onClick={handleMobileNavClick}
                  >
                    <Info size={20} />
                    About
                  </Link>
                  <Link 
                    href="/contact" 
                    className="text-gray-800 hover:text-primary hover:bg-primary/5 py-4 px-6 rounded-xl font-bold transition-all duration-300 text-lg flex items-center gap-3"
                    onClick={handleMobileNavClick}
                  >
                    <Mail size={20} />
                    Contact
                  </Link>
                  
                  {/* Mobile User Section */}
                  <div className="flex flex-col space-y-2 pt-4 mt-4 border-t border-gray-200">
                    {loading ? (
                      <div className="w-full h-14 bg-muted/60 animate-pulse rounded-xl"></div>
                    ) : user ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 backdrop-blur-sm bg-white/80 border border-white/40 rounded-xl px-4 py-3 shadow-lg">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-gray-900 font-bold text-sm">{user.name?.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="text-gray-800 font-bold text-lg">Welcome, {user.name}</span>
                        </div>
                        <Link 
                          href="/dashboard" 
                          className="text-gray-800 hover:text-primary hover:bg-primary/5 py-4 px-6 rounded-xl font-bold transition-all duration-300 w-full text-left block text-lg flex items-center gap-3" 
                          onClick={handleMobileNavClick}
                        >
                          <Home size={20} />
                          Dashboard
                        </Link>
                        <Link 
                          href="/profile" 
                          className="text-gray-800 hover:text-primary hover:bg-primary/5 py-4 px-6 rounded-xl font-bold transition-all duration-300 w-full text-left block text-lg flex items-center gap-3" 
                          onClick={handleMobileNavClick}
                        >
                          <User size={20} />
                          Profile
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="backdrop-blur-sm bg-white/80 text-gray-700 hover:bg-primary/5 hover:text-primary px-6 py-4 rounded-xl font-bold transition-all duration-300 w-full border border-white/40 text-lg flex items-center gap-3"
                        >
                          <ArrowRight size={20} />
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Link 
                          href="/auth/login" 
                          className="border-2 border-primary bg-white/90 hover:bg-primary/5 text-primary px-6 py-4 rounded-xl font-bold transition-all duration-300 w-full text-center block text-lg flex items-center justify-center gap-3"
                          onClick={handleMobileNavClick}
                        >
                          <User size={20} />
                          Sign In
                        </Link>
                        <Link
                          href="/auth/signup"
                          className="bg-primary hover:bg-secondary text-white hover:text-black px-6 py-4 rounded-xl font-bold transition-all duration-300 w-full text-center block shadow-lg text-lg flex items-center justify-center gap-3"
                          onClick={handleMobileNavClick}
                        >
                          <Rocket size={20} />
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
