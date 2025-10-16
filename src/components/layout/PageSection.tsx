import { cn } from '@/lib/utils'

interface PageSectionProps {
  children: React.ReactNode
  className?: string
}

export function PageSection({ children, className }: PageSectionProps) {
  return (
    <section className={cn(
      'bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 md:py-16 lg:py-20',
      className
    )}>
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl space-y-12">
        {children}
      </div>
    </section>
  )
}
