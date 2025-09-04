/**
 * Debug component for monitoring auto-refresh behavior
 * Remove this in production
 */

'use client'

import { useEffect, useState } from 'react'

interface AutoRefreshDebugProps {
  isSlowLoading: boolean
  countdown: number
  enabled: boolean
}

export function AutoRefreshDebug({ isSlowLoading, countdown, enabled }: AutoRefreshDebugProps) {
  const [refreshFlag, setRefreshFlag] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRefreshFlag(sessionStorage.getItem('auto-refresh-executed'))
    }
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div>Auto-Refresh Debug:</div>
      <div>Enabled: {enabled ? 'Yes' : 'No'}</div>
      <div>Slow Loading: {isSlowLoading ? 'Yes' : 'No'}</div>
      <div>Countdown: {countdown}</div>
      <div>Refresh Flag: {refreshFlag || 'None'}</div>
    </div>
  )
}
