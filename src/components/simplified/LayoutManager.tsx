// Simplified Layout Manager - Clean separation of concerns
'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AuthErrorUI } from '@/components/ErrorBoundary'

interface LayoutManagerProps {
  children: ReactNode
}

// Simple loading component
function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

// Simple layout type detection
function getLayoutType(pathname: string) {
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname.startsWith('/dashboard')) return 'dashboard'
  if (pathname.startsWith('/auth')) return 'auth'
  if (pathname.includes('/study') || pathname.includes('/take')) return 'fullscreen'
  return 'public'
}

export function LayoutManager({ children }: LayoutManagerProps) {
  const pathname = usePathname()
  const { loading: authLoading, error: authError, retry } = useAuth()

  // Show loading during auth check (only for protected routes)
  const layoutType = getLayoutType(pathname)
  const isProtectedRoute = layoutType === 'dashboard' || layoutType === 'admin'

  // Show auth error UI if there's an error on protected routes
  if (authError && isProtectedRoute) {
    return <AuthErrorUI error={authError} onRetry={retry} />
  }

  if (authLoading && isProtectedRoute) {
    return <LoadingScreen message="Authenticating..." />
  }
  
  // Render based on layout type
  switch (layoutType) {
    case 'admin':
    case 'dashboard':
    case 'fullscreen':
      // These layouts handle their own header/footer internally
      return <>{children}</>
    
    case 'auth':
      // Auth pages (login, signup) don't need header/footer or padding
      return <>{children}</>
      
    case 'public':
    default:
      return (
        <>
          <Header />
          <main className="pt-14">{children}</main>
          <Footer />
        </>
      )
  }
}