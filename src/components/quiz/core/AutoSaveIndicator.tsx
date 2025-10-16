"use client"

import { Check, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AutoSaveIndicatorProps {
  status: 'saving' | 'saved' | 'error'
  className?: string
}

export function AutoSaveIndicator({ status, className }: AutoSaveIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      {status === 'saving' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
          <span className="text-blue-600 font-medium">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="h-3 w-3 text-green-600" />
          <span className="text-green-600 font-medium">Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="h-3 w-3 text-destructive" />
          <span className="text-destructive font-medium">Error</span>
        </>
      )}
    </div>
  )
}
