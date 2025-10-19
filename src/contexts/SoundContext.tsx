'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { soundManager, SoundType, prefersReducedMotion } from '@/lib/sounds'

interface SoundContextType {
  enabled: boolean
  volume: number
  toggleSound: () => void
  setVolume: (volume: number) => void
  play: (sound: SoundType) => void
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)

interface SoundProviderProps {
  children: ReactNode
}

const STORAGE_KEY = 'acadex-sound-preferences'

export function SoundProvider({ children }: SoundProviderProps) {
  const [enabled, setEnabled] = useState(true)
  const [volume, setVolumeState] = useState(0.5)
  const [isClient, setIsClient] = useState(false)

  // Load preferences from localStorage
  useEffect(() => {
    setIsClient(true)

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)

        if (stored) {
          const prefs = JSON.parse(stored)
          const reducedMotion = prefersReducedMotion()
          const shouldEnable = prefs.enabled !== false && !reducedMotion

          setEnabled(shouldEnable)
          setVolumeState(prefs.volume ?? 0.5)

          soundManager.setEnabled(shouldEnable)
          soundManager.setVolume(prefs.volume ?? 0.5)
        } else {
          // Default: respect prefers-reduced-motion
          const shouldEnable = !prefersReducedMotion()
          setEnabled(shouldEnable)
          soundManager.setEnabled(shouldEnable)
        }
      } catch (error) {
        console.error('[Sound] Failed to load preferences:', error)
      }
    }
  }, [])

  // Save preferences to localStorage
  useEffect(() => {
    if (!isClient) return

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ enabled, volume })
      )
    } catch (error) {
      console.error('[Sound] Failed to save preferences:', error)
    }
  }, [enabled, volume, isClient])

  const toggleSound = () => {
    const newEnabled = !enabled
    setEnabled(newEnabled)
    soundManager.setEnabled(newEnabled)

    // Play confirmation sound when enabling
    if (newEnabled) {
      setTimeout(() => soundManager.play('success'), 100)
    }
  }

  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    setVolumeState(clampedVolume)
    soundManager.setVolume(clampedVolume)

    // Play sample sound at new volume
    if (enabled) {
      soundManager.play('click')
    }
  }

  const play = (sound: SoundType) => {
    if (enabled && !prefersReducedMotion()) {
      soundManager.play(sound)
    }
  }

  return (
    <SoundContext.Provider value={{ enabled, volume, toggleSound, setVolume, play }}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSound() {
  const context = useContext(SoundContext)
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider')
  }
  return context
}
