/**
 * Quiz Status Notifications
 * Shows auto-save status, network connectivity, and progress indicators
 */

import React from 'react'
import { CheckCircle, Wifi, WifiOff, Save, AlertTriangle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
    }
    
    const diffHours = Math.floor(diffMinutes / 60)
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }

  return (
    <div className={cn(
      'bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6',
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Save className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900">Previous Progress Found</h3>
          <p className="text-sm text-blue-700 mt-1">
            We found quiz progress saved {formatTime(lastSaved)}. Would you like to continue where you left off?
          </p>
          <div className="flex gap-3 mt-3">
            <button
              onClick={onRestore}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
            >
              Continue Progress
            </button>
            <button
              onClick={onDiscard}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
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
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={cn(
      'flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm',
      className
    )}>
      <div className="flex items-center gap-4">
        <div className="text-gray-600">
          Question {currentQuestion} of {totalQuestions}
        </div>
        <div className="h-4 border-l border-gray-300" />
        <SaveStatus
          isAutoSaving={isAutoSaving}
          lastSaved={lastSaved}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      </div>
      
      <div className="flex items-center gap-4">
        <NetworkStatus isOnline={isOnline} isReconnecting={isReconnecting} />
        {timeLeft !== undefined && timeLeft > 0 && (
          <div className={cn(
            'flex items-center gap-1',
            timeLeft < 300 ? 'text-red-600' : 'text-gray-600' // Red when < 5 minutes
          )}>
            <Clock className="h-3 w-3" />
            <span className="font-mono">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>
    </div>
  )
}