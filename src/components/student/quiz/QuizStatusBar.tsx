/**
 * Quiz Status Notifications
 * Shows auto-save status, network connectivity, and progress indicators
 */

import React from 'react'
import { CheckCircle, Wifi, WifiOff, Save, AlertTriangle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTime, formatDateTime } from '@/lib/date-utils'

interface SaveStatusProps {
  isAutoSaving: boolean
  lastSaved: Date | null
  hasUnsavedChanges: boolean
  className?: string
}

export function SaveStatus({ isAutoSaving, lastSaved, hasUnsavedChanges, className }: SaveStatusProps) {
  const getStatusText = () => {
    if (isAutoSaving) return 'Saving...'
    if (hasUnsavedChanges) return 'Unsaved changes'
    if (lastSaved) {
      const now = new Date()
      const diffMinutes = Math.floor((now.getTime() - lastSaved.getTime()) / (1000 * 60))
      if (diffMinutes < 1) return 'Saved just now'
      if (diffMinutes === 1) return 'Saved 1 minute ago'
      if (diffMinutes < 60) return `Saved ${diffMinutes} minutes ago`
      return 'Saved over an hour ago'
    }
    return 'Not saved'
  }

  const getStatusIcon = () => {
    if (isAutoSaving) return <Save className="h-3 w-3 animate-spin" />
    if (hasUnsavedChanges) return <AlertTriangle className="h-3 w-3" />
    if (lastSaved) return <CheckCircle className="h-3 w-3" />
    return <Clock className="h-3 w-3" />
  }

  const getStatusColor = () => {
    if (isAutoSaving) return 'text-blue-600'
    if (hasUnsavedChanges) return 'text-yellow-600'
    if (lastSaved) return 'text-green-600'
    return 'text-gray-500'
  }

  return (
    <div className={cn('flex items-center gap-2 text-xs', getStatusColor(), className)}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
    </div>
  )
}

interface NetworkStatusProps {
  isOnline: boolean
  isReconnecting: boolean
  className?: string
}

export function NetworkStatus({ isOnline, isReconnecting, className }: NetworkStatusProps) {
  if (isOnline && !isReconnecting) return null

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium',
      isOnline && isReconnecting 
        ? 'bg-green-50 text-green-700 border border-green-200'
        : 'bg-red-50 text-red-700 border border-red-200',
      className
    )}>
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Reconnected - your progress is safe</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>You&apos;re offline - progress will be saved locally</span>
        </>
      )}
    </div>
  )
}

interface ProgressRestoreNotificationProps {
  onRestore: () => void
  onDiscard: () => void
  lastSaved: Date
  className?: string
}

export function ProgressRestoreNotification({ 
  onRestore, 
  onDiscard, 
  lastSaved, 
  className 
}: ProgressRestoreNotificationProps) {
  // Using formatDateTime from centralized utilities instead of local formatTime

  return (
    <div className={cn(
      'bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 mx-3 sm:mx-0 sm:mb-6',
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Save className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-blue-900 mb-1">Previous Progress Found</h3>
          <p className="text-sm text-blue-700 leading-relaxed">
            We found quiz progress saved {formatDateTime(lastSaved)}. Would you like to continue where you left off?
          </p>
          
          {/* Mobile-optimized buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
            <button
              onClick={onRestore}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 active:scale-95 touch-manipulation shadow-sm hover:shadow-md"
              style={{ touchAction: 'manipulation' }}
            >
              <CheckCircle className="h-4 w-4" />
              Continue Progress
            </button>
            <button
              onClick={onDiscard}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-all duration-200 active:scale-95 touch-manipulation shadow-sm hover:shadow-md"
              style={{ touchAction: 'manipulation' }}
            >
              <AlertTriangle className="h-4 w-4" />
              Start Fresh
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface QuizStatusBarProps {
  isAutoSaving: boolean
  lastSaved: Date | null
  hasUnsavedChanges: boolean
  isOnline: boolean
  isReconnecting: boolean
  currentQuestion: number
  totalQuestions: number
  timeLeft?: number
  className?: string
}

export function QuizStatusBar({
  isAutoSaving,
  lastSaved,
  hasUnsavedChanges,
  isOnline,
  isReconnecting,
  currentQuestion,
  totalQuestions,
  timeLeft,
  className
}: QuizStatusBarProps) {
  // Using formatTime from centralized utilities

  const progressPercentage = (currentQuestion / totalQuestions) * 100
  const isLowTime = timeLeft !== undefined && timeLeft > 0 && timeLeft < 300 // < 5 minutes

  return (
    <div className={cn(
      'sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm',
      className
    )}>
      {/* Mobile-optimized layout */}
      <div className="px-3 sm:px-4 py-2">
        {/* Top row - Progress and time */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium text-gray-900">
              {currentQuestion} / {totalQuestions}
            </span>
            <div className="w-16 sm:w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 hidden sm:inline">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          
          {/* Timer - Enhanced mobile visibility */}
          {timeLeft !== undefined && timeLeft > 0 && (
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs sm:text-sm font-medium',
              isLowTime 
                ? 'bg-red-100 text-red-700 animate-pulse' 
                : 'bg-gray-100 text-gray-700'
            )}>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
              {isLowTime && (
                <span className="text-xs hidden sm:inline ml-1">⚠️</span>
              )}
            </div>
          )}
        </div>

        {/* Bottom row - Status indicators (mobile optimized) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <SaveStatus
              isAutoSaving={isAutoSaving}
              lastSaved={lastSaved}
              hasUnsavedChanges={hasUnsavedChanges}
              className="text-xs"
            />
          </div>
          
          <div className="flex items-center">
            <NetworkStatus 
              isOnline={isOnline} 
              isReconnecting={isReconnecting}
              className="text-xs px-2 py-1"
            />
          </div>
        </div>
      </div>

      {/* Mobile: Low time warning banner */}
      {isLowTime && (
        <div className="lg:hidden bg-red-50 border-t border-red-200 px-3 py-1">
          <p className="text-xs text-red-700 text-center font-medium">
            ⏰ Less than 5 minutes remaining!
          </p>
        </div>
      )}
    </div>
  )
}