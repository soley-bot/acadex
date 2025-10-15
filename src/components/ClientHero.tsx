"use client"

import Link from 'next/link'
import { Sparkles, Award, TrendingUp, Users } from 'lucide-react'
import { AnimatedDiv, StaggerContainer, StaggerItem, HoverScale } from '@/components/ui/AnimatedComponents'

export default function ClientHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-muted/50 via-background to-muted/30">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="max-w-2xl">
            <StaggerContainer>
              {/* Badge */}
              <StaggerItem>
                <AnimatedDiv variant="fadeInUp" delay={0.1}>
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
                    <Sparkles size={16} className="text-primary" />
                    Made for Cambodian Students
                  </div>
                </AnimatedDiv>
              </StaggerItem>

              {/* Main Headline */}
              <StaggerItem>
                <AnimatedDiv variant="fadeInUp" delay={0.2}>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                    Stop Guessing.
                    <span className="block mt-2 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient bg-300%">
                      Start Scoring Higher.
                    </span>
                  </h1>
                </AnimatedDiv>
              </StaggerItem>

              {/* Description */}
              <StaggerItem>
                <AnimatedDiv variant="fadeInUp" delay={0.3}>
                  <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                    Finally, IELTS practice built for Cambodian students. Master the vocabulary and grammar patterns that actually show up on test day.
                    <span className="block mt-2 font-semibold text-foreground">Your Band 7.5+ starts here.</span>
                  </p>
                </AnimatedDiv>
              </StaggerItem>

              {/* CTA Buttons */}
              <StaggerItem>
                <AnimatedDiv variant="fadeInUp" delay={0.4}>
                  <div className="flex flex-col sm:flex-row gap-4 mb-10">
                    <HoverScale scale={1.05}>
                      <Link href="/auth/signup" className="group">
                        <button className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2">
                          Start Practicing Free
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </button>
                      </Link>
                    </HoverScale>

                    <HoverScale scale={1.05}>
                      <Link href="/quizzes">
                        <button className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300">
                          Browse Quizzes
                        </button>
                      </Link>
                    </HoverScale>
                  </div>
                </AnimatedDiv>
              </StaggerItem>

              {/* Social Proof */}
              <StaggerItem>
                <AnimatedDiv variant="fadeInUp" delay={0.5}>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Free to Start</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Instant Feedback</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Built by Educators</span>
                    </div>
                  </div>
                </AnimatedDiv>
              </StaggerItem>
            </StaggerContainer>
          </div>

          {/* Right Column - Feature Cards */}
          <div className="hidden lg:block">
            <StaggerContainer>
              <div className="grid grid-cols-2 gap-4">
                <StaggerItem>
                  <AnimatedDiv variant="fadeInUp" delay={0.3}>
                    <div className="bg-white/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-4">
                        <Award className="text-white" size={24} strokeWidth={2} />
                      </div>
                      <h3 className="font-bold text-base mb-2">Real IELTS Focus</h3>
                      <p className="text-xs text-muted-foreground">Practice questions that match actual exam patterns</p>
                    </div>
                  </AnimatedDiv>
                </StaggerItem>

                <StaggerItem>
                  <AnimatedDiv variant="fadeInUp" delay={0.4} className="mt-8">
                    <div className="bg-white/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center mb-4">
                        <TrendingUp className="text-white" size={24} strokeWidth={2} />
                      </div>
                      <h3 className="font-bold text-base mb-2">See Your Growth</h3>
                      <p className="text-xs text-muted-foreground">Track your progress as you improve</p>
                    </div>
                  </AnimatedDiv>
                </StaggerItem>

                <StaggerItem>
                  <AnimatedDiv variant="fadeInUp" delay={0.5} className="mt-8">
                    <div className="bg-white/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-4">
                        <Sparkles className="text-white" size={24} strokeWidth={2} />
                      </div>
                      <h3 className="font-bold text-base mb-2">Smart Practice</h3>
                      <p className="text-xs text-muted-foreground">Focus on what matters most for your score</p>
                    </div>
                  </AnimatedDiv>
                </StaggerItem>

                <StaggerItem>
                  <AnimatedDiv variant="fadeInUp" delay={0.6}>
                    <div className="bg-white/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center mb-4">
                        <Users className="text-white" size={24} strokeWidth={2} />
                      </div>
                      <h3 className="font-bold text-base mb-2">Study Anytime</h3>
                      <p className="text-xs text-muted-foreground">Practice on your schedule, at your pace</p>
                    </div>
                  </AnimatedDiv>
                </StaggerItem>
              </div>
            </StaggerContainer>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <AnimatedDiv variant="fadeInUp" delay={0.8}>
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Discover More</span>
            <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-primary rounded-full animate-bounce mt-2"></div>
            </div>
          </div>
        </AnimatedDiv>
      </div>
    </section>
  )
}
