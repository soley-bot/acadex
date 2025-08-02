import Hero from '@/components/Hero'
import Features from '@/components/Features'
import PopularCourses from '@/components/PopularCourses'
import QuizPreview from '@/components/QuizPreview'
import { Section } from '@/components/ui/Layout'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-6000"></div>
      </div>
      
      <Hero />
      
      {/* Features Section */}
      <Section background="glass" spacing="lg">
        <Features />
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
  )
}
