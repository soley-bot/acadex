import { Card, CardContent } from '@/components/ui/card'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'
import { Video } from 'lucide-react'
import Link from 'next/link'

export default function HonestSection() {
  return (
    <Section 
      className="relative overflow-hidden py-16 md:py-20 lg:py-24"
      background="transparent"
    >
      <Container size="xl" className="relative">
        <div className="max-w-4xl mx-auto text-center px-4 md:px-0">
            {/* Honest Message - Professional Card & Typography */}
            <Card variant="glass" className="p-6 md:p-8 lg:p-12 mb-8 md:mb-12">
              <CardContent className="p-0">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-700 mb-4 md:mb-6">
                  We&apos;re Honest About Where We Are
                </h2>
                
                <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed">
                  Acadex is still in its early stage.
                  <br />
                  We don&apos;t have hundreds of courses or instructors.
                  <br />
                  But every course we launch is made with care, tested with real students, and improved with real feedback.
                </p>
                
                <Card variant="base" className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 p-4 md:p-6">
                  <CardContent className="p-0">
                    <h3 className="text-lg md:text-xl font-semibold text-primary mb-3 md:mb-4">Built from Scratch, Built with Heart</h3>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-3 md:mb-4">
                      Acadex was built from zero — line by line — by Soley Heng, a Cambodian educator who had no tech background 
                      but cared deeply about learning. No team. No investor. Just a dream and many sleepless nights.
                    </p>
                    <Link href="/about" className="text-primary hover:text-secondary font-medium text-sm transition-colors">
                      Read the full story →
                    </Link>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

          {/* Call to Action - Improved Mobile Layout */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-700 mb-4 md:mb-6">
              Want to be part of it?
            </h2>
            <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">
              Start learning today — or just look around. No pressure.
            </p>
            
            <div className="flex flex-col gap-4 md:flex-row md:gap-6 lg:gap-8 justify-center items-center">
              <Link href="/courses" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-primary hover:bg-secondary text-white hover:text-black px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 min-w-[200px] flex items-center justify-center">
                  Browse Courses
                  <span className="ml-3">→</span>
                </button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 min-w-[200px] flex items-center justify-center">
                  Contact Us
                </button>
              </Link>
            </div>
          </div>

          {/* Future Video Section - Professional Card */}
          <Card variant="base" className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-gray-200 p-6 md:p-8 lg:p-12">
            <CardContent className="p-0 text-center">
              <div className="flex items-center justify-center mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-secondary to-secondary/90 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                  <Video size={24} className="md:w-8 md:h-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-3 md:mb-4">🎥 Coming Soon</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Animated learning videos to help explain the most important concepts — step by step.
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  )
}
