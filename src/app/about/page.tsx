import Image from 'next/image'
import Link from "next/link";

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
            Empowering Learning Through
            <span className="block text-brand mt-2">Innovation</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            We&apos;re building the future of education with interactive quizzes and comprehensive 
            courses designed for learners who demand excellence and accessibility.
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
                Democratizing Quality Education
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                At Acadex, we believe that exceptional education should be accessible to everyone, 
                everywhere. Our platform combines cutting-edge technology with proven pedagogical 
                principles to create engaging learning experiences.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                We&apos;re breaking down traditional barriers to learning and providing innovative tools 
                that help both educators and learners achieve their full potential in our connected world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/courses" className="bg-brand text-brand-foreground hover:bg-brand/90 px-6 py-3 rounded-lg font-medium transition-colors duration-200 text-center group">
                  <span>Explore Courses</span>
                  <Image
                    src="/icons8/arrow-right.png"
                    alt="Arrow"
                    width={16}
                    height={16}
                    className="w-4 h-4 ml-2 inline transform group-hover:translate-x-1 transition-transform"
                  />
                </Link>
                <Link href="/quizzes" className="border border-brand text-brand hover:bg-brand hover:text-brand-foreground px-6 py-3 rounded-lg font-medium transition-colors duration-200 text-center">
                  Try Our Quizzes
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="card p-8 transform hover:scale-105 transition-transform duration-300">
                <div className="flex justify-center mb-6">
                  <Image
                    src="/icons8/icons8-idea-100.png"
                    alt="Target"
                    width={64}
                    height={64}
                    className="w-16 h-16"
                  />
                </div>
                <h3 className="text-2xl font-semibold tracking-tight mb-4 text-center">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed text-center">
                  To become the world&apos;s most trusted platform for interactive learning, 
                  where knowledge meets innovation and every learner can thrive in their educational journey.
                </p>
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-brand">50K+</div>
                      <div className="text-sm text-muted-foreground">Students</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-brand">100+</div>
                      <div className="text-sm text-muted-foreground">Courses</div>
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
              What Drives Us Forward
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              These core principles guide everything we do and shape the exceptional experiences we create for our learning community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card p-8 hover:shadow-lg transition-all duration-300 group">
              <div className="flex justify-center mb-6">
                <Image
                  src="/icons8/icons8-checkmark-100.png"
                  alt="Excellence"
                  width={64}
                  height={64}
                  className="w-16 h-16 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-4">Excellence</h3>
              <p className="text-muted-foreground leading-relaxed">
                We strive for excellence in every aspect of our platform, from content quality 
                to user experience, ensuring learners receive the best possible education.
              </p>
            </div>

            <div className="card p-8 hover:shadow-lg transition-all duration-300 group">
              <div className="flex justify-center mb-6">
                <Image
                  src="/icons8/icons8-connect-100.png"
                  alt="Accessibility"
                  width={64}
                  height={64}
                  className="w-16 h-16 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-4">Accessibility</h3>
              <p className="text-muted-foreground leading-relaxed">
                Education should be available to everyone. We design our platform to be 
                inclusive and accessible to learners of all backgrounds and abilities.
              </p>
            </div>

            <div className="card p-8 hover:shadow-lg transition-all duration-300 group">
              <div className="flex justify-center mb-6">
                <Image
                  src="/icons8/icons8-idea-100.png"
                  alt="Innovation"
                  width={64}
                  height={64}
                  className="w-16 h-16 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-4">Innovation</h3>
              <p className="text-muted-foreground leading-relaxed">
                We continuously explore new technologies and methodologies to enhance 
                learning experiences and stay at the forefront of educational innovation.
              </p>
            </div>

            <div className="card p-8 hover:shadow-lg transition-all duration-300 group">
              <div className="flex justify-center mb-6">
                <Image
                  src="/icons8/icons8-services-100.png"
                  alt="Quality"
                  width={64}
                  height={64}
                  className="w-16 h-16 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-4">Quality</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every course, quiz, and feature is carefully crafted and thoroughly tested 
                to ensure the highest quality learning experience for our users.
              </p>
            </div>

            <div className="card p-8 hover:shadow-lg transition-all duration-300 group">
              <div className="flex justify-center mb-6">
                <Image
                  src="/icons8/icons8-synchronize-100.png"
                  alt="Growth"
                  width={64}
                  height={64}
                  className="w-16 h-16 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-4">Growth</h3>
              <p className="text-muted-foreground leading-relaxed">
                We believe in continuous learning and growth, both for our users and our team. 
                Every challenge is an opportunity to learn and improve.
              </p>
            </div>

            <div className="card p-8 hover:shadow-lg transition-all duration-300 group">
              <div className="flex justify-center mb-6">
                <Image
                  src="/icons8/icons8-contacts-100.png"
                  alt="Community"
                  width={64}
                  height={64}
                  className="w-16 h-16 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-4">Community</h3>
              <p className="text-muted-foreground leading-relaxed">
                Learning is better together. We foster a supportive community where 
                learners can connect, share knowledge, and support each other&apos;s growth.
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
              Trusted by Learners Worldwide
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join thousands of students and professionals who are already transforming their careers with Acadex.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl font-bold text-brand mb-2">50K+</div>
                <div className="text-sm text-muted-foreground font-medium">Active Students</div>
              </div>
            </div>
            <div className="text-center">
              <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl font-bold text-brand mb-2">100+</div>
                <div className="text-sm text-muted-foreground font-medium">Expert Courses</div>
              </div>
            </div>
            <div className="text-center">
              <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl font-bold text-brand mb-2">500+</div>
                <div className="text-sm text-muted-foreground font-medium">Interactive Quizzes</div>
              </div>
            </div>
            <div className="text-center">
              <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl font-bold text-brand mb-2">95%</div>
                <div className="text-sm text-muted-foreground font-medium">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Join thousands of students who are already achieving their goals with Acadex.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-brand text-brand-foreground hover:bg-brand/90 px-6 py-3 rounded-lg font-medium transition-colors duration-200 text-center">
              Get Started Today
            </Link>
            <Link href="/courses" className="border border-brand text-brand hover:bg-brand hover:text-brand-foreground px-6 py-3 rounded-lg font-medium transition-colors duration-200 text-center">
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
