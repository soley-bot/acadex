/**
 * Auto-Refresh Hook for Slow Loading Pages
 * Implements 10-second timeout with automatic page refresh
 */

'use client'

import { useEffect, useState } from 'react'

interface AutoRefreshOptions {
  timeoutSeconds?: number
  showWarning?: boolean
  enableAutoRefresh?: boolean
}

export function useAutoRefresh(options: AutoRefreshOptions = {}) {
  const {
    timeoutSeconds = 10,
    showWarning = true,
    enableAutoRefresh = true
  } = options

  const [isSlowLoading, setIsSlowLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [hasRefreshed, setHasRefreshed] = useState(false)

  useEffect(() => {
    // Don't run auto-refresh if we've already refreshed once
    if (hasRefreshed || !enableAutoRefresh) return

    const timeoutId = setTimeout(() => {
      if (showWarning) {
        setIsSlowLoading(true)
        setCountdown(5) // 5 second warning countdown
        
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval)
              // Perform the refresh
              setHasRefreshed(true)
              window.location.reload()
              return 0
            }
            return prev - 1
          })
        }, 1000)

        return () => clearInterval(countdownInterval)
      } else {
        // Immediate refresh without warning
        setHasRefreshed(true)
        window.location.reload()
      }
    }, timeoutSeconds * 1000)

    // Clear timeout if component unmounts or page loads successfully
    return () => clearTimeout(timeoutId)
  }, [timeoutSeconds, showWarning, enableAutoRefresh, hasRefreshed])

  const manualRefresh = () => {
    setHasRefreshed(true)
    window.location.reload()
  }

  const cancelAutoRefresh = () => {
    setIsSlowLoading(false)
    setCountdown(0)
  }

  return {
    isSlowLoading,
    countdown,
    manualRefresh,
    cancelAutoRefresh
  }
}
