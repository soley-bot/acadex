import { Typography, DisplayLG, H2, H3, BodyLG, BodyMD } from '@/components/ui/Typography'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'
import Icon from '@/components/ui/Icon'
import Link from 'next/link'

export default function HonestSection() {
  return (
    <Section 
      className="relative overflow-hidden"
      background="transparent"
    >
      <Container size="xl" className="relative">
        <div className="max-w-4xl mx-auto text-center">
            {/* Honest Message */}
            <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-3xl p-8 lg:p-12 shadow-xl mb-12">
              <H2 className="mb-6 text-gray-700">
                We&apos;re Honest About Where We Are
              </H2>
              
              <BodyLG color="muted" className="mb-8 leading-relaxed">
                Acadex is still in its early stage.
                <br />
                We don&apos;t have hundreds of courses or instructors.
                <br />
                But every course we launch is made with care, tested with real students, and improved with real feedback.
              </BodyLG>
              
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20">
                <H3 className="mb-4 text-primary">Built from Scratch, Built with Heart</H3>
                <BodyMD color="muted" className="leading-relaxed mb-4">
                  Acadex was built from zero — line by line — by Soley Heng, a Cambodian educator who had no tech background 
                  but cared deeply about learning. No team. No investor. Just a dream and many sleepless nights.
                </BodyMD>
                <Link href="/about">
                  <button className="text-primary hover:text-primary/80 font-medium underline text-sm">
                    Read the full story →
                  </button>
                </Link>
              </div>
            </div>          {/* Call to Action */}
          <div className="text-center">
            <H2 className="mb-6 text-gray-700">
              Want to be part of it?
            </H2>
            <BodyLG color="muted" className="mb-8">
              Start learning today — or just look around. No pressure.
            </BodyLG>
            
            <Flex direction="col" gap="md" className="sm:flex-row justify-center">
              <Link href="/courses">
                <button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 min-w-[180px]">
                  Browse Courses
                  <span className="ml-3">→</span>
                </button>
              </Link>
              <Link href="/contact">
                <button className="border-2 border-primary text-primary bg-white/80 backdrop-blur-sm hover:bg-primary hover:text-black px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 min-w-[180px]">
                  Contact Us
                </button>
              </Link>
            </Flex>
          </div>

          {/* Future Video Section */}
          <div className="mt-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-8 lg:p-12 border border-gray-200">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-secondary to-secondary/90 rounded-2xl flex items-center justify-center shadow-lg">
                <Icon name="video" size={32} color="white" />
              </div>
            </div>
            <H3 className="mb-4 text-gray-700">🎥 Coming Soon</H3>
            <BodyMD color="muted" className="leading-relaxed">
              Animated learning videos to help explain the most important concepts — step by step.
            </BodyMD>
          </div>
        </div>
      </Container>
    </Section>
  )
}
