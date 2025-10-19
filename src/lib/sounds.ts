/**
 * Sound Effects Manager for Acadex
 * Provides educational audio feedback for quiz and course interactions
 */

export type SoundType =
  // Quiz sounds
  | 'quiz-start'
  | 'question-next'
  | 'answer-select'
  | 'answer-correct'
  | 'answer-wrong'
  | 'quiz-complete'
  | 'quiz-pass'
  | 'quiz-fail'
  // Course sounds
  | 'lesson-complete'
  | 'module-complete'
  | 'course-complete'
  | 'achievement'
  // UI sounds
  | 'click'
  | 'success'
  | 'error'
  | 'notification'

interface SoundConfig {
  url: string
  volume: number
  category: 'quiz' | 'course' | 'ui'
}

/**
 * Sound library - Web Audio API synthesized sounds
 * Uses Data URIs for instant playback without network requests
 */
export const SOUNDS: Record<SoundType, SoundConfig> = {
  // Quiz sounds
  'quiz-start': {
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6Slpqeoqaqrrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==',
    volume: 0.3,
    category: 'quiz',
  },
  'question-next': {
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6Slpqeoqaqrrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==',
    volume: 0.2,
    category: 'quiz',
  },
  'answer-select': {
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6Slpqeoqaqrrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==',
    volume: 0.15,
    category: 'quiz',
  },
  'answer-correct': {
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6Slpqeoqaqrrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==',
    volume: 0.4,
    category: 'quiz',
  },
  'answer-wrong': {
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6Slpqeoqaqrrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==',
    volume: 0.25,
    category: 'quiz',
  },
  'quiz-complete': {
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6Slpqeoqaqrrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==',
    volume: 0.5,
    category: 'quiz',
  },
  'quiz-pass': {
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6Slpqeoqaqrrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==',
    volume: 0.6,
    category: 'quiz',
  },
  'quiz-fail': {
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6Slpqeoqaqrrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==',
    volume: 0.3,
    category: 'quiz',
  },

  // Course sounds
  'lesson-complete': {
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6Slpqeoqaqrrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==',
    volume: 0.4,
    category: 'course',
  },
  'module-complete': {
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6Slpqeoqaqrrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==',
    volume: 0.5,
    category: 'course',
  },
  'course-complete': {
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6Slpqeoqaqrrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==',
    volume: 0.6,
    category: 'course',
  },
  achievement: {
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6Slpqeoqaqrrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==',
    volume: 0.5,
    category: 'course',
  },

  // UI sounds
  click: {
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6Slpqeoqaqrrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==',
    volume: 0.1,
    category: 'ui',
  },
  success: {
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6Slpqeoqaqrrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==',
    volume: 0.3,
    category: 'ui',
  },
  error: {
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6Slpqeoqaqrrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==',
    volume: 0.2,
    category: 'ui',
  },
  notification: {
    url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6Slpqeoqaqrrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==',
    volume: 0.25,
    category: 'ui',
  },
}

/**
 * Web Audio API based sound synthesizer
 * Creates simple tones for educational feedback
 */
class AudioSynthesizer {
  private audioContext: AudioContext | null = null
  private enabled = true
  private masterVolume = 0.5

  constructor() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      // Initialize on user interaction to comply with browser policies
      this.initialize()
    }
  }

  private initialize() {
    try {
      // @ts-ignore - AudioContext exists in browser
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    } catch (error) {
      console.warn('[Sound] Web Audio API not supported:', error)
      this.enabled = false
    }
  }

  /**
   * Generate a simple tone
   */
  private async playTone(
    frequency: number,
    duration: number,
    volume: number,
    type: OscillatorType = 'sine'
  ) {
    if (!this.enabled || !this.audioContext) return

    try {
      // Resume context if suspended (required by browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.type = type
      oscillator.frequency.value = frequency

      // Apply volume with smooth fade out
      const adjustedVolume = volume * this.masterVolume
      gainNode.gain.setValueAtTime(adjustedVolume, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + duration
      )

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration)
    } catch (error) {
      console.error('[Sound] Error playing tone:', error)
    }
  }

  /**
   * Play predefined sound effects
   */
  play(sound: SoundType) {
    if (!this.enabled || !this.audioContext) return

    const config = SOUNDS[sound]

    // Different sounds for different events
    switch (sound) {
      case 'answer-correct':
        this.playTone(523, 0.1, config.volume) // C5
        setTimeout(() => this.playTone(659, 0.15, config.volume), 100) // E5
        break

      case 'answer-wrong':
        this.playTone(220, 0.2, config.volume, 'square') // A3
        break

      case 'answer-select':
        this.playTone(440, 0.05, config.volume) // A4
        break

      case 'quiz-complete':
        this.playTone(523, 0.1, config.volume) // C5
        setTimeout(() => this.playTone(659, 0.1, config.volume), 120) // E5
        setTimeout(() => this.playTone(784, 0.2, config.volume), 240) // G5
        break

      case 'quiz-pass':
        this.playTone(523, 0.1, config.volume) // C5
        setTimeout(() => this.playTone(659, 0.1, config.volume), 100) // E5
        setTimeout(() => this.playTone(784, 0.1, config.volume), 200) // G5
        setTimeout(() => this.playTone(1047, 0.3, config.volume), 300) // C6
        break

      case 'quiz-fail':
        this.playTone(294, 0.15, config.volume) // D4
        setTimeout(() => this.playTone(277, 0.15, config.volume), 150) // C#4
        setTimeout(() => this.playTone(262, 0.3, config.volume), 300) // C4
        break

      case 'lesson-complete':
        this.playTone(659, 0.1, config.volume) // E5
        setTimeout(() => this.playTone(784, 0.2, config.volume), 120) // G5
        break

      case 'module-complete':
        this.playTone(523, 0.1, config.volume) // C5
        setTimeout(() => this.playTone(659, 0.1, config.volume), 100) // E5
        setTimeout(() => this.playTone(784, 0.15, config.volume), 200) // G5
        break

      case 'course-complete':
        // Triumphant fanfare
        this.playTone(523, 0.1, config.volume)
        setTimeout(() => this.playTone(659, 0.1, config.volume), 100)
        setTimeout(() => this.playTone(784, 0.1, config.volume), 200)
        setTimeout(() => this.playTone(1047, 0.1, config.volume), 300)
        setTimeout(() => this.playTone(1319, 0.3, config.volume), 400)
        break

      case 'achievement':
        this.playTone(784, 0.1, config.volume) // G5
        setTimeout(() => this.playTone(1047, 0.2, config.volume), 120) // C6
        break

      case 'click':
        this.playTone(880, 0.03, config.volume) // A5
        break

      case 'success':
        this.playTone(659, 0.1, config.volume) // E5
        setTimeout(() => this.playTone(784, 0.15, config.volume), 100) // G5
        break

      case 'error':
        this.playTone(330, 0.2, config.volume, 'sawtooth') // E4
        break

      case 'notification':
        this.playTone(880, 0.1, config.volume) // A5
        setTimeout(() => this.playTone(1047, 0.1, config.volume), 110) // C6
        break

      case 'quiz-start':
        this.playTone(440, 0.1, config.volume) // A4
        setTimeout(() => this.playTone(554, 0.15, config.volume), 120) // C#5
        break

      case 'question-next':
        this.playTone(494, 0.08, config.volume) // B4
        break

      default:
        this.playTone(440, 0.1, config.volume) // Default A4
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
    if (enabled && this.audioContext?.state === 'suspended') {
      this.audioContext.resume().catch(err => {
        console.error('[Sound] Failed to resume AudioContext:', err)
      })
    }
  }

  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
  }

  isEnabled() {
    return this.enabled
  }

  getVolume() {
    return this.masterVolume
  }

  getAudioContextState() {
    return this.audioContext?.state || 'not initialized'
  }
}

// Singleton instance
export const soundManager = new AudioSynthesizer()

/**
 * Hook to check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
