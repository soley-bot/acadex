"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { BlobBackground } from '@/components/ui/BlobBackground'
import { AnimatedDiv, StaggerContainer, StaggerItem, HoverScale } from '@/components/ui/AnimatedComponents'

export default function ClientHero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden section-padding"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Background Elements */}
      <BlobBackground variant="default" />
      
      <div className="container mx-auto relative z-10 px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <StaggerContainer>
              <AnimatedDiv variant="scaleIn" delay={0.2}>
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-6 md:mb-8">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Transform Your IELTS Journey Today
                </div>
              </AnimatedDiv>

              <StaggerItem>
                <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6 md:mb-8">
                  Master IELTS with{' '}
                  <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    AI-Powered
                  </span>{' '}
                  Precision
                </h1>
              </StaggerItem>
              
              <StaggerItem>
                <p className="text-lg md:text-xl text-white/90 mb-8 md:mb-12 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Get personalized coaching, instant feedback, and targeted practice. 
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
                      <button className="w-full sm:w-auto bg-white hover:bg-gray-100 text-primary hover:text-primary px-8 py-4 lg:px-10 lg:py-5 rounded-2xl text-base md:text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 min-w-[240px] flex items-center justify-center">
                        Try Free Quiz
                      </button>
                    </Link>
                  </HoverScale>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>

          {/* Right Column - Enhanced Visual Cards */}
          <AnimatedDiv variant="slideInRight" delay={0.4} className="order-1 lg:order-2">
            <HoverScale scale={1.02}>
              <Card variant="elevated" className="overflow-hidden transform hover:scale-[1.02] transition-all duration-500">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src="/images/hero/ielts-dashboard-preview.jpg"
                      alt="IELTS Preparation Dashboard"
                      fill
                      className="object-cover object-center"
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    
                    {/* Floating Score Card */}
                    <div className="absolute bottom-4 right-4">
                      <AnimatedDiv variant="fadeInUp" delay={1.2}>
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl">
                          <div className="text-sm text-gray-600">Target Score</div>
                          <div className="text-2xl font-bold text-primary">8.0</div>
                        </div>
                      </AnimatedDiv>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </HoverScale>
          </AnimatedDiv>
        </div>
        
        {/* Stats Section - Better Mobile Experience */}
        <div className="mt-16 md:mt-20 lg:mt-24">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              { label: 'Success Rate', value: '94%', icon: '🎯' },
              { label: 'Students Coached', value: '50K+', icon: '👥' },
              { label: 'Score Improvement', value: '+1.5', icon: '📈' },
              { label: 'Practice Tests', value: '1000+', icon: '📝' }
            ].map((stat, i) => (
              <HoverScale key={i} scale={1.03} className="group h-full">
                <Card variant="elevated" className="p-6 h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <CardContent className="text-center p-0">
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
                      {stat.icon}
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-white/80 text-sm md:text-base">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </HoverScale>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
