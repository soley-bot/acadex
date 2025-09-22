import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { BlobBackground } from '@/components/ui/BlobBackground'
import { AnimatedDiv, StaggerContainer, StaggerItem, HoverScale } from '@/components/ui/AnimatedComponents'

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden section-padding"
    >
      {/* Standardized Animated Background */}
      <BlobBackground variant="default" />

      <div className="container container-xl relative">
        <div className="grid lg:grid-cols-2 items-center gap-8 lg:gap-16">
          {/* Left Column - Content */}
          <StaggerContainer className="text-center lg:text-left order-2 lg:order-1 space-y-8">
            {/* Hero Badge */}
            <StaggerItem>
              <AnimatedDiv variant="scaleIn" delay={0.2}>
                <div className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 shadow-lg rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  <span className="font-medium">Make Learning More Accessible</span>
                </div>
              </AnimatedDiv>
            </StaggerItem>

            {/* Main Heading - Fluid Typography */}
            <StaggerItem>
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                Transform Your IELTS Score in 15 Minutes a Day
              </h1>
            </StaggerItem>

            {/* Subtitle - Fluid Typography */}
            <StaggerItem>
              <p className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed">
                Master essential IELTS skills with AI-powered micro-quizzes designed by education experts.
                Focus on your weak areas and boost your score efficiently.
              </p>
            </StaggerItem>

            {/* CTA Buttons - Improved Mobile Layout with Fluid Spacing */}
            <StaggerItem>
              <div className="flex flex-col md:flex-row justify-center lg:justify-start items-center gap-4 md:gap-6">
                <HoverScale scale={1.03}>
                  <Link href="/courses" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto bg-primary hover:bg-secondary text-white hover:text-white px-8 py-4 lg:px-10 lg:py-5 rounded-2xl text-base md:text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 min-w-[240px] flex items-center justify-center">
                      Unlock Your Score
                    </button>
                  </Link>
                </HoverScale>
                <HoverScale scale={1.03}>
                  <Link href="/quizzes" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 lg:px-10 lg:py-5 rounded-2xl text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 min-w-[240px] flex items-center justify-center">
                      Try a Sample Quiz
                    </button>
                  </Link>
                </HoverScale>
              </div>
            </StaggerItem>

            {/* Stats Section - Responsive sizing for better desktop/mobile balance */}
            <StaggerItem>
              <div className="grid grid-cols-2 max-w-sm mx-auto lg:mx-0 lg:max-w-md gap-3 md:gap-4">
                <HoverScale scale={1.02}>
                  <Card variant="glass" className="p-3 md:p-4 transform hover:scale-105 transition-all duration-300">
                    <CardContent className="p-0 text-center space-y-2">
                      <div className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">100+</div>
                      <p className="text-xs md:text-sm text-gray-600 leading-tight">Questions</p>
                    </CardContent>
                  </Card>
                </HoverScale>
                <HoverScale scale={1.02}>
                  <Card variant="glass" className="p-3 md:p-4 transform hover:scale-105 transition-all duration-300">
                    <CardContent className="p-0 text-center space-y-2">
                      <div className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">100%</div>
                      <p className="text-xs md:text-sm text-gray-600 leading-tight">Made with Care</p>
                    </CardContent>
                  </Card>
                </HoverScale>
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* Right Column - Hero Image */}
          <AnimatedDiv variant="slideInRight" delay={0.4} className="order-1 lg:order-2">
            <HoverScale scale={1.02}>
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
                      <AnimatedDiv variant="fadeInUp" delay={1.2}>
                        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                              <span className="font-medium text-foreground">Real Progress</span>
                            </div>
                            <span className="font-bold text-secondary">Daily improvement</span>
                          </div>
                        </div>
                      </AnimatedDiv>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </HoverScale>
          </AnimatedDiv>
        </div>
      </div>
    </section>
  )
}
