// Color utility functions to ensure consistent color usage across the app

// Main button style variants that use design system colors
export const buttonVariants = {
  // Primary actions - primary background with black text, secondary background with white text on hover
  primary: "bg-primary hover:bg-secondary text-black hover:text-white",
  
  // Secondary actions - uses muted colors  
  secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
  
  // Destructive actions - uses destructive color
  destructive: "bg-red-600 hover:bg-red-700 text-white",
  
  // Success actions - uses success color
  success: "bg-green-600 hover:bg-green-700 text-white",
  
  // Warning actions - uses warning color
  warning: "bg-yellow-500 hover:bg-yellow-600 text-white",
  
  // Outline variant
  outline: "border-2 border-primary text-primary bg-white hover:bg-primary hover:text-black",
  
  // Ghost variant
  ghost: "bg-transparent text-primary hover:bg-primary hover:text-black",
  
  // Muted variant
  muted: "bg-gray-100 hover:bg-gray-200 text-gray-700"
}

// Text color variants using design system
export const textVariants = {
  primary: "text-primary",
  secondary: "text-secondary", 
  tertiary: "text-tertiary",
  disabled: "text-disabled",
  inverse: "text-inverse"
}

// Background variants using design system
export const backgroundVariants = {
  primary: "surface-primary",
  secondary: "surface-secondary", 
  tertiary: "surface-tertiary",
  elevated: "surface-elevated"
}

// Border variants using design system
export const borderVariants = {
  subtle: "border-subtle",
  default: "border-default",
  emphasis: "border-emphasis", 
  focus: "border-focus"
}

// Utility function to get consistent button classes
export function getButtonClasses(
  variant: keyof typeof buttonVariants = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md',
  additionalClasses?: string
) {
  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
  
  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 py-2", 
    lg: "h-12 px-6 py-3 text-lg"
  }
  
  return [
    baseClasses,
    buttonVariants[variant],
    sizeClasses[size],
    additionalClasses
  ].filter(Boolean).join(' ')
}

// Helper to migrate old hardcoded colors to design system
export const colorMigrations = {
  // All primary buttons should use primary → secondary hover pattern
  'bg-secondary hover:bg-blue-700': buttonVariants.primary,
  'bg-blue-500 hover:bg-secondary': buttonVariants.primary,
  'bg-purple-600 hover:bg-purple-700': buttonVariants.primary,
  'bg-green-600 hover:bg-green-700': buttonVariants.primary,
  
  // Success and destructive keep their specific colors
  'bg-success hover:bg-success/90': buttonVariants.success,
  'bg-primary hover:bg-primary/90': buttonVariants.destructive,
  
  // Gray becomes secondary
  'bg-gray-100 hover:bg-gray-200': buttonVariants.secondary,
  'bg-gray-600 hover:bg-gray-700': buttonVariants.secondary,
  
  // Text colors
  'text-gray-600': textVariants.secondary,
  'text-gray-700': textVariants.primary,
  'text-gray-500': textVariants.tertiary,
  'text-gray-400': textVariants.disabled,
  'text-black': textVariants.primary,
  'text-white': textVariants.inverse
}
