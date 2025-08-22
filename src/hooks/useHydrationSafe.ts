import { useEffect, useState } from 'react'

/**
 * Custom hook to prevent hydration mismatches by ensuring components
 * only render interactive/dynamic content after client-side mounting
 */
export function useHydrationSafe() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}
