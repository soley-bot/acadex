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

  return (
    <header className="fixed top-0 w-full bg-white/90 border-b border-gray-200/50 z-50 shadow-sm">
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
          <nav className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-8">
              <Link href="/courses" className="text-foreground hover:text-primary font-bold transition-colors duration-200 text-sm md:text-base lg:text-lg">
                Courses
              </Link>
              <Link href="/quizzes" className="text-foreground hover:text-primary font-bold transition-colors duration-200 text-sm md:text-base lg:text-lg">
                Quizzes
              </Link>
              <Link href="/about" className="text-foreground hover:text-primary font-bold transition-colors duration-200 text-sm md:text-base lg:text-lg">
                About
              </Link>
              <Link href="/contact" className="text-foreground hover:text-primary font-bold transition-colors duration-200 text-sm md:text-base lg:text-lg">
                Contact
              </Link>
            </div>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-24 h-10 bg-muted/60 animate-pulse rounded-lg"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-3 bg-white/80 border border-gray-200 rounded-xl px-4 py-2 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{user.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-foreground font-bold">Welcome, {user.name}</span>
                    <ChevronDown size={16} className="text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-2">
                  <div className="px-2 py-1 mb-2">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user.name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator className="mb-2" />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-primary/10 hover:text-primary transition-colors duration-200">
                      <Home size={18} />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-primary/10 hover:text-primary transition-colors duration-200">
                      <User size={18} />
                      <span className="font-medium">Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors duration-200 cursor-pointer"
                  >
                    <ArrowRight size={18} />
                    <span className="font-medium">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth/login" className="text-foreground hover:text-primary font-bold transition-colors duration-200 px-4 py-2 text-sm md:text-base lg:text-lg">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="bg-primary hover:bg-secondary text-white hover:text-black px-6 py-2 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button - Bedimcode pattern */}
          <div className="md:hidden relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`nav-toggle relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${isMenuOpen ? 'show-icon' : ''}`}
              aria-label="Toggle mobile menu"
            >
              <Menu size={20} className="nav-burger absolute inset-0 m-auto text-primary transition-all duration-300" />
              <X size={20} className="nav-close absolute inset-0 m-auto text-primary transition-all duration-300 opacity-0" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Bedimcode inspired with better CSS */}
        <div 
          className={`nav-menu fixed left-0 top-16 w-full h-[calc(100vh-4rem)] bg-white shadow-2xl z-40 overflow-auto transition-all duration-300 md:hidden ${isMenuOpen ? 'show-menu' : ''}`}
        >
          <div className="nav-list bg-white">
            {/* Main Navigation */}
            <div className="p-1"></div>
                            <Link 
              href="/courses" 
              className="nav-link flex items-center gap-3 px-6 py-4 text-gray-700 hover:bg-primary/5 hover:text-primary transition-all duration-200 font-medium border-b border-gray-100"
              onClick={handleMobileNavClick}
            >
              <Book size={20} />
              <span>Courses</span>
            </Link>
            <Link 
              href="/quizzes" 
              className="nav-link flex items-center gap-3 px-6 py-4 text-gray-700 hover:bg-primary/5 hover:text-primary transition-all duration-200 font-medium border-b border-gray-100"
              onClick={handleMobileNavClick}
            >
              <Lightbulb size={20} />
              <span>Quizzes</span>
            </Link>
            <Link 
              href="/about" 
              className="nav-link flex items-center gap-3 px-6 py-4 text-gray-700 hover:bg-primary/5 hover:text-primary transition-all duration-200 font-medium border-b border-gray-100"
              onClick={handleMobileNavClick}
            >
              <Info size={20} />
              <span>About</span>
            </Link>
            <Link 
              href="/contact" 
              className="nav-link flex items-center gap-3 px-6 py-4 text-gray-700 hover:bg-primary/5 hover:text-primary transition-all duration-200 font-medium border-b border-gray-100"
              onClick={handleMobileNavClick}
            >
              <Mail size={20} />
              <span>Contact</span>
            </Link>
            
            {/* User Section */}
            {user ? (
              <>
                <div className="border-t-4 border-primary/10 my-2"></div>
                <div className="px-4 py-3 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{user.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Welcome back!</p>
                      <p className="text-xs text-gray-600">{user.name}</p>
                    </div>
                  </div>
                </div>
                <Link 
                  href="/dashboard" 
                  className="nav-link flex items-center gap-3 px-6 py-4 text-gray-700 hover:bg-primary/5 hover:text-primary transition-all duration-200 font-medium border-b border-gray-100"
                  onClick={handleMobileNavClick}
                >
                  <Home size={20} />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  href="/profile" 
                  className="nav-link flex items-center gap-3 px-6 py-4 text-gray-700 hover:bg-primary/5 hover:text-primary transition-all duration-200 font-medium border-b border-gray-100"
                  onClick={handleMobileNavClick}
                >
                  <User size={20} />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="nav-link w-full flex items-center gap-3 px-6 py-4 text-red-600 hover:bg-red-50 transition-all duration-200 font-medium border-b border-gray-100"
                >
                  <ArrowRight size={20} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <div className="border-t-4 border-primary/10 my-2"></div>
                <Link
                  href="/auth/login"
                  className="nav-link flex items-center gap-3 px-6 py-4 text-primary hover:bg-primary/5 transition-all duration-200 font-semibold border-b border-gray-100"
                  onClick={handleMobileNavClick}
                >
                  <User size={20} />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/auth/signup"
                  className="nav-link flex items-center gap-3 px-6 py-4 bg-primary text-white hover:bg-primary/90 transition-all duration-200 font-semibold"
                  onClick={handleMobileNavClick}
                >
                  <Rocket size={20} />
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
