// SVG Icon Configuration for Acadex
// Maps semantic icon names to SVG files in /public/svgicon/

export interface SvgIconConfig {
  name: string
  description: string
  filename: string
}

export const SVG_ICONS: Record<string, SvgIconConfig> = {
  // Navigation & Core
  home: {
    name: 'Home',
    description: 'Dashboard, main page',
    filename: 'home-svgrepo-com'
  },
  user: {
    name: 'User Profile',
    description: 'Single user, profile, account',
    filename: 'user-svgrepo-com'
  },
  users: {
    name: 'Users',
    description: 'Multiple users, community',
    filename: 'users-svgrepo-com'
  },
  search: {
    name: 'Search',
    description: 'Search functionality',
    filename: 'search-svgrepo-com'
  },
  settings: {
    name: 'Settings',
    description: 'Configuration, preferences',
    filename: 'cog-svgrepo-com'
  },
  menu: {
    name: 'Menu',
    description: 'Navigation menu, hamburger',
    filename: 'bars-svgrepo-com'
  },

  // Course & Content
  book: {
    name: 'Book/Course',
    description: 'Courses, learning materials',
    filename: 'book-svgrepo-com'
  },
  bookmark: {
    name: 'Bookmark',
    description: 'Saved items, favorites',
    filename: 'bookmark-svgrepo-com'
  },
  briefcase: {
    name: 'Business',
    description: 'Professional, work-related',
    filename: 'briefcase-svgrepo-com'
  },
  box: {
    name: 'Package',
    description: 'Resources, materials',
    filename: 'box-svgrepo-com'
  },
  image: {
    name: 'Image',
    description: 'Media, pictures',
    filename: 'image-svgrepo-com'
  },
  paperclip: {
    name: 'Attachment',
    description: 'Files, attachments',
    filename: 'paperclip-svgrepo-com'
  },
  file: {
    name: 'File',
    description: 'Documents, files',
    filename: 'file-svgrepo-com'
  },

  // Actions & Status
  plus: {
    name: 'Add',
    description: 'Create new, add item',
    filename: 'plus-circle-svgrepo-com'
  },
  check: {
    name: 'Success',
    description: 'Completed, verified',
    filename: 'check-circle-svgrepo-com'
  },
  eye: {
    name: 'View',
    description: 'Show, preview',
    filename: 'eye-svgrepo-com'
  },
  eyeSlash: {
    name: 'Hide',
    description: 'Hide, private',
    filename: 'eye-slash-svgrepo-com'
  },
  edit: {
    name: 'Edit',
    description: 'Modify, update',
    filename: 'user-edit-svgrepo-com'
  },
  fileEdit: {
    name: 'File Edit',
    description: 'Edit file, modify document',
    filename: 'file-edit-svgrepo-com'
  },
  ban: {
    name: 'Delete/Ban',
    description: 'Remove, restrict',
    filename: 'ban-svgrepo-com'
  },
  trash: {
    name: 'Delete',
    description: 'Remove, delete',
    filename: 'trash-svgrepo-com'
  },
  save: {
    name: 'Save',
    description: 'Save, store',
    filename: 'save-svgrepo-com'
  },

  // Time & Progress
  clock: {
    name: 'Time',
    description: 'Duration, schedule',
    filename: 'clock-svgrepo-com'
  },
  stopwatch: {
    name: 'Timer',
    description: 'Timed activities, countdown',
    filename: 'stopwatch-svgrepo-com'
  },
  history: {
    name: 'History',
    description: 'Past activities, timeline',
    filename: 'history-svgrepo-com'
  },
  refresh: {
    name: 'Refresh',
    description: 'Reload, update',
    filename: 'refresh-svgrepo-com (1)'
  },

  // Analytics & Data
  chart: {
    name: 'Analytics',
    description: 'Statistics, charts',
    filename: 'chart-line-svgrepo-com'
  },
  dollar: {
    name: 'Money',
    description: 'Pricing, revenue',
    filename: 'dollar-svgrepo-com'
  },

  // System & Controls
  power: {
    name: 'Power',
    description: 'On/off, power control',
    filename: 'power-off-svgrepo-com'
  },
  lock: {
    name: 'Locked',
    description: 'Security, private',
    filename: 'lock-svgrepo-com'
  },
  unlock: {
    name: 'Unlocked',
    description: 'Open access',
    filename: 'lock-open-svgrepo-com'
  },
  key: {
    name: 'Key',
    description: 'Access, authentication',
    filename: 'key-svgrepo-com'
  },
  signIn: {
    name: 'Sign In',
    description: 'Login, enter',
    filename: 'sign-in-svgrepo-com'
  },
  signOut: {
    name: 'Sign Out',
    description: 'Logout, exit',
    filename: 'sign-out-svgrepo-com'
  },

  // Navigation Controls
  angleLeft: {
    name: 'Previous',
    description: 'Go back, previous page',
    filename: 'angle-left-svgrepo-com'
  },
  angleRight: {
    name: 'Next',
    description: 'Go forward, next page',
    filename: 'angle-right-svgrepo-com'
  },

  // Utilities
  info: {
    name: 'Information',
    description: 'Help, details',
    filename: 'info-circle-svgrepo-com'
  },
  warning: {
    name: 'Warning',
    description: 'Alert, caution',
    filename: 'exclamation-circle-svgrepo-com'
  },
  question: {
    name: 'Question',
    description: 'Help, question',
    filename: 'question-circle-svgrepo-com'
  },
  gift: {
    name: 'Gift',
    description: 'Rewards, bonuses',
    filename: 'gift-svgrepo-com'
  },
  heart: {
    name: 'Favorite',
    description: 'Like, favorite',
    filename: 'heart-svgrepo-com'
  },
  thumbsUp: {
    name: 'Approve',
    description: 'Like, approve',
    filename: 'thumbs-up-svgrepo-com'
  },
  thumbsDown: {
    name: 'Disapprove',
    description: 'Dislike, disapprove',
    filename: 'thumbs-down-svgrepo-com'
  },
  filter: {
    name: 'Filter',
    description: 'Filter, sort',
    filename: 'filter-svgrepo-com'
  },
  filterSlash: {
    name: 'Clear Filter',
    description: 'Clear filter, show all',
    filename: 'filter-slash-svgrepo-com'
  },
  
  // Additional Tools
  wrench: {
    name: 'Tools',
    description: 'Settings, tools',
    filename: 'wrench-svgrepo-com'
  },
  bolt: {
    name: 'Performance',
    description: 'Speed, performance',
    filename: 'bolt-svgrepo-com'
  },
  code: {
    name: 'Code',
    description: 'Programming, code',
    filename: 'code-svgrepo-com'
  },
  cartPlus: {
    name: 'Add to Cart',
    description: 'Shopping, add to cart',
    filename: 'cart-plus-svgrepo-com'
  },
  facebook: {
    name: 'Facebook',
    description: 'Social media, Facebook',
    filename: 'facebook-svgrepo-com'
  },
  spinner: {
    name: 'Loading',
    description: 'Loading, spinner',
    filename: 'spinner-svgrepo-com'
  },
  pause: {
    name: 'Pause',
    description: 'Pause, stop',
    filename: 'pause-svgrepo-com'
  },
  slidersH: {
    name: 'Horizontal Settings',
    description: 'Settings, controls',
    filename: 'sliders-h-svgrepo-com'
  },
  slidersV: {
    name: 'Vertical Settings',
    description: 'Settings, controls',
    filename: 'sliders-v-svgrepo-com'
  },
  ellipsisH: {
    name: 'More Horizontal',
    description: 'More options, menu',
    filename: 'ellipsis-h-svgrepo-com'
  },
  ellipsisV: {
    name: 'More Vertical',
    description: 'More options, menu',
    filename: 'ellipsis-v-svgrepo-com'
  },
  userPlus: {
    name: 'Add User',
    description: 'Add user, invite',
    filename: 'user-plus-svgrepo-com'
  },
  userMinus: {
    name: 'Remove User',
    description: 'Remove user, block',
    filename: 'user-minus-svgrepo-com'
  }
}

// Helper function to get SVG icon path
export const getSvgIconPath = (iconKey: string): string => {
  const icon = SVG_ICONS[iconKey]
  return icon ? `/svgicon/${icon.filename}.svg` : '/svgicon/home-svgrepo-com.svg'
}

// Get all available icon keys
export const getAvailableIcons = (): string[] => {
  return Object.keys(SVG_ICONS)
}

// Size constants
export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32
} as const

export type IconSize = keyof typeof ICON_SIZES
export type IconKey = keyof typeof SVG_ICONS
