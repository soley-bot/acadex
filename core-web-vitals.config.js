// Core Web Vitals optimization configuration - Week 2 Day 4
// Implements image optimization and performance monitoring

import { NextConfig } from 'next'

export const coreWebVitalsConfig = {
  // Image optimization settings
  images: {
    // Enable modern formats
    formats: ['image/avif', 'image/webp'],
    // Optimize loading
    loader: 'default',
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    // Device-specific sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable blur placeholders
    placeholder: 'blur',
    quality: 85,
  },

  // Performance monitoring headers
  performanceHeaders: {
    'X-DNS-Prefetch-Control': 'on',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  },

  // Resource hints for critical resources
  resourceHints: [
    {
      rel: 'preload',
      href: '/fonts/inter-var.woff2',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous'
    },
    {
      rel: 'dns-prefetch',
      href: '//fonts.googleapis.com'
    },
    {
      rel: 'dns-prefetch', 
      href: '//api.supabase.co'
    }
  ],

  // Critical CSS optimization
  inlineCriticalCSS: true,
  
  // Bundle optimization thresholds
  bundleOptimization: {
    // Warn if main bundle exceeds 2MB
    mainBundleWarning: 2 * 1024 * 1024,
    // Error if any chunk exceeds 4MB
    chunkSizeLimit: 4 * 1024 * 1024,
    // Target LCP under 2.5s
    lcpTarget: 2500,
    // Target FID under 100ms
    fidTarget: 100,
    // Target CLS under 0.1
    clsTarget: 0.1
  },

  // Code splitting configuration
  codeSplitting: {
    // Split admin routes
    adminChunks: true,
    // Split vendor libraries
    vendorSplitting: true,
    // Route-based splitting
    routeBasedSplitting: true,
    // Dynamic imports threshold (components over 100KB)
    dynamicImportThreshold: 100 * 1024
  }
}

export default coreWebVitalsConfig