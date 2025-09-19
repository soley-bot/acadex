/** @type {import('next').NextConfig} */
const path = require('path')

// Bundle analyzer setup
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // Force new build ID to invalidate static assets only
  generateBuildId: async () => {
    // Use simpler build ID for faster builds
    return 'acadex-build'
  },

  // App Router is now stable in Next.js 15, no experimental flag needed
  eslint: {
    // Enable ESLint during builds for better code quality
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable TypeScript checking during builds but optimize
    ignoreBuildErrors: false,
  },

  // Phase 3: Performance optimizations + Week 2 Day 4 Bundle Optimization
  experimental: {
    // Optimize package imports to reduce bundle size - Week 2 Day 4 enhancement
    optimizePackageImports: [
      'lucide-react',
      '@tanstack/react-query',
      '@tanstack/react-query-devtools',
      'react-hook-form',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-toast',
      '@radix-ui/react-tabs',
      '@radix-ui/react-accordion',
      'date-fns',
      'clsx',
      'class-variance-authority',
      'tailwind-merge'
    ],
    // Enable server components optimization
    optimizeServerReact: true,
    // Enable CSS optimization
    optimizeCss: true,
  },

  // Turbopack configuration (moved from experimental)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Bundle size optimization
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Enhanced image optimization for Core Web Vitals
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Optimize for Core Web Vitals (LCP)
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
    // Responsive image optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Advanced webpack configuration for Week 2 Day 4 Bundle Optimization
  webpack: (config, { dev, isServer, buildId }) => {
    // Ignore external project folders
    config.watchOptions = {
      ignored: [
        '**/node_modules/**',
        '**/student-dashboard/**',
        '**/.git/**',
        '**/.next/**'
      ]
    }

    if (dev) {
      // Improve cache reliability in development
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: path.resolve(process.cwd(), '.next/cache/webpack'),
      }
    }

    // Advanced bundle splitting optimization for Week 2 Day 4
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 200000, // Limit chunks to 200KB
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          enforceSizeThreshold: 50000,
          cacheGroups: {
            // React core libraries
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              chunks: 'all',
              priority: 30,
              enforce: true,
            },
            
            // Query and state management
            query: {
              test: /[\\/]node_modules[\\/](@tanstack|zustand|jotai)[\\/]/,
              name: 'query',
              chunks: 'all',
              priority: 25,
              enforce: true,
            },
            
            // UI component libraries
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|@headlessui|framer-motion)[\\/]/,
              name: 'ui',
              chunks: 'all',
              priority: 20,
              enforce: true,
            },
            
            // Icons and graphics
            icons: {
              test: /[\\/]node_modules[\\/](lucide-react|@radix-ui\/react-icons)[\\/]/,
              name: 'icons',
              chunks: 'all',
              priority: 15,
              enforce: true,
            },
            
            // Utilities and helpers
            utils: {
              test: /[\\/]node_modules[\\/](date-fns|clsx|class-variance-authority|tailwind-merge|zod)[\\/]/,
              name: 'utils',
              chunks: 'all',
              priority: 10,
              enforce: true,
            },
            
            // Admin-specific components (heavy)
            admin: {
              test: /[\\/]src[\\/](components|app)[\\/]admin[\\/]/,
              name: 'admin',
              chunks: 'async', // Only load when needed
              priority: 20,
              minSize: 50000,
            },
            
            // Quiz components (heavy)
            quiz: {
              test: /[\\/]src[\\/]components[\\/]quiz[\\/]/,
              name: 'quiz',
              chunks: 'async',
              priority: 15,
              minSize: 30000,
            },
            
            // Shared components
            shared: {
              test: /[\\/]src[\\/]components[\\/](ui|cards|navigation)[\\/]/,
              name: 'shared',
              chunks: 'all',
              priority: 10,
              minChunks: 2,
            },
            
            // Default vendor chunk for remaining node_modules
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              chunks: 'all',
              priority: 5,
              minSize: 100000, // Only large vendor packages
              maxSize: 500000, // Split if too large
            },
            
            // Common app code
            common: {
              name: 'common',
              minChunks: 2,
              priority: 1,
              chunks: 'all',
              reuseExistingChunk: true,
            },
          },
        },
        
        // Additional optimizations for Week 2 Day 4
        usedExports: true,
        sideEffects: false,
        concatenateModules: true,
        
        // Module concatenation for better tree shaking
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
      }
      
      // Tree shaking optimizations
      config.resolve.alias = {
        ...config.resolve.alias,
        // Optimize lodash to use ES modules
        'lodash': 'lodash-es',
        // Optimize date-fns imports
        'date-fns': 'date-fns/esm',
      }
    }

    return config
  },
  // Week 2 Day 4: Advanced Bundle and Core Web Vitals Optimization
  compiler: {
    // Remove console.log in production for smaller bundles
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn', 'info']
    } : false,
    // Enable SWC minification for better performance
    styledComponents: true,
    // Remove React DevTools in production
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  // Performance headers for Core Web Vitals
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      },
      // Cache static assets aggressively
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Cache images
      {
        source: '/(.*).\\.(jpg|jpeg|gif|png|svg|ico|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Preload critical resources
      {
        source: '/',
        headers: [
          {
            key: 'Link',
            value: '</manifest.json>; rel=manifest, </sw.js>; rel=serviceworker'
          }
        ]
      }
    ]
  },
}

module.exports = withBundleAnalyzer(nextConfig)
