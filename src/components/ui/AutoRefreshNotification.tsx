/**
 * Auto-Refresh Notification Component
 * Shows countdown warning before auto-refresh
 */

'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

interface AutoRefreshNotificationProps {
  isVisible: boolean
  countdown: number
  onRefresh: () => void
  onCancel: () => void
}

export function AutoRefreshNotification({ 
  isVisible, 
  countdown, 
  onRefresh, 
  onCancel 
}: AutoRefreshNotificationProps) {
  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-orange-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900">
            Slow Loading Detected
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Page is loading slowly. Auto-refreshing in {countdown} seconds...
          </p>
          <div className="flex space-x-2 mt-3">
            <button
              onClick={onRefresh}
              className="inline-flex items-center space-x-1 text-xs bg-primary text-white px-2 py-1 rounded hover:bg-secondary hover:text-black transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Refresh Now</span>
            </button>
            <button
              onClick={onCancel}
              className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
