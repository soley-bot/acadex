/**
 * Centralized date and time formatting utilities
 * Consolidates duplicate formatting logic found across the codebase
 */

/**
 * Format ISO date string to localized date
 * @param dateString ISO date string (2024-01-15T10:30:00Z)
 * @returns Formatted date string (1/15/2024)
 */
export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString()
  } catch (error: any) {
    console.warn('Invalid date format:', dateString)
    return 'Invalid date'
  }
}

/**
 * Format seconds into MM:SS or HH:MM:SS format
 * @param seconds Number of seconds
 * @returns Formatted time string
 */
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '00:00'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}

/**
 * Format minutes into human-readable time spent
 * @param minutes Number of minutes
 * @returns Human-readable time (e.g., "2h 30m", "45m", "0m")
 */
export const formatTimeSpent = (minutes: number): string => {
  if (isNaN(minutes) || minutes < 0) return '0m'
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.floor(minutes % 60)
  
  if (hours > 0) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  } else {
    return `${remainingMinutes}m`
  }
}

/**
 * Format Date object to time string for UI display
 * @param date Date object
 * @returns Formatted time string
 */
export const formatDateTime = (date: Date): string => {
  try {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  } catch (error: any) {
    console.warn('Invalid date object:', date)
    return 'Invalid time'
  }
}

/**
 * Format relative time (e.g., "2 minutes ago", "1 hour ago")
 * @param dateString ISO date string
 * @returns Relative time string
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    
    const diffInDays = Math.floor(diffInSeconds / 86400)
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    
    return `${Math.floor(diffInDays / 365)} years ago`
  } catch (error: any) {
    console.warn('Invalid date format for relative time:', dateString)
    return 'Unknown'
  }
}

/**
 * Check if a date is today
 * @param dateString ISO date string
 * @returns Boolean indicating if date is today
 */
export const isToday = (dateString: string): boolean => {
  try {
    const date = new Date(dateString)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  } catch (error: any) {
    return false
  }
}

/**
 * Format duration between two dates
 * @param startDate ISO date string
 * @param endDate ISO date string  
 * @returns Formatted duration string
 */
export const formatDuration = (startDate: string, endDate: string): string => {
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffInSeconds = Math.floor((end.getTime() - start.getTime()) / 1000)
    return formatTime(diffInSeconds)
  } catch (error: any) {
    console.warn('Invalid date format for duration:', { startDate, endDate })
    return '00:00'
  }
}