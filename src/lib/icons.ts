export const RECOMMENDED_ICONS = {
  // Core Navigation
  home: '/Icons8/icons8-home-100.png',
  user: '/Icons8/icons8-user-100.png', 
  courses: '/Icons8/icons8-bookmark-100.png', // Using bookmark as book substitute
  
  // Essential Actions
  search: '/Icons8/icons8-search-100.png',
  logout: '/Icons8/icons8-logout-100.png', // May not exist, fallback needed
  settings: '/Icons8/icons8-settings-100.png',
  
  // Content & Media
  play: '/Icons8/icons8-play-100.png', // May not exist, fallback needed
  time: '/Icons8/icons8-clock-100.png',
  
  // Additional available icons
  document: '/Icons8/icons8-document-100.png',
  briefcase: '/Icons8/icons8-briefcase-100.png',
  folder: '/Icons8/icons8-folder-50.png',
  services: '/Icons8/icons8-services-50.png',
} as const

export type IconName = keyof typeof RECOMMENDED_ICONS

export const getIconPath = (iconName: IconName): string => {
  return RECOMMENDED_ICONS[iconName]
}

// Type-safe icon usage
export interface IconConfig {
  name: IconName
  size?: number
  variant?: 'default' | 'white' | 'red'
  className?: string
}

// Common icon sizes for consistency
export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const

export type IconSize = keyof typeof ICON_SIZES

export const getIconSize = (size: IconSize): number => {
  return ICON_SIZES[size]
}

// Icon variants for different contexts
export const ICON_VARIANTS = {
  default: 'default',
  white: 'white',
  red: 'red',
} as const

export type IconVariant = keyof typeof ICON_VARIANTS

// Usage examples and best practices
export const ICON_USAGE_GUIDE = {
  navigation: {
    size: 'md' as IconSize,
    variant: 'default' as IconVariant,
    description: 'Use for main navigation items'
  },
  buttons: {
    size: 'sm' as IconSize,
    variant: 'default' as IconVariant,
    description: 'Use for button icons'
  },
  hero: {
    size: '2xl' as IconSize,
    variant: 'default' as IconVariant,
    description: 'Use for large feature sections'
  },
  inline: {
    size: 'sm' as IconSize,
    variant: 'default' as IconVariant,
    description: 'Use inline with text'
  }
} as const
