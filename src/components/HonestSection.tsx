import { Card, CardContent } from '@/components/ui/card'
import { BlobBackground } from '@/components/ui/BlobBackground'
import { HeartHandshake } from 'lucide-react'
import Link from 'next/link'
import { AnimatedDiv, StaggerContainer, StaggerItem, HoverScale } from '@/components/ui/AnimatedComponents'

export default function HonestSection() {
  return (
    <section 
      className="relative overflow-hidden section-padding"
    >
      {/* Standardized Animated Background - consistent with other sections */}
      <BlobBackground variant="default" />
      
      <div className="container container-xl relative">
        <div className="max-w-4xl mx-auto text-center">
            {/* Unified Founder Story & Commitment Card */}
            <AnimatedDiv variant="fadeInUp" className="mb-16">
              <Card variant="glass" className="p-8 md:p-12 lg:p-16">
                <CardContent className="p-0 space-y-6">
                  <AnimatedDiv variant="scaleIn" delay={0.2}>
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg text-white">
                            <HeartHandshake size={40} />
                        </div>
                    </div>
                  </AnimatedDiv>

                  <AnimatedDiv variant="fadeInUp" delay={0.4}>
                                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                      Learning Is Hard. Practice Shouldn&apos;t Be.
                    </h2>
                  </AnimatedDiv>

                  <AnimatedDiv variant="fadeInUp" delay={0.6}>
                    <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed">
                      My name is Soley, and I&apos;ve spent my career in educational field for more than a decade. I&apos;ve seen countless bright, dedicated students get stuck at the same IELTS score. It&apos;s rarely because they don&apos;t know enough; it&apos;s because they haven&apos;t mastered the small, foundational details.
                      <br/><br/>
                      I built Acadex to fix that one problem. We&apos;re still new, but our focus is absolute: to give you the expert-led, targeted practice you need to finally get the score you deserve.
                    </p>
                  </AnimatedDiv>

                  <AnimatedDiv variant="fadeInUp" delay={0.8}>
                    <Link href="/about" className="text-primary hover:text-secondary font-medium transition-colors">
                      Read My Full Story →
                    </Link>
                  </AnimatedDiv>
                </CardContent>
              </Card>
            </AnimatedDiv>

          {/* Focused Call to Action */}
          <StaggerContainer className="mt-16 text-center space-y-8">
            <StaggerItem>
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground">
                Ready to Feel the Difference?
              </h3>
            </StaggerItem>
            
            <StaggerItem>
              <p className="text-base md:text-lg text-muted-foreground">
                Experience our teaching method for yourself. Your first quiz is on us.
              </p>
            </StaggerItem>
            
            <StaggerItem>
              <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6">
                <HoverScale scale={1.03}>
                  <Link href="/quizzes" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto bg-primary hover:bg-secondary text-white hover:text-white px-8 py-4 rounded-2xl text-base md:text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                      Get the Writing Skill Pack
                    </button>
                  </Link>
                </HoverScale>
                <HoverScale scale={1.03}>
                  <Link href="/quizzes/free-sample" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-2xl text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
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

