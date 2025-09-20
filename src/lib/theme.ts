import { createTheme } from '@mantine/core'

export const theme = createTheme({
  // Your brand color (matches your theme-color in metadata)
  primaryColor: 'red',
  defaultRadius: 'md',
  
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

  // ENHANCED: Proper Mantine color palette
  colors: {
    red: [
      '#fff5f5', // 0
      '#fed7d7', // 1
      '#feb2b2', // 2
      '#fc8181', // 3
      '#f56565', // 4
      '#e53e3e', // 5 - main brand
      '#c53030', // 6
      '#9b2c2c', // 7
      '#822727', // 8
      '#63171b', // 9
    ],
    brand: [
      '#fff5f5',
      '#fed7d7', 
      '#feb2b2',
      '#fc8181',
      '#f56565',
      '#e53e3e', // Your theme color
      '#c53030',
      '#9b2c2c',
      '#822727',
      '#63171b',
    ],
  },

  // Enhanced spacing and shadows
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem', 
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
  },

  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
  },

  // ENHANCED: Beautiful component styling like mantine.dev
  components: {
    Button: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
    },
    
    TextInput: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
    },

    Select: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
    },

    Textarea: {
      defaultProps: {
        size: 'md',
        radius: 'md',
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

    Menu: {
      defaultProps: {
        radius: 'md',
        shadow: 'md',
      },
    },

    Badge: {
      defaultProps: {
        radius: 'md',
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