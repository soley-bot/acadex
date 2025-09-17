import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'
import { 
  // OPTIMIZED IMPORTS - Only icons actually used in the app (32 total)
  // Based on usage analysis from the entire codebase
  
  // Navigation & Core
  User, Users, Settings, Book, Search,
  
  // Actions & States  
  Plus, Edit, Trash2, Save, Check, CheckCircle, X, XCircle, 
  AlertTriangle, Eye, EyeOff, HelpCircle,
  
  // Media & Communication
  Play, Camera, Mail, Share2,
  
  // Data & Analytics
  Activity, Calendar, Clock, BarChart3,
  
  // Security & Access
  Shield,
  
  // Status & Feedback  
  Lightbulb, Star, Zap,
  
  // Business & Finance
  Briefcase,
  
  // Files & Documents
  Folder, File,
  
  // Loading & Progress
  Loader2, RefreshCw,
  
  // Specialized
  Target,
  
  type LucideIcon
} from 'lucide-react'

// Icon mapping for easy semantic usage - OPTIMIZED to only include imported icons
export const ICON_MAP = {
  // Navigation & Core
  user: User, 
  users: Users,
  settings: Settings,
  search: Search,
  
  // Content & Learning
  book: Book,
  target: Target,
  star: Star,
  
  // Actions & States
  add: Plus,
  edit: Edit,
  delete: Trash2,
  save: Save,
  check: Check,
  'check-circle': CheckCircle,
  close: X,
  'x-circle': XCircle,
  warning: AlertTriangle,
  help: HelpCircle,
  
  // Media & Communication  
  play: Play,
  camera: Camera,
  mail: Mail,
  share: Share2,
  
  // Data & Analytics
  activity: Activity,
  calendar: Calendar,
  clock: Clock,
  chart: BarChart3,
  
  // Security & Access
  shield: Shield,
  eye: Eye,
  'eye-off': EyeOff,
  
  // Status & Feedback
  lightbulb: Lightbulb,
  lightning: Zap,
  
  // Business & Finance
  briefcase: Briefcase,
  
  // Files & Documents
  folder: Folder,
  file: File,
  
  // Loading & Progress
  loading: Loader2,
  refresh: RefreshCw,
} as const

export type IconName = keyof typeof ICON_MAP

export interface IconProps {
  name: IconName
  size?: number | string
  className?: string
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'white' | 'current'
  strokeWidth?: number
}

const colorClasses = {
  primary: 'text-secondary',
  secondary: 'text-gray-600', 
  muted: 'text-gray-400',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-primary',
  white: 'text-white',
  current: 'text-current'
}

export default function Icon({ 
  name, 
  size = 20, 
  className,
  color = 'current',
  strokeWidth = 2 
}: IconProps) {
  const IconComponent = ICON_MAP[name] as LucideIcon
  
  if (!IconComponent) {
    logger.warn(`Icon "${name}" not found in ICON_MAP`)
    return null
  }
  
  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={cn(colorClasses[color], className)}
    />
  )
}

// Export common icon collections for easy importing - OPTIMIZED
export const NavigationIcons = {
  User, Users, Settings, Search
}

export const ContentIcons = {
  Book, Target, Star
}

export const ActionIcons = {
  Plus, Edit, Trash2, Save,
  Check, CheckCircle, X, XCircle, AlertTriangle, HelpCircle
}

export const DataIcons = {
  Activity, Calendar, Clock, BarChart3
}

export const StatusIcons = {
  Lightbulb, Shield, Zap
}
