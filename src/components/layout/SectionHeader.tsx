import { LucideIcon } from 'lucide-react'

interface SectionHeaderProps {
  icon: LucideIcon
  title: string
  description?: string
}

export function SectionHeader({ icon: Icon, title, description }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shrink-0">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="text-lg text-gray-600 mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}
