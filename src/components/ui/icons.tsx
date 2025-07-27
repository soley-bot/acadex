import React from 'react'

// Icon component props
interface IconProps {
  size?: number
  className?: string
  strokeWidth?: number
}

// Base icon wrapper
const Icon: React.FC<IconProps & { children: React.ReactNode }> = ({ 
  size = 24, 
  className = '', 
  strokeWidth = 2,
  children 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
)

// Navigation Icons
export const HomeIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </Icon>
)

export const UserIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
)

export const BookIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </Icon>
)

export const PuzzleIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5Z" />
    <path d="M12 5L9 8l3 3 4-4Z" />
    <path d="M12 15v7" />
    <path d="M9 18h6" />
  </Icon>
)

export const InfoIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
)

export const MailIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </Icon>
)

// Action Icons
export const EditIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </Icon>
)

export const DeleteIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2" />
  </Icon>
)

export const PlusIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </Icon>
)

export const EyeIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
)

export const CheckIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="20,6 9,17 4,12" />
  </Icon>
)

export const XIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </Icon>
)

// Learning Icons
export const ClockIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </Icon>
)

export const TargetIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </Icon>
)

export const TrendingUpIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
    <polyline points="16,7 22,7 22,13" />
  </Icon>
)

export const UsersIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
)

// Status Icons
export const PlayIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polygon points="5,3 19,12 5,21" />
  </Icon>
)

export const PauseIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </Icon>
)

export const DownloadIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </Icon>
)

export const StarIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </Icon>
)

// Menu & Navigation
export const MenuIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </Icon>
)

export const ChevronDownIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="6,9 12,15 18,9" />
  </Icon>
)

export const ChevronRightIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="9,18 15,12 9,6" />
  </Icon>
)

export const ArrowLeftIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </Icon>
)

export const ArrowRightIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </Icon>
)

export const LogoutIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <path d="M21 12H9" />
  </Icon>
)

// Export all icons for easy importing
export const Icons = {
  // Navigation
  Home: HomeIcon,
  User: UserIcon,
  Book: BookIcon,
  Puzzle: PuzzleIcon,
  Info: InfoIcon,
  Mail: MailIcon,
  
  // Actions
  Edit: EditIcon,
  Delete: DeleteIcon,
  Plus: PlusIcon,
  Eye: EyeIcon,
  Check: CheckIcon,
  X: XIcon,
  
  // Learning
  Clock: ClockIcon,
  Target: TargetIcon,
  TrendingUp: TrendingUpIcon,
  Users: UsersIcon,
  
  // Status
  Play: PlayIcon,
  Pause: PauseIcon,
  Download: DownloadIcon,
  Star: StarIcon,
  
  // Menu & Navigation
  Menu: MenuIcon,
  ChevronDown: ChevronDownIcon,
  ChevronRight: ChevronRightIcon,
  ArrowLeft: ArrowLeftIcon,
  ArrowRight: ArrowRightIcon,
  Logout: LogoutIcon,
}

export default Icons
