"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { BlobBackground } from '@/components/ui/BlobBackground'
import { AnimatedDiv, StaggerContainer, StaggerItem, HoverScale } from '@/components/ui/AnimatedComponents'

export default function ClientHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/herovideo.mp4" type="video/mp4" />
        </video>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="max-w-4xl">
          <StaggerContainer>
            {/* Badge */}
            <StaggerItem>
              <AnimatedDiv variant="fadeInUp" delay={0.2}>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  Master IELTS with Expert Practice
                </div>
              </AnimatedDiv>
            </StaggerItem>

            {/* Main Headline */}
            <StaggerItem>
              <AnimatedDiv variant="fadeInUp" delay={0.4}>
                <h1 className="text-hero text-white mb-6">
                  Boost Your IELTS
                  <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Score Faster
                  </span>
                </h1>
              </AnimatedDiv>
            </StaggerItem>

            {/* Description */}
            <StaggerItem>
              <AnimatedDiv variant="fadeInUp" delay={0.6}>
                <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed max-w-2xl">
                  Access hundreds of targeted practice questions. Get instant feedback. 
                  Focus on what matters most for your score.
                </p>
              </AnimatedDiv>
            </StaggerItem>

            {/* CTA Buttons */}
            <StaggerItem>
              <AnimatedDiv variant="fadeInUp" delay={0.8}>
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <HoverScale scale={1.02}>
                    <Link href="/auth" className="group">
                      <button className="btn-primary text-lg px-8 py-4 shadow-2xl hover:shadow-primary/25 flex items-center justify-center gap-2 min-w-[200px]">
                        Get Started
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    </Link>
                  </HoverScale>
                  
                  <HoverScale scale={1.02}>
                    <Link href="/quizzes">
                      <button className="btn-outline border-white/20 text-white hover:bg-white hover:text-foreground text-lg px-8 py-4 backdrop-blur-sm min-w-[200px]">
                        Try Free Quiz
                      </button>
                    </Link>
                  </HoverScale>
                </div>
              </AnimatedDiv>
            </StaggerItem>

            {/* Trust Indicators */}
            <StaggerItem>
              <AnimatedDiv variant="fadeInUp" delay={1.0}>
                <div className="flex flex-wrap items-center gap-8 text-white/70">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm">500+ Practice Questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm">Instant Feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm">All IELTS Sections</span>
                  </div>
                </div>
              </AnimatedDiv>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <AnimatedDiv variant="fadeInUp" delay={1.2}>
          <div className="flex flex-col items-center gap-2 text-white/60">
            <span className="text-sm font-medium">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full animate-bounce mt-2"></div>
            </div>
          </div>
        </AnimatedDiv>
      </div>
    </section>
  )
}
