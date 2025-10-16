"use client"

import { Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface TimerWarningProps {
  timeLeft: number
  className?: string
}

export function TimerWarning({ timeLeft, className }: TimerWarningProps) {
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    // Show warning at 5 minutes and 1 minute
    if (timeLeft === 300 || timeLeft === 60) {
      setShowWarning(true)
      const timer = setTimeout(() => setShowWarning(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  if (!showWarning) return null

  const minutes = Math.floor(timeLeft / 60)
  const isUrgent = timeLeft < 120 // Less than 2 minutes

  return (
    <div
      className={cn(
        "mb-4 p-3 rounded-lg border animate-in slide-in-from-top-2",
        isUrgent
          ? "bg-destructive/10 border-destructive"
          : "bg-warning/10 border-warning",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {isUrgent ? (
          <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
        ) : (
          <Clock className="h-5 w-5 text-warning" />
        )}
        <div className="flex-1">
          <p className={cn(
            "font-medium text-sm",
            isUrgent ? "text-destructive" : "text-warning-foreground"
          )}>
            {timeLeft < 60 ? (
              <>⚠️ Less than 1 minute remaining!</>
            ) : minutes === 1 ? (
              <>⚠️ 1 minute remaining!</>
            ) : (
              <>{minutes} minutes remaining</>
            )}
          </p>
          {!isUrgent && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Make sure you have enough time to complete your answers
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
