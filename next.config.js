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

  // Phase 3: Performance optimizations
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      'lucide-react',
      '@tanstack/react-query',
      'react-hook-form'
    ],
  },

  // Bundle size optimization
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Image optimization
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Webpack configuration for better cache handling
  webpack: (config, { dev, isServer }) => {
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

    // Bundle splitting optimization
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
          admin: {
            test: /[\\/]src[\\/](components|app)[\\/]admin[\\/]/,
            name: 'admin',
            priority: 20,
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            chunks: 'all',
            reuseExistingChunk: true,
          },
        },
      }
    }
    return config
  },
  // Experimental features for better performance
  experimental: {
    // Improve Fast Refresh reliability
    optimizePackageImports: ['@/components', '@/lib'],
    // optimizeCss: true, // Disabled due to critters dependency issue
    optimizeServerReact: true,
  },
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
    ],
    // Optimize local images
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
  },
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = withBundleAnalyzer(nextConfig)
