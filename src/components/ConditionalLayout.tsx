'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import { Footer } from '@/components/Footer'
import { GlobalMobileNav } from '@/components/GlobalMobileNav'

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith('/admin')
  const isCourseStudyRoute = pathname.includes('/courses/') && pathname.endsWith('/study')
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname === '/progress' || pathname === '/profile'
  const isQuizTakingRoute = pathname.includes('/quizzes/') && pathname.endsWith('/take')

  if (isAdminRoute || isCourseStudyRoute || isDashboardRoute || isQuizTakingRoute) {
    return (
      <>
        {children}
        <GlobalMobileNav />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-4">
          {children}
        </main>
        <Footer />
      </div>
      <GlobalMobileNav />
    </>
  )
}
