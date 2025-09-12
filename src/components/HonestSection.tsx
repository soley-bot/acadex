import { Card, CardContent } from '@/components/ui/card'
import { Container, Section } from '@/components/ui/Layout'
import { HeartHandshake } from 'lucide-react'
import Link from 'next/link'

export default function HonestSection() {
  return (
    <Section 
      className="relative overflow-hidden py-16 md:py-20 lg:py-24 bg-gray-50"
      background="transparent"
    >
      <Container size="xl" className="relative">
        <div className="max-w-4xl mx-auto text-center px-4 md:px-0">
            {/* Unified Founder Story & Commitment Card */}
            <Card variant="glass" className="p-8 md:p-12 lg:p-16">
              <CardContent className="p-0">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg text-white">
                        <HeartHandshake size={40} />
                    </div>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Built by an Educator, For the Student
                </h2>

                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  My name is Soley, and I&apos;ve spent my career in educational field for more than a decade. I&apos;ve seen countless bright, dedicated students get stuck at the same IELTS score. It&apos;s rarely because they don&apos;t know enough; it&apos;s because they haven&apos;t mastered the small, foundational details.
                  <br/><br/>
                  I built Acadex to fix that one problem. We&apos;re still new, but our focus is absolute: to give you the expert-led, targeted practice you need to finally get the score you deserve.
                </p>

                <Link href="/about" className="text-primary hover:text-secondary font-medium transition-colors">
                  Read My Full Story →
                </Link>
              </CardContent>
            </Card>

          {/* Focused Call to Action */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Feel the Difference?
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              Experience our teaching method for yourself. Your first quiz is on us.
            </p>
            
            <div className="flex flex-col gap-4 md:flex-row md:gap-6 justify-center items-center">
              <Link href="/quizzes" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-primary hover:bg-secondary text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                  Get the Writing Skill Pack
                </button>
              </Link>
              <Link href="/quizzes/free-sample" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                  Try a Free Quiz
                </button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}

