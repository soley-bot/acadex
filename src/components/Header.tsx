'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from './ui/Logo'
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
  Rocket,
  ChevronRight,
  ArrowLeft
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut, loading } = useAuth()
  const pathname = usePathname()
  const sidebarRef = useRef<HTMLElement>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)

  const handleSignOut = async () => {
    await signOut()
    setIsMenuOpen(false)
  }

  const handleMobileNavClick = () => {
    setIsMenuOpen(false)
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Swipe to close functionality
  useEffect(() => {
    if (!isMenuOpen || !sidebarRef.current) return

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      if (!touch) return
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || e.changedTouches.length !== 1) return

      const touch = e.changedTouches[0]
      if (!touch) return
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const deltaTime = Date.now() - touchStartRef.current.time

      // Swipe right to close (horizontal swipe, > 50px, < 300ms)
      if (deltaTime < 300 && deltaX > 50 && Math.abs(deltaY) < 100) {
        setIsMenuOpen(false)
      }

      touchStartRef.current = null
    }

    const sidebar = sidebarRef.current
    sidebar.addEventListener('touchstart', handleTouchStart, { passive: true })
    sidebar.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      sidebar.removeEventListener('touchstart', handleTouchStart)
      sidebar.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMenuOpen])

  return (
    <>
      <header className="header-fixed">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <Logo 
                size="lg" 
                className="group-hover:scale-105 transition-transform duration-200" 
              />
              <span className="text-2xl md:text-3xl font-black tracking-tight group-hover:scale-105 transition-transform duration-200">
                <span className="text-black">ACAD</span>
                <span className="text-[hsl(var(--primary))]">E</span>
                <span className="text-black">X</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-8">
                <Link href="/courses" className="nav-link text-sm md:text-base lg:text-lg">
                  Courses
                </Link>
                <Link href="/quizzes" className="nav-link text-sm md:text-base lg:text-lg">
                  Quizzes
                </Link>
                <Link href="/about" className="nav-link text-sm md:text-base lg:text-lg">
                  About
                </Link>
                <Link href="/contact" className="nav-link text-sm md:text-base lg:text-lg">
                  Contact
                </Link>
              </div>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {loading ? (
                <div className="w-32 h-11 bg-gray-200 animate-pulse rounded-xl"></div>
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-2.5 h-11 hover:border-gray-400 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                      </div>
                      <span className="text-gray-900 font-medium hidden lg:inline">
                        {user.name || 'User'}
                      </span>
                      <ChevronDown size={16} className="text-gray-500 transition-transform duration-200" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-2 mt-2 animate-in fade-in-0 zoom-in-95">
                    {/* User Info Header */}
                    <div className="px-3 py-3 border-b border-gray-100 mb-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{user.name || 'User'}</div>
                          <div className="text-xs text-gray-500 truncate">{user.email}</div>
                        </div>
                      </div>
                      {user.role && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="py-1">
                      {/* Dashboard */}
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full cursor-pointer">
                          <Home size={18} className="flex-shrink-0 text-primary" />
                          <span className="font-medium">Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      {/* Profile */}
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full cursor-pointer">
                          <User size={18} className="flex-shrink-0 text-primary" />
                          <span className="font-medium">Profile</span>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                    
                    {/* Sign Out - Separated */}
                    <div className="pt-1 mt-1 border-t border-gray-100">
                      <DropdownMenuItem 
                        onClick={handleSignOut} 
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full cursor-pointer font-medium"
                      >
                        <ArrowRight size={18} className="flex-shrink-0" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/auth?tab=signin" className="nav-link px-4 py-2 text-sm md:text-base lg:text-lg">
                    Sign In
                  </Link>
                  <Link href="/auth?tab=signup" className="btn-primary transform hover:scale-105">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button - Bedimcode pattern */}
            <div className="md:hidden relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Toggle mobile menu"
              >
                <Menu 
                  size={20} 
                  className={`text-primary transition-all duration-300 ${isMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} 
                />
                <X 
                  size={20} 
                  className={`absolute inset-0 m-auto text-primary transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} 
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Backdrop - Now outside header to cover entire page */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
          style={{ touchAction: 'none' }}
        />
      )}

      {/* Mobile Navigation Menu - 75% Width with Swipe to Close */}
      <aside 
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-screen w-[75vw] sm:w-80 max-w-sm bg-background border-l border-border shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col touch-manipulation`}
      >
          {/* Swipe Handle Indicator */}
          <div className="flex justify-center pt-3 pb-2 md:hidden">
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" 
                 aria-label="Swipe right to close"></div>
          </div>

          {/* Sidebar Header with Close Button */}
          <div className="p-6 border-b border-border relative">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Logo size="lg" />
                <span className="text-xl font-black tracking-tight">
                  <span className="text-black">ACAD</span>
                  <span className="text-[hsl(var(--primary))]">E</span>
                  <span className="text-black">X</span>
                </span>
              </div>
              
              {/* Close Button - Same style as hamburger */}
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary flex-shrink-0"
                aria-label="Close navigation menu"
              >
                <X size={20} className="text-primary" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Navigate your learning journey</p>
          </div>

          {/* Navigation Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 sm:p-4 space-y-1">
              {/* Main Navigation Links */}
              <Link 
                href="/courses" 
                className="w-full p-4 text-left transition-all duration-200 flex items-center gap-3 min-h-[56px] touch-manipulation hover:bg-muted/30 active:bg-muted/50 active:scale-[0.98] rounded-lg font-medium text-foreground"
                onClick={handleMobileNavClick}
              >
                <Book size={20} className="text-primary flex-shrink-0" />
                <span className="flex-1">Courses</span>
              </Link>

              <Link 
                href="/quizzes" 
                className="w-full p-4 text-left transition-all duration-200 flex items-center gap-3 min-h-[56px] touch-manipulation hover:bg-muted/30 active:bg-muted/50 active:scale-[0.98] rounded-lg font-medium text-foreground"
                onClick={handleMobileNavClick}
              >
                <Lightbulb size={20} className="text-primary flex-shrink-0" />
                <span className="flex-1">Quizzes</span>
              </Link>

              <Link 
                href="/about" 
                className="w-full p-4 text-left transition-all duration-200 flex items-center gap-3 min-h-[56px] touch-manipulation hover:bg-muted/30 active:bg-muted/50 active:scale-[0.98] rounded-lg font-medium text-foreground"
                onClick={handleMobileNavClick}
              >
                <Info size={20} className="text-primary flex-shrink-0" />
                <span className="flex-1">About</span>
              </Link>

              <Link 
                href="/contact" 
                className="w-full p-4 text-left transition-all duration-200 flex items-center gap-3 min-h-[56px] touch-manipulation hover:bg-muted/30 active:bg-muted/50 active:scale-[0.98] rounded-lg font-medium text-foreground"
                onClick={handleMobileNavClick}
              >
                <Mail size={20} className="text-primary flex-shrink-0" />
                <span className="flex-1">Contact</span>
              </Link>

              {/* User Section - In Nav List */}
              {user && (
                <>
                  <div className="my-4 border-t border-border"></div>
                  
                  <Link 
                    href="/dashboard" 
                    className="w-full p-4 text-left transition-all duration-200 flex items-center gap-3 min-h-[56px] touch-manipulation hover:bg-muted/30 active:bg-muted/50 active:scale-[0.98] rounded-lg font-medium text-foreground"
                    onClick={handleMobileNavClick}
                  >
                    <Home size={20} className="text-primary flex-shrink-0" />
                    <span className="flex-1">Dashboard</span>
                  </Link>

                  <Link 
                    href="/profile" 
                    className="w-full p-4 text-left transition-all duration-200 flex items-center gap-3 min-h-[56px] touch-manipulation hover:bg-muted/30 active:bg-muted/50 active:scale-[0.98] rounded-lg font-medium text-foreground"
                    onClick={handleMobileNavClick}
                  >
                    <User size={20} className="text-primary flex-shrink-0" />
                    <span className="flex-1">Profile</span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="w-full p-4 text-left transition-all duration-200 flex items-center gap-3 min-h-[56px] touch-manipulation hover:bg-destructive/10 active:bg-destructive/20 active:scale-[0.98] rounded-lg font-medium text-destructive"
                  >
                    <ArrowRight size={20} className="flex-shrink-0" />
                    <span className="flex-1">Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* User Info Footer - Only if Logged In */}
          {user && (
            <div className="border-t border-border p-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{user.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Auth CTAs Footer - Only if Not Logged In */}
          {!user && (
            <div className="border-t border-border p-4 space-y-2">
              <Link
                href="/auth?tab=signin"
                className="w-full flex items-center justify-center px-4 py-3 text-primary bg-transparent hover:bg-primary/10 transition-all duration-300 font-semibold rounded-lg border-2 border-primary active:scale-95"
                onClick={handleMobileNavClick}
              >
                Sign In
              </Link>
              <Link
                href="/auth?tab=signup"
                className="w-full flex items-center justify-center px-4 py-3 bg-primary text-white hover:bg-primary/90 hover:shadow-lg transition-all duration-300 font-semibold rounded-lg active:scale-95"
                onClick={handleMobileNavClick}
              >
                Get Started
              </Link>
            </div>
          )}
        </aside>
    </>
  )
}

