// NAVIGATION LOADING FIX
// Add this to your layout or create a new component

'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function NavigationLoadingFix() {
  const pathname = usePathname()

  useEffect(() => {
    // Clear any stale data when navigating
    const clearStaleData = () => {
      // Clear browser cache for dynamic content
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            if (cacheName.includes('next-data')) {
              caches.delete(cacheName)
            }
          })
        })
      }

      // Clear any component-level cache
      window.dispatchEvent(new CustomEvent('clear-component-cache'))
    }

    // Delay to avoid clearing cache for the current page
    const timeoutId = setTimeout(clearStaleData, 100)

    return () => clearTimeout(timeoutId)
  }, [pathname])

  return null
}

// ADD THIS TO YOUR ROOT LAYOUT.TSX:
/*
import { NavigationLoadingFix } from '@/components/NavigationLoadingFix'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NavigationLoadingFix />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
*/
