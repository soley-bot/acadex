import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, BookOpen, BrainCircuit, Users, Target } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { PageSection } from '@/components/layout/PageSection'
import { SectionHeader } from '@/components/layout/SectionHeader'

export const metadata: Metadata = {
  title: 'About Acadex - Built from Scratch, Built with Heart',
  description: 'The story of Soley Heng and how Acadex was created to challenge traditional education and support self-directed learning for Cambodian students.',
  keywords: [
    'about acadex',
    'soley heng',
    'cambodian education',
    'online learning story',
    'self-directed learning',
    'ielts preparation cambodia'
  ],
  alternates: {
    canonical: 'https://acadex.academy/about',
  },
}

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <PageHero
        badge={{ icon: Heart, text: 'Our Story' }}
        title={
          <>
            Built from Scratch.
            <span className="block text-blue-300 mt-2">Built with Heart.</span>
          </>
        }
        description="Acadex wasn't built by a big company. It was built line-by-line by an educator who believed there was a better way to help students master the skills they need to succeed."
        imageSrc="/images/hero/learning-together.jpg"
      />

      {/* Main Content Section */}
      <PageSection>
        {/* Founder Introduction */}
        <Card className="overflow-hidden shadow-lg">
          <div className="md:grid md:grid-cols-3 items-center">
            <div className="md:col-span-1 p-6 md:p-8">
              <div className="rounded-xl overflow-hidden">
                <Image
                  src="/images/hero/founder.jpg"
                  alt="Soley Heng, founder of Acadex"
                  width={800}
                  height={800}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <div className="md:col-span-2 p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Hi, I&apos;m Soley Heng</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                I&apos;ve spent years in educational sector. I saw the same pattern again and again: bright students feeling stuck, practicing their mistakes, and losing confidence because they hadn&apos;t mastered the small, foundational details.
                <br /><br />
                I built Acadex to fix that. With no tech background, I spent months learning to code, driven by one belief: that with the right tools, any student can achieve their goals.
              </p>
            </div>
          </div>
        </Card>

        {/* Beliefs Section */}
        <div>
          <SectionHeader
            icon={Target}
            title="A Different Belief About Learning"
            description="Supporting self-directed learning with the right tools"
          />

          <p className="text-lg text-gray-600 max-w-3xl leading-relaxed mb-12">
            At Acadex, we believe self-study is powerful. When you&apos;re given clear, focused content and the right interactive tools, you can learn more effectively than in a traditional classroom. Our mission is to support that journey.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Targeted Content</h3>
              <p className="text-gray-600">No long lectures. Just focused practice on the skills that have the biggest impact on your score.</p>
            </Card>

            <Card className="p-6 text-center hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                  <BrainCircuit className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Learn by Doing</h3>
              <p className="text-gray-600">Master concepts through interactive quizzes that provide instant, clear feedback.</p>
            </Card>

            <Card className="p-6 text-center hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Student-Focused</h3>
              <p className="text-gray-600">We&apos;re still growing, but our commitment is to build what you actually need to succeed.</p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center pt-4">
          <Card className="max-w-2xl mx-auto p-8 md:p-12 shadow-2xl bg-gradient-to-br from-white to-blue-50">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Let&apos;s Build This Together</h2>
            <p className="text-lg text-gray-600 mb-8">
              If you&apos;ve ever felt like you weren&apos;t good at learning, Acadex is here to prove you wrong. Start with a free quiz and feel the difference an educator-led approach can make.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/quizzes">Explore IELTS Quizzes</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </Card>
        </div>
      </PageSection>
    </>
  )
}
