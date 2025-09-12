import Hero from '@/components/Hero'
import Features from '@/components/Features'
import HonestSection from '@/components/HonestSection'
import { Section } from '@/components/ui/Layout'
import { Metadata } from 'next'
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Acadex - Master Your IELTS Score with Targeted Quizzes',
  description: 'Stop making the small mistakes holding back your IELTS score. Acadex offers expert-verified quizzes to help Cambodian students master the vocabulary and grammar needed for a Band 7.5+.',
  keywords: [
    'ielts preparation cambodia',
    'ielts writing practice',
    'ielts vocabulary',
    'ielts grammar quiz',
    'get ielts band 7.5',
    'soley heng ielts',
    'online ielts practice',
    'cambodia ielts test prep'
  ],
  openGraph: {
    title: 'Acadex - The Smarter Way to Prepare for IELTS',
    description: 'Fix the foundational errors that are holding back your score. Targeted, expert-verified quizzes for Cambodian students aiming high.',
    url: 'https://acadex.com',
    siteName: 'Acadex',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image-ielts.jpg', // Recommended: Create a new OG image for this specific focus
        width: 1200,
        height: 630,
        alt: 'Acadex - IELTS Quiz Preparation Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acadex - Master Your IELTS Score',
    description: 'Targeted, expert-verified quizzes to help Cambodian students fix common mistakes and boost their IELTS score.',
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
  } catch (error) {
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
      
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-warning/30 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-6000"></div>
      </div>
      
      <Hero />
      
      <Features />
      
      <HonestSection />
      </div>
    </>
  )
}
