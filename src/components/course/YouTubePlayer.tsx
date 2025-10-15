'use client'

import { useState } from 'react'
import { Play, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react'

interface YouTubePlayerProps {
  videoId: string | null
  title: string
  onVideoEnd?: () => void
  className?: string
}

export function YouTubePlayer({ videoId, title, onVideoEnd, className = '' }: YouTubePlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  
  if (!videoId) {
    return (
      <div className={`relative aspect-video bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Play size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Video Available</h3>
          <p className="text-muted-foreground">This lesson doesn&apos;t have a video component.</p>
        </div>
      </div>
    )
  }

  // Extract video ID from various YouTube URL formats
  const extractVideoId = (url: string): string => {
    if (url.length === 11 && !url.includes('/')) {
      // Already a video ID
      return url
    }
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) return match[1]
    }
    
    return url // Return as-is if no pattern matches
  }

  const cleanVideoId = extractVideoId(videoId)

  // Validate video ID format
  const isValidId = /^[a-zA-Z0-9_-]{11}$/.test(cleanVideoId)

  if (!isValidId) {
    return (
      <div className={`relative aspect-video bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <Play size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Invalid Video</h3>
          <p className="text-muted-foreground text-sm mb-4">The video ID format is invalid.</p>
          <p className="text-xs text-muted-foreground font-mono bg-muted-foreground/10 px-3 py-2 rounded">
            ID: {videoId}
          </p>
        </div>
      </div>
    )
  }

  const embedUrl = `https://www.youtube.com/embed/${cleanVideoId}?` + new URLSearchParams({
    rel: '0',
    showinfo: '0',
    modestbranding: '1',
    autoplay: '0',
    fs: '1',
    cc_load_policy: '1',
    iv_load_policy: '3',
    autohide: '1'
  }).toString()

  const handleRetry = () => {
    setHasError(false)
    setIsLoaded(false)
    setRetryCount(prev => prev + 1)
  }

  if (hasError) {
    return (
      <div className={`relative aspect-video bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <Play size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Video Load Failed</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Unable to load the video. This could be due to network issues or the video being unavailable.
          </p>
          <button
            onClick={handleRetry}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
          <p className="text-xs text-muted-foreground mt-4">
            If the problem persists, try refreshing the page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative aspect-video bg-muted rounded-lg overflow-hidden shadow-lg ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-foreground font-medium">Loading video...</p>
          </div>
        </div>
      )}
      
      <iframe
        key={retryCount}
        src={embedUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  )
}

// Utility function to validate YouTube video ID
export function isValidYouTubeVideoId(videoId: string): boolean {
  if (!videoId) return false
  
  // Basic validation: YouTube video IDs are typically 11 characters
  if (videoId.length === 11 && /^[a-zA-Z0-9_-]+$/.test(videoId)) {
    return true
  }
  
  // Check if it's a YouTube URL
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ]
  
  return youtubePatterns.some(pattern => pattern.test(videoId))
}

