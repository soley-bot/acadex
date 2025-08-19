import Hero from '@/components/Hero'
import Features from '@/components/Features'
import HonestSection from '@/components/HonestSection'
import PopularCourses from '@/components/PopularCourses'
import QuizPreview from '@/components/QuizPreview'
import { Section } from '@/components/ui/Layout'
import { Metadata } from 'next'
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Acadex - Learn Real Skills, Your Way',
  description: 'A growing online platform made for Cambodian students and young professionals. Simple lessons, clear explanations, helpful videos, and zero pressure.',
  keywords: [
    'cambodian online learning',
    'english learning cambodia', 
    'simple lessons cambodia',
    'learn english cambodia',
    'study skills cambodia',
    'career preparation',
    'visual learning videos',
    'pace learning',
    'everyday english',
    'communication skills'
  ],
  openGraph: {
    title: 'Acadex - Learn Real Skills, Your Way',
    description: 'Simple lessons and clear explanations made for Cambodian learners. Short videos, friendly visuals, and zero pressure. Start learning today!',
  },
}

export default function Home() {
  const organizationSchema = generateOrganizationSchema()
  const websiteSchema = generateWebsiteSchema()

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema, websiteSchema])
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-warning/30 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-6000"></div>
      </div>
      
      <Hero />
      
      {/* Features Section */}
      <Section background="glass" spacing="lg">
        <Features />
      </Section>
      
      {/* Honest Section */}
      <Section background="transparent" spacing="lg">
        <HonestSection />
      </Section>
      
      {/* Quiz Section */}
      <Section background="transparent" spacing="lg">
        <QuizPreview />
      </Section>
      
      {/* Popular Courses Section */}
      <Section background="glass" spacing="lg">
        <PopularCourses />
      </Section>
      </div>
    </>
  )
}
