import Hero from '@/components/Hero'
import Features from '@/components/Features'
import PopularCourses from '@/components/PopularCourses'
import QuizPreview from '@/components/QuizPreview'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      
      {/* Features Section with accent background */}
      <div className="section-divider section-accent">
        <Features />
      </div>
      
      {/* Quiz Section */}
      <div className="section-divider">
        <QuizPreview />
      </div>
      
      {/* Popular Courses Section with accent background */}
      <div className="section-divider section-accent">
        <PopularCourses />
      </div>
    </div>
  )
}
