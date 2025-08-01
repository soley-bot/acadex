import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ConditionalLayout } from '@/components/ConditionalLayout'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Acadex - Learn & Practice',
  description: 'Modern platform for quiz practice and online course enrollment. Master English with expert-led courses and interactive quizzes.',
  keywords: ['english learning', 'online courses', 'quiz practice', 'education', 'language learning'],
  authors: [{ name: 'Acadex Team' }],
  creator: 'Acadex',
  publisher: 'Acadex',
  metadataBase: new URL('https://acadex.academy'),
  icons: {
    icon: [
      { url: '/icon', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Acadex - English Learning Platform',
    description: 'Master English with expert-led courses and interactive quizzes. Join thousands of learners improving their skills.',
    url: 'https://acadex.academy',
    siteName: 'Acadex',
    images: [
      {
        url: '/opengraph-image',
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
    images: ['/opengraph-image'],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#171717" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <style>{`
html {
  font-family: ${inter.style.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  --font-inter: ${inter.style.fontFamily};
}
        `}</style>
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
