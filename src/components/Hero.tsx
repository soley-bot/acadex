import Link from 'next/link'
import Image from 'next/image'
import { LinkButton } from '@/components/ui/LinkButton'
import { Card, CardContent } from '@/components/ui/card'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'
import { BlobBackground } from '@/components/ui/BlobBackground'
import { BarChart3, Trophy } from 'lucide-react'

export default function Hero() {
  return (
    <Section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-16 md:py-20 lg:py-24"
      background="gradient"
    >
      {/* Standardized Animated Background */}
      <BlobBackground variant="default" />
      
      <Container size="xl" className="relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* Hero Badge */}
            <div className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 mb-8">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span className="font-medium">Made for Cambodian Learners</span>
            </div>
            
            {/* Main Heading - Professional Typography Hierarchy */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Learn Real Skills,
              <span className="block text-primary mt-4">
                Your Way
              </span>
            </h1>
            
            {/* Subtitle - Professional Typography */}
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 md:mb-12">
              Acadex is a growing online platform made for Cambodian students and young professionals. 
              We offer simple lessons and clear explanations — with short videos, friendly visuals, and zero pressure.
            </p>
            
            {/* CTA Buttons - Improved Mobile Layout */}
            <div className="flex flex-col gap-4 md:flex-row md:gap-6 justify-center lg:justify-start items-center mb-12 md:mb-16">
              <Link href="/courses" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-primary hover:bg-secondary text-white hover:text-black px-8 py-4 lg:px-10 lg:py-5 rounded-2xl text-lg lg:text-xl font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 min-w-[240px] flex items-center justify-center">
                  Browse Courses
                  <span className="ml-3 text-xl">→</span>
                </button>
              </Link>
              <Link href="/quizzes" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 lg:px-10 lg:py-5 rounded-2xl text-lg lg:text-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 min-w-[240px] flex items-center justify-center">
                  Try Our Quiz
                  <span className="ml-3">→</span>
                </button>
              </Link>
            </div>
            
            {/* Stats Section - Compact for split layout */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
              <Card variant="glass" className="p-4 transform hover:scale-105 transition-all duration-300">
                <CardContent className="p-0 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">100+</div>
                  <p className="text-xs text-gray-600">Early Learners</p>
                </CardContent>
              </Card>
              <Card variant="glass" className="p-4 transform hover:scale-105 transition-all duration-300">
                <CardContent className="p-0 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">100%</div>
                  <p className="text-xs text-gray-600">Made with Care</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="order-1 lg:order-2">
            <Card variant="glass" className="overflow-hidden transform hover:scale-[1.02] transition-all duration-500">
              <CardContent className="p-0">
                <div className="relative">
                  <Image 
                    src="/images/hero/learning-together.jpg" 
                    alt="Students learning English together - diverse group studying with laptops and books"
                    width={600}
                    height={600}
                    className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover"
                    priority
                  />
                  {/* Overlay with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                  
                  {/* Image Overlay Badge - Copied from quiz page */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                          <span className="font-medium text-foreground">Real Progress</span>
                        </div>
                        <span className="font-bold text-secondary">Daily improvement</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Learning Dashboard Preview - Compact but Full Featured */}
        <div className="mt-12 lg:mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Track Your Progress
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See your improvement with our simple dashboard designed for Cambodian learners
            </p>
          </div>
          
          <Card variant="glass" className="p-4 md:p-6 transform hover:scale-[1.02] transition-all duration-500 max-w-4xl mx-auto">
            <CardContent className="p-0">
              {/* Dashboard Header - More Compact */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-gray-200 gap-3 sm:gap-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-secondary to-secondary/90 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Learning Dashboard</h3>
                    <p className="text-sm text-gray-600">Your personalized learning journey</p>
                  </div>
                </div>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm self-start sm:self-auto">Today</span>
              </div>
              
              {/* Course Progress Grid - Reduced Padding */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card variant="base" className="p-4 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-gray-900">Everyday English</h3>
                      <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-medium">70%</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-primary to-primary/90 h-2.5 rounded-full transition-all duration-500 shadow-sm" style={{ width: '70%' }}></div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card variant="base" className="p-4 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-gray-900">Study Skills</h3>
                      <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-medium">45%</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-primary to-primary/90 h-2.5 rounded-full transition-all duration-500 shadow-sm" style={{ width: '45%' }}></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Achievement Section - More Compact */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/5 via-white to-secondary/5 rounded-xl shadow-lg">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg text-white flex-shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-secondary mb-1">Great progress!</h3>
                  <p className="text-sm text-gray-600">You completed 3 lessons this week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  )
}
