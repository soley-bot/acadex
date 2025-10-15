import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'
import { Button } from '@/components/ui/button'
import { Heart, BookOpen, BrainCircuit, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'

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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Hero Section */}
      <Section className="relative py-12 md:pb-16 text-center">
        <Container size="md">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            Our Story
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Built from Scratch.
            <br />
            <span className="text-primary">Built with Heart.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Acadex wasn&apos;t built by a big company. It was built line-by-line by an educator who believed there was a better way to help students master the skills they need to succeed.
          </p>
        </Container>
      </Section>

      {/* Main Content Section */}
      <Section className="py-16 md:py-20 lg:py-24">
        <Container size="md" className="space-y-12 md:space-y-16">

          {/* Founder Introduction */}
          <Card className="overflow-hidden">
            <div className="md:grid md:grid-cols-3 items-center">
              <div className="md:col-span-1 p-6 md:p-8">
                <div className="rounded-xl overflow-hidden">
                  <Image
                    src="/images/hero/founder.jpg" // Placeholder for founder image
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
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">A Different Belief About Learning</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              At Acadex, we believe self-study is powerful. When you&apos;re given clear, focused content and the right interactive tools, you can learn more effectively than in a traditional classroom. Our mission is to support that journey.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Targeted Content</h3>
                <p className="text-gray-600">No long lectures. Just focused practice on the skills that have the biggest impact on your score.</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                    <BrainCircuit className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Learn by Doing</h3>
                <p className="text-gray-600">Master concepts through interactive quizzes that provide instant, clear feedback.</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Student-Focused</h3>
                <p className="text-gray-600">We&apos;re still growing, but our commitment is to build what you actually need to succeed.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center pt-12">
            <Card variant="elevated" className="max-w-2xl mx-auto p-8">
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

        </Container>
      </Section>
    </div>
  )
}

