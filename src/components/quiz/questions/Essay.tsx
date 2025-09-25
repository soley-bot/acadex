"use client"

import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface EssayProps {
  value?: string
  onValueChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  rows?: number
  className?: string
}

export function Essay({
  value,
  onValueChange,
  disabled = false,
  placeholder = "Enter your detailed answer here...",
  rows = 6,
  className
}: EssayProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="p-3 sm:p-4 bg-muted/20 rounded-lg">
        <p className="text-xs sm:text-sm text-muted-foreground mb-3">Write your answer:</p>
        <Textarea
          value={value || ''}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className="text-sm sm:text-base resize-none min-h-[100px] sm:min-h-[120px]"
        />
        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <span>{value?.length || 0} characters</span>
          <span className="hidden sm:inline">No character limit</span>
        </div>
      </div>
    </div>
  )
}
