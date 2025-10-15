import { HeartHandshake, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatedDiv, StaggerContainer, StaggerItem, HoverScale } from '@/components/ui/AnimatedComponents'

export default function HonestSection() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-secondary/5"></div>
      
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Founder Story Card with Image */}
          <AnimatedDiv variant="fadeInUp" className="mb-16 lg:mb-20">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Two Column Layout */}
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Left: Image */}
                <div className="relative h-64 lg:h-auto bg-gradient-to-br from-primary to-secondary">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                      <HeartHandshake className="text-white" size={64} />
                    </div>
                  </div>
                  {/* You can replace this with actual founder photo */}
                  {/* <Image src="/images/founder.jpg" alt="Soley" fill className="object-cover" /> */}
                </div>

                {/* Right: Content */}
                <div className="p-8 md:p-12 lg:p-16 space-y-6">
                  <AnimatedDiv variant="fadeInUp" delay={0.2}>
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
                      <HeartHandshake size={16} />
                      <span>Our Promise</span>
                    </div>
                  </AnimatedDiv>

                  <AnimatedDiv variant="fadeInUp" delay={0.3}>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                      Learning Is Hard. Practice Shouldn&apos;t Be.
                    </h2>
                  </AnimatedDiv>

                  <AnimatedDiv variant="fadeInUp" delay={0.4}>
                    <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                      My name is Soley, and I&apos;ve spent my career in educational field for more than a decade. I&apos;ve seen countless bright, dedicated students get stuck at the same IELTS score.
                    </p>
                  </AnimatedDiv>

                  <AnimatedDiv variant="fadeInUp" delay={0.5}>
                    <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                      It&apos;s rarely because they don&apos;t know enough; it&apos;s because they haven&apos;t mastered the small, foundational details. I built Acadex to fix that one problem.
                    </p>
                  </AnimatedDiv>

                  <AnimatedDiv variant="fadeInUp" delay={0.6}>
                    <Link 
                      href="/about" 
                      className="inline-flex items-center gap-2 text-primary hover:text-secondary font-semibold transition-colors group"
                    >
                      <span>Read My Full Story</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </AnimatedDiv>
                </div>
              </div>
            </div>
          </AnimatedDiv>

          {/* Call to Action */}
          <StaggerContainer className="text-center space-y-8">
            <StaggerItem>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Ready to Feel the Difference?
              </h3>
            </StaggerItem>

            <StaggerItem>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Experience our teaching method for yourself. Your first quiz is on us.
              </p>
            </StaggerItem>

            <StaggerItem>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <HoverScale scale={1.05}>
                  <Link href="/quizzes">
                    <button className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 min-w-[240px]">
                      <span>Get the Writing Skill Pack</span>
                      <ArrowRight size={20} />
                    </button>
                  </Link>
                </HoverScale>
                <HoverScale scale={1.05}>
                  <Link href="/quizzes">
                    <button className="w-full sm:w-auto bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center min-w-[240px]">
                      Try a Free Quiz
                    </button>
                  </Link>
                </HoverScale>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>
    </section>
  )
}
