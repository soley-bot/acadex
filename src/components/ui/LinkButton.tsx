import Link from 'next/link'
import { Button, ButtonProps } from '@/components/ui/button'
import { ReactNode } from 'react'

interface LinkButtonProps extends Omit<ButtonProps, 'asChild'> {
  href: string
  children: ReactNode
}

export function LinkButton({ href, children, ...props }: LinkButtonProps) {
  return (
    <Button asChild {...props}>
      <Link href={href}>
        {children}
      </Link>
    </Button>
  )
}
