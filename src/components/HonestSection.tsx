import { Card, CardContent } from '@/components/ui/card'
import { BlobBackground } from '@/components/ui/BlobBackground'
import { HeartHandshake } from 'lucide-react'
import Link from 'next/link'
import { AnimatedDiv, StaggerContainer, StaggerItem, HoverScale } from '@/components/ui/AnimatedComponents'

export default function HonestSection() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* About Section */}
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-8 text-white">
              <HeartHandshake size={32} />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Built by an Educator, For Students
            </h2>

            <div className="prose prose-lg mx-auto text-gray-600">
              <p className="text-xl leading-relaxed">
                Hi, I&apos;m Soley. I&apos;ve been teaching for over a decade and noticed the same pattern: 
                students often know the material but struggle with exam-specific skills.
              </p>
              <p className="text-lg leading-relaxed">
                Acadex focuses on what actually matters for your IELTS score - targeted practice 
                with immediate feedback. We&apos;re new, but our approach is proven: 
                practice the right things, in the right way.
              </p>
            </div>

            <AnimatedDiv variant="fadeInUp" delay={0.8}>
              <Link href="/about" className="inline-flex items-center text-primary hover:text-primary/80 font-semibold mt-6 transition-colors">
                Read my full story →
              </Link>
            </AnimatedDiv>
          </div>

          {/* Simple CTA */}
          <div className="text-center bg-gray-50 rounded-2xl p-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Start Practicing?
            </h3>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join students who are improving their IELTS skills with focused, effective practice.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <HoverScale scale={1.02}>
                <Link href="/auth" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    Start Free Today
                  </button>
                </Link>
              </HoverScale>
              <Link href="/quizzes" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Browse Practice Quizzes →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


