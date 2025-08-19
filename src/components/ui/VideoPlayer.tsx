'use client'

interface VideoPlayerProps {
  url: string
  className?: string
}

export function VideoPlayer({ url, className = "" }: VideoPlayerProps) {
  // Function to extract YouTube video ID from various YouTube URL formats
  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  // Function to extract Vimeo video ID
  const getVimeoVideoId = (url: string): string | null => {
    const patterns = [
      /vimeo\.com\/(\d+)/,
      /vimeo\.com\/video\/(\d+)/,
      /player\.vimeo\.com\/video\/(\d+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  // Function to extract Dailymotion video ID
  const getDailymotionVideoId = (url: string): string | null => {
    const patterns = [
      /dailymotion\.com\/video\/([^_\?]+)/,
      /dai\.ly\/([^_\?]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  // Function to extract Canva video ID or handle Canva URLs
  const getCanvaVideoInfo = (url: string): { embedUrl: string; isValid: boolean } => {
    // Canva share URLs: https://www.canva.com/design/[DESIGN_ID]/[HASH]/view
    const canvaSharePattern = /canva\.com\/design\/([^\/]+)\/([^\/]+)\/view/
    const shareMatch = url.match(canvaSharePattern)
    
    if (shareMatch) {
      // Convert Canva share URL to embed URL
      const designId = shareMatch[1]
      const hash = shareMatch[2]
      return {
        embedUrl: `https://www.canva.com/design/${designId}/${hash}/view?embed`,
        isValid: true
      }
    }
    
    // Check if it's already an embed URL
    if (url.includes('canva.com') && url.includes('embed')) {
      return {
        embedUrl: url,
        isValid: true
      }
    }
    
    return { embedUrl: '', isValid: false }
  }

  // Check video platform type
  const getVideoPlatform = (url: string): 'youtube' | 'vimeo' | 'dailymotion' | 'canva' | 'direct' => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube'
    }
    if (url.includes('vimeo.com')) {
      return 'vimeo'
    }
    if (url.includes('dailymotion.com') || url.includes('dai.ly')) {
      return 'dailymotion'
    }
    if (url.includes('canva.com')) {
      return 'canva'
    }
    return 'direct'
  }

  const platform = getVideoPlatform(url)

  // Handle YouTube URLs
  if (platform === 'youtube') {
    const videoId = getYouTubeVideoId(url)
    
    if (!videoId) {
      return (
        <div className={`flex items-center justify-center bg-muted/40 ${className}`}>
          <p className="text-gray-500">Invalid YouTube URL</p>
        </div>
      )
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
    
    return (
      <iframe
        src={embedUrl}
        title="YouTube Video Player"
        className={`w-full h-full border-0 ${className}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }

  // Handle Vimeo URLs
  if (platform === 'vimeo') {
    const videoId = getVimeoVideoId(url)
    
    if (!videoId) {
      return (
        <div className={`flex items-center justify-center bg-muted/40 ${className}`}>
          <p className="text-gray-500">Invalid Vimeo URL</p>
        </div>
      )
    }

    const embedUrl = `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`
    
    return (
      <iframe
        src={embedUrl}
        title="Vimeo Video Player"
        className={`w-full h-full border-0 ${className}`}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    )
  }

  // Handle Canva URLs
  if (platform === 'canva') {
    const canvaInfo = getCanvaVideoInfo(url)
    
    if (!canvaInfo.isValid) {
      return (
        <div className={`flex items-center justify-center bg-muted/40 ${className}`}>
          <div className="text-center p-4">
            <p className="text-gray-500 mb-2">Invalid Canva URL</p>
            <p className="text-xs text-gray-400">
              Please use a Canva share link or download the video file directly
            </p>
          </div>
        </div>
      )
    }

    return (
      <iframe
        src={canvaInfo.embedUrl}
        title="Canva Video Player"
        className={`w-full h-full border-0 ${className}`}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    )
  }

  // Handle Dailymotion URLs
  if (platform === 'dailymotion') {
    const videoId = getDailymotionVideoId(url)
    
    if (!videoId) {
      return (
        <div className={`flex items-center justify-center bg-muted/40 ${className}`}>
          <p className="text-gray-500">Invalid Dailymotion URL</p>
        </div>
      )
    }

    const embedUrl = `https://www.dailymotion.com/embed/video/${videoId}`
    
    return (
      <iframe
        src={embedUrl}
        title="Dailymotion Video Player"
        className={`w-full h-full border-0 ${className}`}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    )
  }

  // For direct video files or unsupported platforms, use the HTML video element
  return (
    <video
      src={url}
      controls
      className={`w-full h-full object-cover ${className}`}
      preload="metadata"
    >
      Your browser does not support the video tag.
    </video>
  )
}
