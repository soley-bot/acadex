import Link from 'next/link'
import Image from 'next/image'
import { LinkButton } from '@/components/ui/LinkButton'
import { Card, CardContent } from '@/components/ui/card'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'
import { BlobBackground } from '@/components/ui/BlobBackground'

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
            <div className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 shadow-lg rounded-full mb-8">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              <span className="font-medium">Make Learning More Accessible</span>
            </div>
            
            {/* Main Heading - Professional Typography Hierarchy */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Your Dream Score is  
              <span className="block text-primary mt-4">
                Closer Than You Think.
              </span>
            </h1>
            
            {/* Subtitle - Professional Typography */}
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 md:mb-12">
              It is not about memorizing 500 new words. It is about mastering the right 50. We help you focus on the highest-impact vocabulary and grammar to unlock your potential on the IELTS exam.
            </p>
            
            {/* CTA Buttons - Improved Mobile Layout */}
            <div className="flex flex-col gap-4 md:flex-row md:gap-6 justify-center lg:justify-start items-center mb-12 md:mb-16">
              <Link href="/courses" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-primary hover:bg-secondary text-white hover:text-white px-8 py-4 lg:px-10 lg:py-5 rounded-2xl text-lg lg:text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 min-w-[240px] flex items-center justify-center">
                  Unlock Your Score
                
                </button>
              </Link>
              <Link href="/quizzes" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 lg:px-10 lg:py-5 rounded-2xl text-lg lg:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 min-w-[240px] flex items-center justify-center">
                  Try a Sample Quiz
                
                </button>
              </Link>
            </div>
            
            {/* Stats Section - Compact for split layout */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
              <Card variant="glass" className="p-4 transform hover:scale-105 transition-all duration-300">
                <CardContent className="p-0 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">100+</div>
                  <p className="text-xs text-gray-600">Questions</p>
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
      </Container>
    </Section>
  )
}
