import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/dashboard/',
        '/auth-check',
        '/database-setup',
        '/create-admin',
        '/unauthorized',
        '/test-*',
        '/profile',
        '/progress',
      ],
    },
    sitemap: 'https://acadex.academy/sitemap.xml',
  }
}
