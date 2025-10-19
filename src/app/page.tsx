import Hero from '@/components/Hero'
import Features from '@/components/Features'
import HonestSection from '@/components/HonestSection'
import { Section } from '@/components/ui/Layout'
import { Metadata } from 'next'
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Acadex - Master English in 15 Minutes a Day',
  description: 'Build real English skills with focused micro-quizzes designed by an experienced educator. Perfect for IELTS prep and everyday English mastery.',
  keywords: [
    'english learning online',
    'micro-quizzes english',
    'ielts preparation',
    'english grammar practice',
    'vocabulary builder',
    'learn english efficiently',
    'ielts writing practice',
    'english educator'
  ],
  openGraph: {
    title: 'Acadex - Master English in Just 15 Minutes a Day',
    description: 'Learn English efficiently with educator-designed micro-quizzes. IELTS prep and general English skills in bite-sized lessons.',
    url: 'https://acadex.com',
    siteName: 'Acadex',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image-ielts.jpg',
        width: 1200,
        height: 630,
        alt: 'Acadex - English Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acadex - Master English in 15 Minutes a Day',
    description: 'Build real English skills with educator-designed micro-quizzes. Perfect for IELTS and everyday English.',
    images: ['/og-image-ielts.jpg'],
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

export default function Home() {
  // Temporarily disable structured data to debug the error
  /*
  let schemas: any[] = []

  try {
    const organizationSchema = generateOrganizationSchema()
    const websiteSchema = generateWebsiteSchema()

    // Filter out any null/undefined schema objects and validate them
    const candidateSchemas = [organizationSchema, websiteSchema].filter(schema => {
      return schema &&
             typeof schema === 'object' &&
             schema['@context'] &&
             typeof schema['@context'] === 'string'
    })

    schemas = candidateSchemas
  } catch (error: any) {
    console.error('Error generating schemas:', error)
    schemas = []
  }
  */

  return (
    <>
      {/* Structured Data - temporarily disabled for debugging */}
      {/*
      {schemas.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemas)
          }}
        />
      )}
      */}

      <main className="min-h-screen">
        <Hero />
        <Features />
        <HonestSection />
      </main>
    </>
  )
}

