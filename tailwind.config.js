/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          foreground: 'hsl(var(--brand-foreground))'
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))'
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))'
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      },
      fontFamily: {
        'inter': ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      fontSize: {
        // Responsive typography system
        'xs': ['0.75rem', { lineHeight: '1rem' }],        // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],    // 14px  
        'base': ['1rem', { lineHeight: '1.5rem' }],       // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],   // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],     // 36px
        '5xl': ['3rem', { lineHeight: '1' }],             // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],          // 60px
        '7xl': ['4.5rem', { lineHeight: '1' }],           // 72px
        
        // Mobile-first responsive typography
        'display-sm': ['clamp(1.875rem, 4vw, 2.25rem)', { lineHeight: '1.2' }],  // 30px-36px
        'display-md': ['clamp(2.25rem, 5vw, 3rem)', { lineHeight: '1.1' }],      // 36px-48px  
        'display-lg': ['clamp(3rem, 6vw, 4.5rem)', { lineHeight: '1' }],         // 48px-72px
        'display-xl': ['clamp(3.75rem, 8vw, 6rem)', { lineHeight: '0.9' }],      // 60px-96px
        
        // Body text with responsive scaling
        'body-sm': ['clamp(0.875rem, 2vw, 1rem)', { lineHeight: '1.6' }],        // 14px-16px
        'body-md': ['clamp(1rem, 2.5vw, 1.125rem)', { lineHeight: '1.6' }],      // 16px-18px
        'body-lg': ['clamp(1.125rem, 3vw, 1.25rem)', { lineHeight: '1.5' }],     // 18px-20px
      },
      screens: {
        // Mobile-first breakpoints following best practices
        'xs': '320px',    // Small mobile
        'sm': '640px',    // Mobile landscape / small tablet
        'md': '768px',    // Tablet
        'lg': '1024px',   // Small desktop
        'xl': '1280px',   // Desktop
        '2xl': '1536px',  // Large desktop
      },
      spacing: {
        // Responsive spacing system
        'section-sm': 'clamp(3rem, 6vw, 4rem)',      // 48px-64px
        'section-md': 'clamp(4rem, 8vw, 6rem)',      // 64px-96px  
        'section-lg': 'clamp(6rem, 10vw, 8rem)',     // 96px-128px
        'container-px': 'clamp(1rem, 4vw, 1.5rem)',  // 16px-24px
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
