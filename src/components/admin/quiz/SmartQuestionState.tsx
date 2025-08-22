import React from 'react'
import { 
  Save, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react'
import { FEATURE_FLAGS } from '@/lib/featureFlags'

export type QuestionState = 
  | 'pristine'    // Unchanged since load
  | 'modified'    // Has unsaved changes
  | 'saving'      // Currently being saved
  | 'saved'       // Successfully saved
  | 'error'       // Save failed
  | 'validating'  // Being validated

interface SmartQuestionStateProps {
  state: QuestionState
  lastSaved?: Date
  isOnline?: boolean
  autoSaveEnabled?: boolean
  onManualSave?: () => void
  errors?: number
}

export function SmartQuestionState({
  state,
  lastSaved,
  isOnline = true,
  autoSaveEnabled = true,
  onManualSave,
  errors = 0
}: SmartQuestionStateProps) {
  if (!FEATURE_FLAGS.SMART_QUESTION_STATES) {
    return null
  }

  const getStateConfig = () => {
    switch (state) {
      case 'pristine':
        return {
          icon: CheckCircle,
          text: 'No changes',
          className: 'text-gray-400',
          showManualSave: false
        }
      case 'modified':
        return {
          icon: Clock,
          text: autoSaveEnabled ? 'Auto-saving...' : 'Unsaved changes',
          className: 'text-yellow-600',
          showManualSave: !autoSaveEnabled
        }
      case 'saving':
        return {
          icon: Loader2,
          text: 'Saving...',
          className: 'text-blue-600',
          showManualSave: false,
          spinning: true
        }
      case 'saved':
        return {
          icon: CheckCircle,
          text: lastSaved ? `Saved ${formatRelativeTime(lastSaved)}` : 'Saved',
          className: 'text-green-600',
          showManualSave: false
        }
      case 'error':
        return {
          icon: AlertTriangle,
          text: 'Save failed',
          className: 'text-red-600',
          showManualSave: true
        }
      case 'validating':
        return {
          icon: Loader2,
          text: 'Validating...',
          className: 'text-blue-600',
          showManualSave: false,
          spinning: true
        }
      default:
        return {
          icon: Clock,
          text: 'Unknown state',
          className: 'text-gray-400',
          showManualSave: false
        }
    }
  }

  const config = getStateConfig()
  const Icon = config.icon

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Connection Status */}
      <div className={`flex items-center gap-1 ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
        {isOnline ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
      </div>

      {/* State Indicator */}
      <div className={`flex items-center gap-1 ${config.className}`}>
        <Icon className={`h-3 w-3 ${config.spinning ? 'animate-spin' : ''}`} />
        <span className="font-medium">{config.text}</span>
      </div>

      {/* Error Count */}
      {errors > 0 && (
        <div className="flex items-center gap-1 text-red-600">
          <AlertTriangle className="h-3 w-3" />
          <span className="font-medium">{errors} error{errors > 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Manual Save Button */}
      {config.showManualSave && onManualSave && (
        <button
          type="button"
          onClick={onManualSave}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          disabled={!isOnline}
        >
          <Save className="h-3 w-3" />
          Save
        </button>
      )}
    </div>
  )
}

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  
  return date.toLocaleDateString()
}

// Hook for managing question state
export function useQuestionState(initialState: QuestionState = 'pristine') {
  const [state, setState] = React.useState<QuestionState>(initialState)
  const [lastSaved, setLastSaved] = React.useState<Date | undefined>()
  const [errors, setErrors] = React.useState(0)

  const updateState = React.useCallback((newState: QuestionState) => {
    setState(newState)
    if (newState === 'saved') {
      setLastSaved(new Date())
    }
  }, [])

  const setErrorCount = React.useCallback((count: number) => {
    setErrors(count)
  }, [])

  return {
    state,
    lastSaved,
    errors,
    updateState,
    setErrorCount
  }
}
