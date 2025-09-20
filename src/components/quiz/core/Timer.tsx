"use client"

import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/date-utils"

interface TimerProps {
  timeLeft: number
  className?: string
}

export function Timer({ timeLeft, className }: TimerProps) {
  // Using formatTime from centralized utilities

  const getTimerColor = (time: number) => {
    if (time <= 300) return 'text-red-600' // Last 5 minutes
    if (time <= 900) return 'text-orange-600' // Last 15 minutes
    return 'text-muted-foreground'
  }

  const getTimerBgColor = (time: number) => {
    if (time <= 300) return 'bg-red-50 border-red-200' // Last 5 minutes
    if (time <= 900) return 'bg-orange-50 border-orange-200' // Last 15 minutes
    return 'bg-background border-border'
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg border font-mono text-sm transition-colors",
      getTimerBgColor(timeLeft),
      className
    )}>
      <Clock className={cn("w-4 h-4", getTimerColor(timeLeft))} />
      <span className={cn("font-medium", getTimerColor(timeLeft))}>
        {formatTime(timeLeft)}
      </span>
      {timeLeft <= 300 && (
        <span className="text-xs text-red-600 animate-pulse ml-1">
          ⚠️
        </span>
      )}
    </div>
  )
}