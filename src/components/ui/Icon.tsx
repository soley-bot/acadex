import * as React from "react"
import { 
  Users, 
  Book, 
  CheckCircle, 
  HelpCircle, 
  Edit, 
  DollarSign,
  BarChart3,
  Activity,
  Zap,
  User,
  Plus,
  Shield,
  Briefcase,
  Search,
  Settings,
  AlertTriangle,
  Eye,
  EyeOff,
  Check,
  Trash2,
  X,
  Calendar,
  RefreshCw,
  type LucideIcon
} from "lucide-react"

// Map of icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  users: Users,
  book: Book,
  'check-circle': CheckCircle,
  help: HelpCircle,
  edit: Edit,
  dollar: DollarSign,
  chart: BarChart3,
  activity: Activity,
  lightning: Zap,
  user: User,
  add: Plus,
  shield: Shield,
  briefcase: Briefcase,
  search: Search,
  settings: Settings,
  warning: AlertTriangle,
  eye: Eye,
  'eye-off': EyeOff,
  check: Check,
  delete: Trash2,
  close: X,
  calendar: Calendar,
  refresh: RefreshCw,
}

interface IconProps {
  name: string
  size?: number
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted' | 'current' | 'white'
  className?: string
}

const colorMap: Record<string, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  muted: 'text-gray-400',
  current: 'text-current',
  white: 'text-white'
}

const Icon: React.FC<IconProps> = ({ className = "", name = "", size = 24, color }) => {
  const IconComponent = iconMap[name]
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in icon map`)
    return null
  }

  const colorClass = color ? colorMap[color] : ''
  
  return (
    <IconComponent
      className={`${colorClass} ${className}`.trim()}
      size={size}
    />
  )
}

Icon.displayName = "Icon"

export default Icon


