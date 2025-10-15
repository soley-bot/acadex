'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [showPlayer, setShowPlayer] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Extract video ID from various YouTube URL formats
  const extractVideoId = (url: string): string => {
    if (!url || url.length === 11 && !url.includes('/')) {
      // Already a video ID or null
      return url || ''
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

  const cleanVideoId = videoId ? extractVideoId(videoId) : ''
  const isValidId = cleanVideoId && /^[a-zA-Z0-9_-]{11}$/.test(cleanVideoId)

  // Use srcdoc for lazy loading and reduced violations
  const embedUrl = isValidId ? `https://www.youtube-nocookie.com/embed/${cleanVideoId}?` + new URLSearchParams({
    rel: '0',
    showinfo: '0',
    modestbranding: '1',
    autoplay: '0',
    fs: '1',
    cc_load_policy: '1',
    iv_load_policy: '3',
    autohide: '1',
    enablejsapi: '1',
    origin: typeof window !== 'undefined' ? window.location.origin : '',
    // Add these to reduce violations
    widget_referrer: typeof window !== 'undefined' ? window.location.href : '',
    playsinline: '1'
  }).toString() : ''

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!iframeRef.current || !isValidId) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !showPlayer) {
            setShowPlayer(true)
          }
        })
      },
      { rootMargin: '50px' }
    )

    observer.observe(iframeRef.current)

    return () => {
      observer.disconnect()
    }
  }, [showPlayer, isValidId])

  const handleRetry = () => {
    setHasError(false)
    setIsLoaded(false)
    setRetryCount(prev => prev + 1)
    setShowPlayer(false)
    // Use requestAnimationFrame to avoid forced reflow
    requestAnimationFrame(() => {
      setShowPlayer(true)
    })
  }

  // Early returns for invalid states
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
    <div 
      ref={iframeRef}
      className={`relative aspect-video bg-muted rounded-lg overflow-hidden shadow-lg ${className}`}
    >
      {!isLoaded && showPlayer && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-foreground font-medium">Loading video...</p>
          </div>
        </div>
      )}
      
      {!showPlayer && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
          <div className="text-center">
            <Play size={64} className="text-primary mx-auto mb-4" />
            <p className="text-foreground font-medium">Click to load video</p>
          </div>
          <button
            onClick={() => setShowPlayer(true)}
            className="absolute inset-0 w-full h-full cursor-pointer bg-transparent hover:bg-black/5 transition-colors"
            aria-label="Load video player"
          />
        </div>
      )}
      
      {showPlayer && (
        <iframe
          key={retryCount}
          src={embedUrl}
          title={title}
          frameBorder="0"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className="absolute inset-0 w-full h-full"
          style={{ border: 0 }}
        />
      )}
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

