/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
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
  // Performance optimizations
  experimental: {
    // optimizeCss: true, // Disabled due to critters dependency issue
    optimizeServerReact: true,
  },
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Bundle analyzer for debugging
  ...(process.env.ANALYZE === 'true' && {
    experimental: {
      bundlePagesRouterDependencies: true,
    },
  }),
}

module.exports = nextConfig
