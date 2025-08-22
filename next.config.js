/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  // Force new build ID to invalidate all caches
  generateBuildId: async () => {
    return `build-${Date.now()}-${Math.random().toString(36).substring(7)}`
  },
  
  // Headers to prevent aggressive caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          }
        ]
      }
    ]
  },

  // App Router is now stable in Next.js 15, no experimental flag needed
  eslint: {
    // Enable ESLint during builds
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable TypeScript checking during builds
    ignoreBuildErrors: false,
  },
  // Webpack configuration for better cache handling
  webpack: (config, { dev, isServer }) => {
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

module.exports = nextConfig
