import { createTheme } from '@mantine/core'

export const theme = createTheme({
  // Primary brand color - Academic Purple
  primaryColor: 'acadexPurple',
  // Default radius for consistent design
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

  // ENHANCED: Brand Color System with Primary & Secondary
  colors: {
    // Primary Brand Color - Acadex Purple
    acadexPurple: [
      '#f9f8ff', // 0 - lightest tint
      '#f3f2ff', // 1 - very light
      '#e8e5ff', // 2 - light
      '#d1c9ff', // 3 - medium light  
      '#bdb1ff', // 4 - medium
      '#4f46e5', // 5 - PRIMARY BRAND COLOR
      '#4338ca', // 6 - medium dark
      '#3730a3', // 7 - dark
      '#312e81', // 8 - darker
      '#1e1b4b', // 9 - darkest shade
    ],
    
    // Secondary Color - Academic Violet for accents
    acadexViolet: [
      '#faf9ff', // 0 - lightest
      '#f5f3ff', // 1 - very light
      '#ede9fe', // 2 - light
      '#ddd6fe', // 3 - medium light
      '#c4b5fd', // 4 - medium
      '#6d28d9', // 5 - SECONDARY BRAND COLOR
      '#5b21b6', // 6 - medium dark
      '#4c1d95', // 7 - dark
      '#3c1a78', // 8 - darker
      '#2d1b69', // 9 - darkest
    ],

    // Keep original red for backward compatibility
    red: [
      '#fff5f5', '#fed7d7', '#feb2b2', '#fc8181', '#f56565',
      '#e53e3e', '#c53030', '#9b2c2c', '#822727', '#63171b',
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

  // ENHANCED: Professional component styling with brand colors
  components: {
    Button: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
      styles: {
        root: {
          '--mantine-shadow-xs': '0 1px 2px rgba(0, 0, 0, 0.05)',
          '--mantine-shadow-sm': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        }
      }
    },
    
    TextInput: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
      styles: {
        input: {
          border: '1px solid var(--mantine-color-gray-3)',
          '&:focus': {
            borderColor: 'var(--mantine-color-acadexPurple-5)',
            boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.2)',
          },
        }
      }
    },

    Select: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
      styles: {
        input: {
          '&:focus': {
            borderColor: 'var(--mantine-color-acadexPurple-5)',
            boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.2)',
          },
        }
      }
    },

    Textarea: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
      styles: {
        input: {
          '&:focus': {
            borderColor: 'var(--mantine-color-acadexPurple-5)',
            boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.2)',
          },
        }
      }
    },

    Card: {
      defaultProps: {
        shadow: 'sm',
        withBorder: true,
        radius: 'md',
        padding: 'lg',
      },
      styles: {
        root: {
          borderColor: 'var(--mantine-color-gray-2)',
          transition: 'all 0.15s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: 'var(--mantine-shadow-md)',
          },
        }
      }
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
      styles: {
        header: {
          borderBottom: '1px solid var(--mantine-color-gray-2)',
          paddingBottom: 'var(--mantine-spacing-md)',
          marginBottom: 'var(--mantine-spacing-md)',
        }
      }
    },

    Menu: {
      defaultProps: {
        radius: 'md',
        shadow: 'md',
      },
      styles: {
        dropdown: {
          borderColor: 'var(--mantine-color-gray-2)',
        }
      }
    },

    Badge: {
      defaultProps: {
        radius: 'md',
        variant: 'light',
      },
    },

    // Enhanced Navbar styling
    NavLink: {
      styles: {
        root: {
          borderRadius: 'var(--mantine-radius-md)',
          '&[data-active]': {
            backgroundColor: 'var(--mantine-color-acadexRed-0)',
            color: 'var(--mantine-color-acadexRed-7)',
            borderLeft: '3px solid var(--mantine-color-acadexRed-5)',
          },
          '&:hover': {
            backgroundColor: 'var(--mantine-color-gray-0)',
          },
        }
      }
    },

    // Stats and metrics styling  
    RingProgress: {
      styles: {
        root: {
          '--ring-color': 'var(--mantine-color-acadexRed-5)',
        }
      }
    },

    Progress: {
      styles: {
        root: {
          '--progress-color': 'var(--mantine-color-acadexRed-5)',
        }
      }
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