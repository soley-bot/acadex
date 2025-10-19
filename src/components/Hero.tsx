import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { BlobBackground } from '@/components/ui/BlobBackground'
import { AnimatedDiv, StaggerContainer, StaggerItem, HoverScale } from '@/components/ui/AnimatedComponents'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Full-bleed Hero Image Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero/learning-together.jpg"
          alt="Students learning English together"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="container container-xl relative z-10 py-20 lg:py-32">
        <div className="max-w-3xl">
          {/* Hero Badge */}
          <StaggerContainer className="space-y-8">
            <StaggerItem>
              <AnimatedDiv variant="scaleIn" delay={0.2}>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-3 shadow-lg rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  <span className="font-medium">Make Learning More Accessible</span>
                </div>
              </AnimatedDiv>
            </StaggerItem>

            {/* Main Heading - White text for contrast */}
            <StaggerItem>
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight drop-shadow-2xl">
                Master English in Just 15 Minutes a Day
              </h1>
            </StaggerItem>

            {/* Subtitle - White text with good contrast */}
            <StaggerItem>
              <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed drop-shadow-lg">
                Build real English skills with focused micro-quizzes designed by an experienced educator.
                Whether you're preparing for IELTS or strengthening your everyday English, I've got you covered.
              </p>
            </StaggerItem>

            {/* CTA Buttons */}
            <StaggerItem>
              <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
                <HoverScale scale={1.05}>
                  <Link href="/courses">
                    <button className="w-full sm:w-auto bg-white text-primary hover:bg-primary hover:text-white px-8 py-4 lg:px-10 lg:py-5 rounded-2xl text-base md:text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 min-w-[240px] flex items-center justify-center">
                      Unlock Your Score
                    </button>
                  </Link>
                </HoverScale>
                <HoverScale scale={1.05}>
                  <Link href="/quizzes">
                    <button className="w-full sm:w-auto bg-white/10 backdrop-blur-md border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 lg:px-10 lg:py-5 rounded-2xl text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 min-w-[240px] flex items-center justify-center">
                      Try a Sample Quiz
                    </button>
                  </Link>
                </HoverScale>
              </div>
            </StaggerItem>

            {/* Stats Section - Glass morphism style */}
            <StaggerItem>
              <div className="grid grid-cols-2 max-w-md gap-4">
                <HoverScale scale={1.02}>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-6 rounded-2xl transform hover:scale-105 transition-all duration-300">
                    <div className="text-center space-y-2">
                      <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">100+</div>
                      <p className="text-sm md:text-base text-white/80 leading-tight">Questions</p>
                    </div>
                  </div>
                </HoverScale>
                <HoverScale scale={1.02}>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-6 rounded-2xl transform hover:scale-105 transition-all duration-300">
                    <div className="text-center space-y-2">
                      <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">100%</div>
                      <p className="text-sm md:text-base text-white/80 leading-tight">Made with Care</p>
                    </div>
                  </div>
                </HoverScale>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>
    </section>
  )
}
