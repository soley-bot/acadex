'use client'

interface MinimalWrapperProps {
  children: React.ReactNode
}

export function MinimalWrapper({ children }: MinimalWrapperProps) {
  return <div>{children}</div>
}
