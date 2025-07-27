import Image from 'next/image'
import Link from "next/link";
import SvgIcon from '@/components/ui/SvgIcon'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-3 py-1.5 rounded-full text-sm font-medium mb-6 border border-brand/20">
            <span className="w-2 h-2 bg-brand rounded-full"></span>
            About Acadex
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
            Empowering English Learners
            <span className="block text-brand mt-2">Worldwide</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            We&apos;re dedicated to helping students master English through comprehensive IELTS preparation, 
            grammar mastery, vocabulary building, and interactive learning experiences.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 lg:px-8 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-3 py-1.5 rounded-full text-sm font-medium mb-6 border border-brand/20">
                Our Mission
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
                Transforming English Education
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                At ACADEX, we believe every student deserves access to world-class English education. 
                Our platform combines proven language learning methodologies with cutting-edge technology 
                to create engaging, effective learning experiences.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Whether you&apos;re preparing for IELTS, improving your grammar, building vocabulary, or 
                mastering pronunciation, we provide the tools and support you need to achieve English fluency 
                and reach your academic or professional goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/courses" className="bg-brand text-brand-foreground hover:bg-brand/90 px-6 py-3 rounded-lg font-medium transition-colors duration-200 text-center group flex items-center justify-center gap-2">
                  <span>Start Learning English</span>
                  <SvgIcon icon="angleRight" variant="white" size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/quizzes" className="border border-brand text-brand hover:bg-brand hover:text-brand-foreground px-6 py-3 rounded-lg font-medium transition-colors duration-200 text-center flex items-center justify-center gap-2">
                  <SvgIcon icon="check" size={16} />
                  Take IELTS Practice Test
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="card p-8 transform hover:scale-105 transition-transform duration-300">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center">
                    <SvgIcon icon="bolt" size={32} className="text-brand" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight mb-4 text-center">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed text-center">
                  To become the world&apos;s leading platform for English language learning, 
                  where every student can achieve fluency, excel in IELTS, and unlock global opportunities 
                  through confident English communication.
                </p>
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-brand">25K+</div>
                      <div className="text-sm text-muted-foreground">English Learners</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-brand">50+</div>
                      <div className="text-sm text-muted-foreground">English Courses</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Values Section */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-3 py-1.5 rounded-full text-sm font-medium mb-6 border border-brand/20">
              Our Values
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
              What Drives Our English Education Mission
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              These core principles guide our commitment to helping students achieve English fluency and academic success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card p-8 hover:shadow-lg transition-all duration-300 group">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <SvgIcon icon="check" size={32} className="text-brand" />
                </div>
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-4">IELTS Excellence</h3>
              <p className="text-muted-foreground leading-relaxed">
                We provide comprehensive IELTS preparation with authentic practice tests, expert strategies, 
                and personalized feedback to help students achieve their target band scores.
              </p>
            </div>

            <div className="card p-8 hover:shadow-lg transition-all duration-300 group">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <SvgIcon icon="users" size={32} className="text-brand" />
                </div>
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-4">Global Accessibility</h3>
              <p className="text-muted-foreground leading-relaxed">
                English opens global opportunities. We make quality English education accessible 
                to learners worldwide, regardless of location or background.
              </p>
            </div>

            <div className="card p-8 hover:shadow-lg transition-all duration-300 group">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <SvgIcon icon="bolt" size={32} className="text-brand" />
                </div>
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-4">Adaptive Learning</h3>
              <p className="text-muted-foreground leading-relaxed">
                We use innovative technology to create personalized learning paths that adapt 
                to each student&apos;s level, learning style, and goals for maximum effectiveness.
              </p>
            </div>

            <div className="card p-8 hover:shadow-lg transition-all duration-300 group">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <SvgIcon icon="star" size={32} className="text-brand" />
                </div>
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-4">Proven Methods</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our curriculum combines proven language acquisition techniques with modern 
                interactive methods to ensure effective and engaging English learning.
              </p>
            </div>

            <div className="card p-8 hover:shadow-lg transition-all duration-300 group">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <SvgIcon icon="chart" size={32} className="text-brand" />
                </div>
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-4">Continuous Progress</h3>
              <p className="text-muted-foreground leading-relaxed">
                We believe in continuous improvement. Our platform tracks your progress 
                and adapts to help you achieve steady growth in your English proficiency.
              </p>
            </div>

            <div className="card p-8 hover:shadow-lg transition-all duration-300 group">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <SvgIcon icon="users" size={32} className="text-brand" />
                </div>
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-4">Learning Community</h3>
              <p className="text-muted-foreground leading-relaxed">
                Join a global community of English learners who support each other, share 
                experiences, and celebrate achievements together on their language learning journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-6 lg:px-8 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
              Trusted by English Learners Worldwide
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join thousands of students who are achieving their English goals and unlocking global opportunities with ACADEX.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl font-bold text-brand mb-2">25K+</div>
                <div className="text-sm text-muted-foreground font-medium">English Students</div>
              </div>
            </div>
            <div className="text-center">
              <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl font-bold text-brand mb-2">2,500+</div>
                <div className="text-sm text-muted-foreground font-medium">IELTS Questions</div>
              </div>
            </div>
            <div className="text-center">
              <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl font-bold text-brand mb-2">150+</div>
                <div className="text-sm text-muted-foreground font-medium">Grammar Topics</div>
              </div>
            </div>
            <div className="text-center">
              <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl font-bold text-brand mb-2">92%</div>
                <div className="text-sm text-muted-foreground font-medium">Score Improvement</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
            Ready to Master English?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Join thousands of students who are achieving IELTS success and English fluency with ACADEX.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-brand text-brand-foreground hover:bg-brand/90 px-6 py-3 rounded-lg font-medium transition-colors duration-200 text-center">
              Start Learning Today
            </Link>
            <Link href="/courses" className="border border-brand text-brand hover:bg-brand hover:text-brand-foreground px-6 py-3 rounded-lg font-medium transition-colors duration-200 text-center">
              Browse English Courses
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
