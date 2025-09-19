import { createTheme } from '@mantine/core'

export const theme = createTheme({
  // Your brand color (matches your theme-color in metadata)
  primaryColor: 'red',
  
  // Font configuration (using your existing Inter font)
  fontFamily: 'var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  headings: {
    fontFamily: 'var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    sizes: {
      h1: { fontSize: '2.25rem', fontWeight: '700', lineHeight: '2.5rem' },
      h2: { fontSize: '1.875rem', fontWeight: '600', lineHeight: '2.25rem' },
      h3: { fontSize: '1.5rem', fontWeight: '600', lineHeight: '2rem' },
      h4: { fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.75rem' },
      h5: { fontSize: '1.125rem', fontWeight: '500', lineHeight: '1.75rem' },
      h6: { fontSize: '1rem', fontWeight: '500', lineHeight: '1.5rem' },
    }
  },

  // Color scheme (matches your red theme)
  colors: {
    brand: [
      '#fef2f2', // red-50
      '#fee2e2', // red-100  
      '#fecaca', // red-200
      '#fca5a5', // red-300
      '#f87171', // red-400
      '#ef4444', // red-500
      '#dc2626', // red-600 (your theme color)
      '#b91c1c', // red-700
      '#991b1b', // red-800
      '#7f1d1d', // red-900
    ],
  },

  // Default spacing and sizes
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem', 
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
  },

  // Component defaults
  components: {
    Button: {
      defaultProps: {
        size: 'md',
        radius: 'sm',
      },
    },
    
    TextInput: {
      defaultProps: {
        size: 'md',
        radius: 'sm',
      },
    },

    Select: {
      defaultProps: {
        size: 'md',
        radius: 'sm',
      },
    },

    Textarea: {
      defaultProps: {
        size: 'md',
        radius: 'sm',
      },
    },

    Card: {
      defaultProps: {
        shadow: 'sm',
        withBorder: true,
        radius: 'md',
        padding: 'lg',
      },
    },

    Paper: {
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
        padding: 'md',
      },
    },

    Modal: {
      defaultProps: {
        size: 'md',
        radius: 'md',
        overlayProps: {
          opacity: 0.55,
          blur: 3,
        },
      },
    },
  },

  // Breakpoints (matches Tailwind defaults)
  breakpoints: {
    xs: '30em',  // 480px
    sm: '48em',  // 768px  
    md: '64em',  // 1024px
    lg: '80em',  // 1280px
    xl: '90em',  // 1440px
  },
})