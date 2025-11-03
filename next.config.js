/** @type {import('next').NextConfig} */

// Bundle analyzer setup (optional)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // Essential configurations only
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Essential experimental features
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-*',
      'tailwind-merge'
    ],
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Redirects for SEO
  async redirects() {
    return [
      // Redirect trailing slashes to non-trailing slash URLs
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
      // Common old URL patterns (add your specific ones here)
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/auth',
        permanent: true,
      },
      {
        source: '/signin',
        destination: '/auth',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/auth',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth',
        permanent: true,
      },
    ]
  },
}

module.exports = withBundleAnalyzer(nextConfig)