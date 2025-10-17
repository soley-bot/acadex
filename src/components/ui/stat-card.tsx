import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

export interface StatCardProps {
  label: string
  value: string | number
  description?: string
  icon: LucideIcon
  variant?: 'gradient' | 'default'
  gradientFrom?: string
  gradientTo?: string
  iconColor?: string
  className?: string
}

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  variant = 'default',
  gradientFrom = 'from-blue-500',
  gradientTo = 'to-blue-600',
  iconColor = 'text-blue-600',
  className
}: StatCardProps) {
  if (variant === 'gradient') {
    return (
      <Card className={cn(
        "relative overflow-hidden border-none shadow-lg text-white hover:shadow-xl transition-shadow",
        `bg-gradient-to-br ${gradientFrom} ${gradientTo}`,
        className
      )}>
        <CardContent className="!p-3 sm:!p-4 md:!p-5 lg:!p-6">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mb-1.5 sm:mb-2 md:mb-3 opacity-90" />
          <p className="text-xl sm:text-2xl md:text-3xl font-bold mb-0.5 sm:mb-1">{value}</p>
          <p className="text-xs sm:text-sm opacity-90 font-medium">{label}</p>
          {description && (
            <p className="text-xs opacity-75 mt-0.5 sm:mt-1">{description}</p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="!p-3 sm:!p-4 md:!p-5 lg:!p-6">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">{label}</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">{value}</p>
          </div>
          <div className={cn(
            "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0",
            iconColor.includes('blue') ? 'bg-blue-100' :
            iconColor.includes('green') ? 'bg-green-100' :
            iconColor.includes('purple') ? 'bg-purple-100' :
            iconColor.includes('amber') ? 'bg-amber-100' :
            'bg-gray-100'
          )}>
            <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6", iconColor)} />
          </div>
        </div>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

// Preset configurations for common use cases
export const StatCardPresets = {
  courses: {
    gradient: {
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-blue-600',
      iconColor: 'text-white'
    },
    default: {
      iconColor: 'text-blue-600'
    }
  },
  completed: {
    gradient: {
      gradientFrom: 'from-green-500',
      gradientTo: 'to-green-600',
      iconColor: 'text-white'
    },
    default: {
      iconColor: 'text-green-600'
    }
  },
  quizzes: {
    gradient: {
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-purple-600',
      iconColor: 'text-white'
    },
    default: {
      iconColor: 'text-purple-600'
    }
  },
  score: {
    gradient: {
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-amber-600',
      iconColor: 'text-white'
    },
    default: {
      iconColor: 'text-amber-600'
    }
  }
}
