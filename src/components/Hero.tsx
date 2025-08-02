import Link from 'next/link'
import { LinkButton } from '@/components/ui/LinkButton'
import { Container, Section } from '@/components/ui/Layout'
import { ElevatedCard, StatCard } from '@/components/ui/ElevatedCard'
import { HeroHeading, Badge } from '@/components/ui/Typography'

// Modern geometric elements for visual appeal
const GeometricPattern = () => (
  <div className="absolute inset-0 opacity-5 pointer-events-none">
    <div className="absolute top-20 left-10 w-32 h-32 border border-foreground transform rotate-45" />
    <div className="absolute top-40 right-20 w-24 h-24 bg-primary transform rotate-12 opacity-20" />
    <div className="absolute bottom-32 left-1/4 w-16 h-16 border-2 border-border rounded-full" />
    <div className="absolute bottom-20 right-1/3 w-20 h-20 bg-foreground transform rotate-45 opacity-10" />
  </div>
)

export default function Hero() {
  return (
    <Section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <GeometricPattern />
      
      <Container className="text-center py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-8">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            #1 Learning Platform
          </Badge>
          
          <HeroHeading className="mb-6">
            Master Any Subject with
            <span className="block text-red-600 mt-2">
              Interactive Learning
            </span>
            <span className="block text-gray-900">
              & Expert Courses
            </span>
          </HeroHeading>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
            From languages and academics to professional skills and test preparation. 
            Discover personalized learning paths designed by industry experts.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <LinkButton href="/courses" size="lg" className="text-lg">
              Explore Courses
              <span aria-hidden="true" className="text-2xl">→</span>
            </LinkButton>
            <LinkButton href="/quizzes" variant="outline" size="lg" className="text-lg">
              Start Practicing
              <span aria-hidden="true" className="text-2xl">📝</span>
            </LinkButton>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-20">
            <StatCard value="10K+" label="Active Learners" highlight />
            <StatCard value="500+" label="Practice Questions" />
            <StatCard value="50+" label="Expert Courses" />
            <StatCard value="95%" label="Success Rate" highlight />
          </div>

          {/* Learning Dashboard Preview */}
          <div className="mt-16 max-w-5xl mx-auto">
            <ElevatedCard className="p-8 transform hover:scale-105 transition-all duration-500">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">Learning Dashboard</h3>
                    <p className="text-gray-600">Your personalized learning journey</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 font-medium">Today</div>
              </div>
              
              {/* Course Progress Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <ElevatedCard className="hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-gray-900">Web Development</span>
                    <span className="text-sm text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-red-600 h-3 rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
                  </div>
                </ElevatedCard>
                
                <ElevatedCard className="hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-gray-900">Data Science</span>
                    <span className="text-sm text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full">72%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-red-600 h-3 rounded-full transition-all duration-500" style={{ width: '72%' }}></div>
                  </div>
                </ElevatedCard>
              </div>
              
              {/* Achievement Section */}
              <div className="flex items-center gap-4 p-6 bg-gray-900 rounded-xl text-white">
                <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">🏆</span>
                </div>
                <div>
                  <div className="font-bold text-lg">Congratulations!</div>
                  <div className="text-gray-300">You completed 5 lessons this week</div>
                </div>
              </div>
            </ElevatedCard>
          </div>
        </div>
      </Container>
    </Section>
  )
}
