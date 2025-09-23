/** @type {import('next').NextConfig} */
const path = require('path')

// Bundle analyzer setup
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // Force new build ID to invalidate static assets only
  generateBuildId: async () => {
    return 'acadex-build'
  },

  eslint: {
    ignoreDuringBuilds: false,
  },

  // Keep experimental features that work
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@radix-ui/react-icons',
      'recharts',
      'tailwind-merge'
    ],
    optimizeServerReact: true,
    optimizeCss: false,
  },

  // Safe image optimization
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
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Simplified, safer webpack config
  webpack: (config, { dev, isServer }) => {
    // Only add safe optimizations
    config.watchOptions = {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/.next/**'
      ]
    }

    // Disable problematic optimizations in development
    if (dev && !isServer) {
      // Prevent webpack from corrupting JavaScript output
      config.optimization.splitChunks = false
      config.optimization.minimize = false
    }

    return config
  },

  // Safe production optimizations only
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
}

module.exports = withBundleAnalyzer(nextConfig)