'use client'

import { useState, useEffect } from 'react'

interface TestWrapperProps {
  children: React.ReactNode
}

export function TestWrapper({ children }: TestWrapperProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return <div data-client={isClient}>{children}</div>
}