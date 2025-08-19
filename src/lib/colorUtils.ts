// Color utility functions to ensure consistent color usage across the app

// Main button style variants that use design system colors
export const buttonVariants = {
  // Primary actions - uses brand color (red)
  primary: "bg-brand hover:bg-brand-hover text-brand-foreground",
  
  // Secondary actions - uses muted colors  
  secondary: "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
  
  // Destructive actions - uses destructive color
  destructive: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
  
  // Success actions - uses success color
  success: "bg-success hover:bg-success/90 text-success-foreground",
  
  // Warning actions - uses warning color
  warning: "bg-warning hover:bg-warning/90 text-warning-foreground",
  
  // Outline variant
  outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
  
  // Ghost variant
  ghost: "hover:bg-accent hover:text-accent-foreground",
  
  // Muted variant
  muted: "bg-muted hover:bg-muted/80 text-muted-foreground"
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
  // Old blue buttons should become primary (brand red)
  'bg-blue-600 hover:bg-blue-700': buttonVariants.primary,
  'bg-blue-500 hover:bg-blue-600': buttonVariants.primary,
  
  // Purple stays as accent color for AI features
  'bg-purple-600 hover:bg-purple-700': 'bg-purple-600 hover:bg-purple-700', // Keep for AI features
  
  // Green becomes success variant
  'bg-green-600 hover:bg-green-700': buttonVariants.success,
  
  // Red becomes destructive
  'bg-red-600 hover:bg-red-700': buttonVariants.destructive,
  
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
