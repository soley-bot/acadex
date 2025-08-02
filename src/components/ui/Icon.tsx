import { cn } from '@/lib/utils'
import { 
  // Navigation & Core
  Home, User, Users, Search, Settings, Menu, ArrowLeft, ArrowRight,
  
  // Content & Learning
  Book, BookOpen, BookmarkPlus, Bookmark, FileText, File, 
  GraduationCap, Target, Trophy, Award, Star, StarOff,
  
  // Actions & States  
  Plus, PlusCircle, Minus, Edit, Trash2, Save, Download, Upload,
  Check, CheckCircle, X, XCircle, AlertTriangle, Info, HelpCircle,
  Ban,
  
  // Media & Communication
  Play, Pause, RotateCcw, Volume2, VolumeX, Camera, Video,
  MessageCircle, Mail, Phone, Share2,
  
  // Data & Analytics
  BarChart3, TrendingUp, PieChart, Activity, Calendar,
  Clock, Timer, History,
  
  // Security & Access
  Lock, Unlock, Key, Shield, Eye, EyeOff,
  
  // UI Elements
  MoreHorizontal, MoreVertical, ChevronDown, ChevronUp, 
  ChevronLeft, ChevronRight, Filter, SlidersHorizontal,
  
  // Status & Feedback  
  Zap, Rocket, Lightbulb, Heart, ThumbsUp, ThumbsDown,
  Smile, Frown, Meh, AlertCircle, CheckCircle2,
  
  // Business & Finance
  DollarSign, CreditCard, ShoppingCart, Package, Briefcase,
  
  // Social & Sharing
  Facebook, Twitter, Instagram, Linkedin, Youtube,
  
  // Technical
  Code, Terminal, Database, Server, Wifi, WifiOff,
  
  // Weather & Time
  Sun, Moon, Cloud, CloudRain, Sunrise, Sunset,
  
  // Arrows & Directions
  ArrowUp, ArrowDown, ArrowUpRight, ArrowDownLeft,
  TrendingDown, Move, RotateCw,
  
  // Files & Documents
  FolderOpen, Folder, Image, FileImage, Paperclip,
  
  // Loading & Progress
  Loader2, RefreshCw, Pause as PauseIcon,
  
  // Grid & Layout
  Grid3X3, AlignLeft, AlignCenter, AlignRight, Maximize2,
  
  // Geography & Location
  Globe, MapPin, Map,
  
  type LucideIcon
} from 'lucide-react'

// Icon mapping for easy semantic usage
export const ICON_MAP = {
  // Navigation & Core
  home: Home,
  user: User, 
  users: Users,
  search: Search,
  settings: Settings,
  menu: Menu,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  
  // Content & Learning - replacing emojis
  book: BookOpen,        // 📚
  course: Book,
  bookmark: Bookmark,
  'bookmark-add': BookmarkPlus,
  file: FileText,
  document: File,
  graduation: GraduationCap,  // 🎓
  target: Target,        // 🎯
  trophy: Trophy,        // 🏆
  award: Award,
  star: Star,           // ⭐
  'star-off': StarOff,
  
  // Actions & States
  add: Plus,
  'add-circle': PlusCircle,
  remove: Minus,
  edit: Edit,
  delete: Trash2,
  save: Save,
  download: Download,
  upload: Upload,
  check: Check,         // ✅
  'check-circle': CheckCircle,
  close: X,             // ❌
  'x-circle': XCircle,
  warning: AlertTriangle,
  info: Info,
  help: HelpCircle,
  ban: Ban,
  
  // Media & Communication  
  play: Play,
  pause: Pause,
  restart: RotateCcw,
  volume: Volume2,
  'volume-off': VolumeX,
  camera: Camera,
  video: Video,
  message: MessageCircle,
  'message-circle': MessageCircle,
  mail: Mail,
  phone: Phone,
  share: Share2,
  
  // Data & Analytics
  chart: BarChart3,     // 📊
  'chart-pie': PieChart,
  trending: TrendingUp, // 📈
  activity: Activity,
  calendar: Calendar,
  clock: Clock,         // ⏰
  timer: Timer,
  history: History,
  
  // Security & Access
  lock: Lock,           // 🔒
  unlock: Unlock,
  key: Key,
  shield: Shield,
  eye: Eye,
  'eye-off': EyeOff,
  
  // UI Elements
  'more-horizontal': MoreHorizontal,
  'more-vertical': MoreVertical,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  filter: Filter,
  sliders: SlidersHorizontal,
  
  // Status & Feedback
  lightning: Zap,       // ⚡
  rocket: Rocket,       // 🚀
  lightbulb: Lightbulb, // 💡
  heart: Heart,
  'thumbs-up': ThumbsUp,
  'thumbs-down': ThumbsDown,
  smile: Smile,
  celebration: CheckCircle2, // 🎉
  
  // Business & Finance
  dollar: DollarSign,
  card: CreditCard,
  cart: ShoppingCart,
  package: Package,
  briefcase: Briefcase, // 💼
  
  // Social & Sharing
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  
  // Technical
  code: Code,
  terminal: Terminal,
  database: Database,
  server: Server,
  wifi: Wifi,
  'wifi-off': WifiOff,
  
  // Weather & Time
  sun: Sun,
  moon: Moon,
  cloud: Cloud,
  rain: CloudRain,
  sunrise: Sunrise,
  sunset: Sunset,
  
  // Arrows & Directions
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  'arrow-up-right': ArrowUpRight,
  'arrow-down-left': ArrowDownLeft,
  'trending-down': TrendingDown,
  move: Move,
  rotate: RotateCw,
  
  // Files & Documents
  'folder-open': FolderOpen,
  folder: Folder,
  image: Image,
  'file-image': FileImage,
  paperclip: Paperclip,
  
  // Loading & Progress
  loading: Loader2,
  refresh: RefreshCw,
  
  // Grid & Layout
  grid: Grid3X3,
  'align-left': AlignLeft,
  'align-center': AlignCenter,
  'align-right': AlignRight,
  maximize: Maximize2,
  
  // Mobile & Device
  mobile: Phone,        // 📱
  desktop: Settings,    // 💻 (approximate)
  
  // Geography & Location
  globe: Globe,         // 🌍
  map: Map,
  location: MapPin,
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
  primary: 'text-blue-600',
  secondary: 'text-gray-600', 
  muted: 'text-gray-400',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
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
    console.warn(`Icon "${name}" not found in ICON_MAP`)
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

// Export common icon collections for easy importing
export const NavigationIcons = {
  Home, User, Users, Search, Settings, Menu, ArrowLeft, ArrowRight
}

export const ContentIcons = {
  BookOpen, Book, Bookmark, BookmarkPlus, FileText, File, 
  GraduationCap, Target, Trophy, Award, Star
}

export const ActionIcons = {
  Plus, PlusCircle, Minus, Edit, Trash2, Save, Download, Upload,
  Check, CheckCircle, X, XCircle, AlertTriangle, Info, HelpCircle
}

export const DataIcons = {
  BarChart3, TrendingUp, PieChart, Activity, Calendar, Clock, Timer
}

export const StatusIcons = {
  Zap, Rocket, Lightbulb, Heart, ThumbsUp, ThumbsDown, CheckCircle2
}
