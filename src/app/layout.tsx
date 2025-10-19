import type { Metadata } from 'next'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Toaster } from '@/components/ui/toaster'
import { AppProviders } from '@/components/simplified/AppProviders'
import { LayoutManager } from '@/components/simplified/LayoutManager'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'
import { getOptionalUser } from '@/lib/auth'

// Global styles with consolidated design tokens
import './globals.css'

export const metadata: Metadata = {
  title: 'Acadex - Learn & Practice',
  description: 'Modern platform for quiz practice and online course enrollment. Master English with expert-led courses and interactive quizzes.',
  keywords: ['english learning', 'online courses', 'quiz practice', 'education', 'language learning'],
  authors: [{ name: 'Acadex Team' }],
  creator: 'Acadex',
  publisher: 'Acadex',
  metadataBase: new URL('https://acadex.academy'),
  alternates: {
    canonical: 'https://acadex.academy',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/logo.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'Acadex - English Learning Platform',
    description: 'Master English with expert-led courses and interactive quizzes. Join thousands of learners improving their skills.',
    url: 'https://acadex.academy',
    siteName: 'Acadex',
    images: [
      {
        url: '/og-image-ielts.png',
        width: 1200,
        height: 630,
        alt: 'Acadex - English Learning Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acadex - English Learning Platform',
    description: 'Master English with expert-led courses and interactive quizzes.',
    images: ['/og-image-ielts.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch user on server for initial auth state
  const serverUser = await getOptionalUser()
  
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes" />
      </head>
      <body className="font-sans antialiased">
        <ServiceWorkerRegister />
        <ErrorBoundary>
          <AppProviders serverUser={serverUser}>
            <LayoutManager>
              {children}
            </LayoutManager>
          </AppProviders>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  )
}

