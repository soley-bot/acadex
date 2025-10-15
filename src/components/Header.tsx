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
    <header className="header-fixed">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
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
                <DropdownMenuContent align="end" className="w-56 bg-background border border-border rounded-lg shadow-lg py-2">
                  {/* User Info */}
                  <div className="px-4 py-3 text-sm border-b border-border">
                    <div className="font-medium text-foreground">{user.name || 'admin'}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                  </div>
                  
                  <div className="py-1">
                    {/* Dashboard */}
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors w-full">
                        <Home size={16} className="flex-shrink-0" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    {/* Profile */}
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors w-full">
                        <User size={16} className="flex-shrink-0" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    {/* Sign Out */}
                    <DropdownMenuItem 
                      onClick={handleSignOut} 
                      className="flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full"
                    >
                      <ArrowRight size={16} className="flex-shrink-0" />
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

        {/* Mobile Navigation Backdrop - Full Page Transparency */}
        {isMenuOpen && (
          <div 
            className="mobile-menu-backdrop md:hidden transition-all duration-300"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Mobile Navigation Menu */}
        <div 
          className={`mobile-menu md:hidden ${
            isMenuOpen ? 'mobile-menu-open' : 'mobile-menu-closed'
          }`}
        >
          <div className="nav-list bg-white h-full flex flex-col">
            {/* Main Navigation */}
            <div className="flex-1 py-2">
              <Link 
                href="/courses" 
                className="nav-link group flex items-center justify-between px-4 py-3.5 text-gray-700 hover:bg-primary/10 hover:text-primary transition-all duration-300 font-medium border-b border-gray-100 hover:border-primary/20 active:bg-primary/20"
                onClick={handleMobileNavClick}
              >
                <div className="flex items-center gap-3">
                  <Book size={18} className="group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm group-hover:translate-x-1 transition-transform duration-200">Courses</span>
                </div>
                <div className="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>
              <Link 
                href="/quizzes" 
                className="nav-link group flex items-center justify-between px-4 py-3.5 text-gray-700 hover:bg-primary/10 hover:text-primary transition-all duration-300 font-medium border-b border-gray-100 hover:border-primary/20 active:bg-primary/20"
                onClick={handleMobileNavClick}
              >
                <div className="flex items-center gap-3">
                  <Lightbulb size={18} className="group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm group-hover:translate-x-1 transition-transform duration-200">Quizzes</span>
                </div>
                <div className="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>
              <Link 
                href="/about" 
                className="nav-link group flex items-center justify-between px-4 py-3.5 text-gray-700 hover:bg-primary/10 hover:text-primary transition-all duration-300 font-medium border-b border-gray-100 hover:border-primary/20 active:bg-primary/20"
                onClick={handleMobileNavClick}
              >
                <div className="flex items-center gap-3">
                  <Info size={18} className="group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm group-hover:translate-x-1 transition-transform duration-200">About</span>
                </div>
                <div className="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>
              <Link 
                href="/contact" 
                className="nav-link group flex items-center justify-between px-4 py-3.5 text-gray-700 hover:bg-primary/10 hover:text-primary transition-all duration-300 font-medium border-b border-gray-100 hover:border-primary/20 active:bg-primary/20"
                onClick={handleMobileNavClick}
              >
                <div className="flex items-center gap-3">
                  <Mail size={18} className="group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm group-hover:translate-x-1 transition-transform duration-200">Contact</span>
                </div>
                <div className="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>
            </div>
            
            {/* User Section */}
            {user ? (
              <div className="border-t border-gray-200 mt-auto">
                <div className="px-4 py-3 bg-primary/5">
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
                  className="nav-link group flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-primary/10 hover:text-primary transition-all duration-300 font-medium border-b border-gray-100 hover:border-primary/20 active:bg-primary/20"
                  onClick={handleMobileNavClick}
                >
                  <div className="flex items-center gap-3">
                    <Home size={18} className="group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-sm group-hover:translate-x-1 transition-transform duration-200">Dashboard</span>
                  </div>
                  <div className="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </Link>
                <Link 
                  href="/profile" 
                  className="nav-link group flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-primary/10 hover:text-primary transition-all duration-300 font-medium border-b border-gray-100 hover:border-primary/20 active:bg-primary/20"
                  onClick={handleMobileNavClick}
                >
                  <div className="flex items-center gap-3">
                    <User size={18} className="group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-sm group-hover:translate-x-1 transition-transform duration-200">Profile</span>
                  </div>
                  <div className="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="nav-link group w-full flex items-center justify-between px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 font-medium active:bg-red-100"
                >
                  <div className="flex items-center gap-3">
                    <ArrowRight size={18} className="group-hover:scale-110 group-hover:translate-x-1 transition-transform duration-200" />
                    <span className="text-sm group-hover:translate-x-1 transition-transform duration-200">Sign Out</span>
                  </div>
                  <div className="w-2 h-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-200 mt-auto">
                <div className="p-3 space-y-2">
                  <Link
                    href="/auth?tab=signin"
                    className="nav-link group flex items-center justify-center w-full px-4 py-2.5 text-primary hover:bg-primary/10 hover:border-primary/60 transition-all duration-300 font-semibold rounded-lg border border-primary hover:shadow-md active:scale-95"
                    onClick={handleMobileNavClick}
                  >
                    <span className="text-sm group-hover:scale-105 transition-transform duration-200">Sign In</span>
                  </Link>
                  <Link
                    href="/auth?tab=signup"
                    className="nav-link group flex items-center justify-center w-full px-4 py-2.5 bg-primary text-white hover:bg-primary/90 hover:shadow-lg transition-all duration-300 font-semibold rounded-lg active:scale-95"
                    onClick={handleMobileNavClick}
                  >
                    <span className="text-sm group-hover:scale-105 transition-transform duration-200">Get Started</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

