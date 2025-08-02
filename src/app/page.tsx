import Hero from '@/components/Hero'
import Features from '@/components/Features'
import PopularCourses from '@/components/PopularCourses'
import QuizPreview from '@/components/QuizPreview'

export default function Home() {
  return (
    <div className="content-wrapper">
      <Hero />
      
      {/* Features Section */}
      <div className="alternate-section">
        <Features />
      </div>
      
      {/* Quiz Section */}
      <div className="content-section">
        <QuizPreview />
      </div>
      
      {/* Popular Courses Section */}
      <div className="alternate-section">
        <PopularCourses />
      </div>
    </div>
  )
}
