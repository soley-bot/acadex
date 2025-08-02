import Image from 'next/image'
import Link from "next/link";
import SvgIcon from '@/components/ui/SvgIcon'
import { LinkButton } from '@/components/ui/LinkButton'
import { Container, Section } from '@/components/ui/Layout'
import { ElevatedCard, ValueCard, StatCard } from '@/components/ui/ElevatedCard'
import { SectionHeading, HeroHeading, Badge } from '@/components/ui/Typography'

export default function AboutPage() {
  return (
    <div className="content-wrapper">
      
      {/* Hero Section */}
      <Section variant="muted" spacing="lg">
        <Container className="pt-16 md:pt-20">
          <div className="text-center">
            <Badge className="mb-6">
              About ACADEX
            </Badge>
            <HeroHeading className="mb-6">
              Empowering English Learners
              <span className="block text-red-600 mt-2">Worldwide</span>
            </HeroHeading>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We&apos;re dedicated to helping students master English through comprehensive IELTS preparation, 
              grammar mastery, vocabulary building, and interactive learning experiences.
            </p>
          </div>
        </Container>
      </Section>

      {/* Mission Section */}
      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-6">
                Our Mission
              </Badge>
              <SectionHeading className="mb-6">
                Transforming English Education
              </SectionHeading>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At ACADEX, we believe every student deserves access to world-class English education. 
                Our platform combines proven language learning methodologies with cutting-edge technology 
                to create engaging, effective learning experiences.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Whether you&apos;re preparing for IELTS, improving your grammar, building vocabulary, or 
                mastering pronunciation, we provide the tools and support you need to achieve English fluency 
                and reach your academic or professional goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <LinkButton href="/courses" size="default">
                  Start Learning English
                </LinkButton>
                <LinkButton href="/quizzes" variant="outline" size="default">
                  Take Practice Test
                </LinkButton>
              </div>
            </div>
            <div className="relative">
              <ElevatedCard padding="lg">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-2xl">🎯</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-4">Our Vision</h3>
                <p className="text-lg text-gray-700 text-center leading-relaxed">
                  To become the world&apos;s leading platform for English language learning, 
                  where every student can achieve fluency, excel in IELTS, and unlock global opportunities 
                  through confident English communication.
                </p>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div>
                      <div className="text-3xl font-black text-red-600">25K+</div>
                      <div className="text-sm text-gray-600 font-medium">English Learners</div>
                    </div>
                    <div>
                      <div className="text-3xl font-black text-red-600">50+</div>
                      <div className="text-sm text-gray-600 font-medium">English Courses</div>
                    </div>
                  </div>
                </div>
              </ElevatedCard>
            </div>
          </div>
        </Container>
      </Section>

        {/* Values Section */}
      <Section variant="muted">
        <Container>
          <div className="text-center mb-12">
            <Badge variant="white" className="mb-6">
              Our Values
            </Badge>
            <SectionHeading className="mb-6">
              What Drives Our English Education Mission
            </SectionHeading>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              These core principles guide our commitment to helping students achieve English fluency and academic success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ValueCard
              icon="✅"
              title="IELTS Excellence"
              description="We provide comprehensive IELTS preparation with authentic practice tests, expert strategies, and personalized feedback to help students achieve their target band scores."
            />

            <ValueCard
              icon="🌍"
              title="Global Accessibility"
              description="English opens global opportunities. We make quality English education accessible to learners worldwide, regardless of location or background."
            />

            <ValueCard
              icon="⚡"
              title="Adaptive Learning"
              description="We use innovative technology to create personalized learning paths that adapt to each student's level, learning style, and goals for maximum effectiveness."
            />

            <ValueCard
              icon="⭐"
              title="Proven Methods"
              description="Our curriculum combines proven language acquisition techniques with modern interactive methods to ensure effective and engaging English learning."
            />

            <ValueCard
              icon="📈"
              title="Continuous Progress"
              description="We believe in continuous improvement. Our platform tracks your progress and adapts to help you achieve steady growth in your English proficiency."
            />

            <ValueCard
              icon="👥"
              title="Learning Community"
              description="Join a global community of English learners who support each other, share experiences, and celebrate achievements together on their language learning journey."
            />
          </div>
        </Container>
      </Section>

      {/* Statistics Section */}
      <Section className="border-t border-gray-200">
        <Container>
          <div className="text-center mb-12">
            <SectionHeading className="mb-4">
              Trusted by English Learners Worldwide
            </SectionHeading>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join thousands of students who are achieving their English goals and unlocking global opportunities with ACADEX.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard value="25K+" label="English Students" />
            <StatCard value="2,500+" label="IELTS Questions" />
            <StatCard value="150+" label="Grammar Topics" />
            <StatCard value="92%" label="Score Improvement" />
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section variant="dark">
        <Container size="sm">
          <div className="text-center">
            <SectionHeading color="white" className="mb-4">
              Ready to Master English?
            </SectionHeading>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Join thousands of students who are achieving IELTS success and English fluency with ACADEX.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LinkButton href="/auth/signup" size="lg">
                Start Learning Today
              </LinkButton>
              <LinkButton href="/courses" variant="ghost" size="lg">
                Browse English Courses
              </LinkButton>
            </div>
          </div>
        </Container>
      </Section>

    </div>
  )
}
