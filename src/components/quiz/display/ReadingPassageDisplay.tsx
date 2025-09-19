'use client'

import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX, FileText, ZoomIn, ZoomOut, Clock, RotateCcw, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ReadingPassageDisplayProps {
  title?: string | null
  source?: string | null
  passage: string
  audioUrl?: string | null
  className?: string
  wordCount?: number
  estimatedReadTime?: number
}

export function ReadingPassageDisplay({ 
  title, 
  source, 
  passage, 
  audioUrl, 
  className = '',
  wordCount,
  estimatedReadTime
}: ReadingPassageDisplayProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [readingTime, setReadingTime] = useState(0)
  const [isReading, setIsReading] = useState(false)
  const [highlights, setHighlights] = useState<Array<{start: number, end: number, color: string}>>([])
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const passageRef = useRef<HTMLDivElement>(null)

  // Reading time tracker
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isReading) {
      interval = setInterval(() => {
        setReadingTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isReading])

  // Start reading timer when component mounts
  useEffect(() => {
    setIsReading(true)
    return () => setIsReading(false)
  }, [])

  // Format reading time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayAudio = async () => {
    if (!audioUrl && !('speechSynthesis' in window)) return

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause()
      } else if ('speechSynthesis' in window) {
        speechSynthesis.cancel()
      }
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
      
      if (audioUrl) {
        // Use actual audio file
        if (audioRef.current) {
          try {
            await audioRef.current.play()
          } catch (error) {
            console.error('Audio playback failed:', error)
            setIsPlaying(false)
          }
        }
      } else if ('speechSynthesis' in window) {
        // Use text-to-speech
        const utterance = new SpeechSynthesisUtterance(passage)
        utterance.rate = 0.8
        utterance.onend = () => setIsPlaying(false)
        utterance.onerror = () => setIsPlaying(false)
        speechSynthesis.speak(utterance)
      }
    }
  }

  // Text selection and highlighting
  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return
    
    const range = selection.getRangeAt(0)
    if (!passageRef.current?.contains(range.commonAncestorContainer)) return
    
    const start = range.startOffset
    const end = range.endOffset
    
    // Add highlight with random color
    const colors = ['bg-yellow-200', 'bg-blue-200', 'bg-green-200', 'bg-pink-200', 'bg-purple-200']
    const color = colors[Math.floor(Math.random() * colors.length)]
    
    setHighlights(prev => [...prev, { start, end, color }])
    selection.removeAllRanges()
  }

  return (
    <Card className={`${className} h-full`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Reading Passage
          </CardTitle>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Reading Stats */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTime(readingTime)}</span>
            </div>
            
            {/* Font Size Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                disabled={fontSize <= 12}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs px-2">{fontSize}px</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                disabled={fontSize >= 24}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* Clear Highlights */}
            {highlights.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHighlights([])}
                className="gap-1"
              >
                <RotateCcw className="h-4 w-4" />
                Clear
              </Button>
            )}
            
            {/* Audio Control */}
            {(audioUrl || 'speechSynthesis' in window) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayAudio}
                className="gap-1"
              >
                {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {isPlaying ? 'Stop' : 'Listen'}
              </Button>
            )}
          </div>
        </div>
        
        {title && (
          <h3 className="text-lg font-semibold text-foreground mt-2">
            {title}
          </h3>
        )}
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
          {source && (
            <p className="italic">Source: {source}</p>
          )}
          <div className="flex items-center gap-4">
            {wordCount && <span>{wordCount} words</span>}
            {estimatedReadTime && <span>~{estimatedReadTime} min read</span>}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div 
          ref={passageRef}
          className="prose prose-lg max-w-none overflow-y-auto max-h-96 lg:max-h-[60vh]"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
          onMouseUp={handleTextSelection}
        >
          <div className="whitespace-pre-wrap text-foreground leading-relaxed selection:bg-primary/20">
            {passage}
          </div>
        </div>
        
        {/* Reading Tips */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg border-l-4 border-primary">
          <p className="text-sm text-muted-foreground">
            <strong>Reading Tips:</strong> Take your time to understand the passage. 
            You can highlight important text by selecting it, adjust font size for comfort, 
            and use audio narration if needed.
          </p>
        </div>

        {/* Audio Element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => setIsPlaying(false)}
          />
        )}
      </CardContent>
    </Card>
  )
}