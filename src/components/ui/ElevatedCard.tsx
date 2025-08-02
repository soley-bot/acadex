import { ReactNode } from 'react'

interface ElevatedCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

const cardPadding = {
  sm: 'p-4',
  md: 'p-6', 
  lg: 'p-8'
}

export function ElevatedCard({ 
  children, 
  className = '', 
  hover = true,
  padding = 'md' 
}: ElevatedCardProps) {
  const paddingClass = cardPadding[padding]
  const hoverClass = hover ? 'hover:shadow-xl transition-all duration-300 hover:-translate-y-1' : ''
  
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-lg ${paddingClass} ${hoverClass} ${className}`}>
      {children}
    </div>
  )
}

interface ValueCardProps {
  icon: string
  title: string
  description: string
  className?: string
}

export function ValueCard({ icon, title, description, className = '' }: ValueCardProps) {
  return (
    <ElevatedCard className={`group ${className}`}>
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <span className="text-red-600 text-xl">{icon}</span>
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">{title}</h3>
      <p className="text-gray-600 text-center leading-relaxed">
        {description}
      </p>
    </ElevatedCard>
  )
}

interface StatCardProps {
  value: string
  label: string
  highlight?: boolean
  className?: string
}

export function StatCard({ value, label, highlight = false, className = '' }: StatCardProps) {
  return (
    <div className="text-center">
      <ElevatedCard hover className={className}>
        <div className={`text-3xl md:text-4xl font-black mb-2 ${highlight ? 'text-red-600' : 'text-gray-900'}`}>
          {value}
        </div>
        <div className="text-sm text-gray-600 font-medium">{label}</div>
      </ElevatedCard>
    </div>
  )
}
