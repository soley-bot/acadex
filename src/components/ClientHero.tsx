"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { BlobBackground } from '@/components/ui/BlobBackground'
import { AnimatedDiv, StaggerContainer, StaggerItem, HoverScale } from '@/components/ui/AnimatedComponents'

export default function ClientHero() {
  return (
    <section className="bg-white py-20 lg:py-32">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left Column - Content */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <StaggerContainer>
              <StaggerItem>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Practice IELTS with
                  <span className="block text-primary">Unlimited Quizzes</span>
                </h1>
              </StaggerItem>
              
              <StaggerItem>
                <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Access hundreds of practice questions across all IELTS sections. 
                  Learn at your own pace with instant feedback.
                </p>
              </StaggerItem>

              {/* Single Primary CTA */}
              <StaggerItem>
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
                  <HoverScale scale={1.02}>
                    <Link href="/auth" className="w-full sm:w-auto">
                      <button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 min-w-[200px]">
                        Start Free Today
                      </button>
                    </Link>
                  </HoverScale>
                  <Link href="/quizzes" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                    Browse Quizzes →
                  </Link>
                </div>
              </StaggerItem>

              {/* Simple Feature List */}
              <StaggerItem>
                <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    No signup required for browsing
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    All IELTS sections covered
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Instant results & feedback
                  </div>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>

          {/* Right Column - Clean Image */}
          <AnimatedDiv variant="slideInRight" delay={0.3} className="order-1 lg:order-2">
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="/images/hero/learning-together.jpg"
                  alt="Students learning IELTS together"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              
              {/* Simple Floating Element */}
              <AnimatedDiv variant="fadeInUp" delay={0.8}>
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl px-6 py-4 shadow-xl border border-gray-100">
                  <div className="text-sm text-gray-600 mb-1">Practice Questions</div>
                  <div className="text-2xl font-bold text-primary">500+</div>
                </div>
              </AnimatedDiv>
            </div>
          </AnimatedDiv>
        </div>
      </div>
    </section>
  )
}
