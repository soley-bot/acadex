"use client"

import { Keyboard, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function KeyboardHints() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-30 hidden md:flex items-center gap-2 px-3 py-2 bg-white border rounded-lg shadow-md hover:shadow-lg transition-all text-xs text-muted-foreground hover:text-foreground"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="h-4 w-4" />
        <span>Shortcuts</span>
      </button>

      {/* Hints Panel */}
      {isOpen && (
        <div className="fixed bottom-16 left-4 z-40 bg-white border rounded-lg shadow-xl p-4 max-w-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Keyboard Shortcuts
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-muted rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            <ShortcutRow keys={['Ctrl', '←']} action="Previous question" />
            <ShortcutRow keys={['Ctrl', '→']} action="Next question" />
            <ShortcutRow keys={['Ctrl', 'Enter']} action="Submit / Next" />
            <ShortcutRow keys={['1', '2', '3', '4']} action="Select option (multiple choice)" />
          </div>
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            <p>Press <Kbd>Ctrl</Kbd> + <Kbd>?</Kbd> to toggle this panel</p>
          </div>
        </div>
      )}
    </>
  )
}

function ShortcutRow({ keys, action }: { keys: string[]; action: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <div className="flex items-center gap-1">
        {keys.map((key, idx) => (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && <span className="text-muted-foreground">+</span>}
            <Kbd>{key}</Kbd>
          </span>
        ))}
      </div>
      <span className="text-muted-foreground">{action}</span>
    </div>
  )
}

function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={cn(
      "px-2 py-0.5 bg-muted rounded text-xs font-mono border border-border shadow-sm",
      className
    )}>
      {children}
    </kbd>
  )
}
