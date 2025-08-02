import Image from 'next/image'
import Link from "next/link";
import Icon from '@/components/ui/Icon';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-6000"></div>
      </div>
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full text-sm lg:text-base font-medium mb-8 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            About ACADEX
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-8 leading-tight">
            Empowering English Learners
            <span className="block text-red-600 mt-4">Worldwide</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We&apos;re dedicated to helping students master English through comprehensive IELTS preparation, 
            grammar mastery, vocabulary building, and interactive learning experiences.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
                Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-gray-900">
                Transforming English Education
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At ACADEX, we believe every student deserves access to world-class English education. 
                Our platform combines proven language learning methodologies with cutting-edge technology 
                to create engaging, effective learning experiences.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Whether you&apos;re preparing for IELTS, improving your grammar, building vocabulary, or 
                mastering pronunciation, we provide the tools and support you need to achieve English fluency 
                and reach your academic or professional goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/courses">
                  <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
                    Start Learning English
                  </button>
                </Link>
                <Link href="/quizzes">
                  <button className="border-2 border-red-600 text-red-600 bg-white/80 backdrop-blur-sm hover:bg-red-600 hover:text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
                    Take Practice Test
                  </button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg">
                    <Icon name="target" size={32} color="white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-4">Our Vision</h3>
                <p className="text-lg text-gray-700 text-center leading-relaxed mb-6">
                  To become the world&apos;s leading platform for English language learning, 
                  where every student can achieve fluency, excel in IELTS, and unlock global opportunities 
                  through confident English communication.
                </p>
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div>
                      <div className="text-3xl font-bold text-red-600">25K+</div>
                      <div className="text-sm text-gray-600 font-medium">English Learners</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-red-600">50+</div>
                      <div className="text-sm text-gray-600 font-medium">English Courses</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-lg text-red-600 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20 shadow-lg">
              Our Values
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-gray-900">
              What Drives Our English Education Mission
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              These core principles guide our commitment to helping students achieve English fluency and academic success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Value Card 1 */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Icon name="check-circle" size={32} color="white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-red-600 transition-colors">IELTS Excellence</h3>
              <p className="text-gray-600 leading-relaxed">
                We provide comprehensive IELTS preparation with authentic practice tests, expert strategies, and personalized feedback to help students achieve their target band scores.
              </p>
            </div>

            {/* Value Card 2 */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Icon name="globe" size={32} color="white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-red-600 transition-colors">Global Accessibility</h3>
              <p className="text-gray-600 leading-relaxed">
                English opens global opportunities. We make quality English education accessible to learners worldwide, regardless of location or background.
              </p>
            </div>

            {/* Value Card 3 */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Icon name="lightning" size={32} color="white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-red-600 transition-colors">Adaptive Learning</h3>
              <p className="text-gray-600 leading-relaxed">
                We use innovative technology to create personalized learning paths that adapt to each student&apos;s level, learning style, and goals for maximum effectiveness.
              </p>
            </div>

            {/* Value Card 4 */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Icon name="star" size={32} color="white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-red-600 transition-colors">Proven Methods</h3>
              <p className="text-gray-600 leading-relaxed">
                Our curriculum combines proven language acquisition techniques with modern interactive methods to ensure effective and engaging English learning.
              </p>
            </div>

            {/* Value Card 5 */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Icon name="trending" size={32} color="white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-red-600 transition-colors">Continuous Progress</h3>
              <p className="text-gray-600 leading-relaxed">
                We believe in continuous improvement. Our platform tracks your progress and adapts to help you achieve steady growth in your English proficiency.
              </p>
            </div>

            {/* Value Card 6 */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Icon name="users" size={32} color="white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-red-600 transition-colors">Learning Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Join a global community of English learners who support each other, share experiences, and celebrate achievements together on their language learning journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="relative py-16 px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
              Trusted by English Learners Worldwide
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join thousands of students who are achieving their English goals and unlocking global opportunities with ACADEX.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl font-bold text-red-600 mb-2">25K+</div>
              <div className="text-gray-600 font-medium">English Students</div>
            </div>
            <div className="text-center p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl font-bold text-red-600 mb-2">2,500+</div>
              <div className="text-gray-600 font-medium">IELTS Questions</div>
            </div>
            <div className="text-center p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl font-bold text-red-600 mb-2">150+</div>
              <div className="text-gray-600 font-medium">Grammar Topics</div>
            </div>
            <div className="text-center p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl font-bold text-red-600 mb-2">92%</div>
              <div className="text-gray-600 font-medium">Score Improvement</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-12 text-center shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Master English?
            </h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Join thousands of students who are achieving IELTS success and English fluency with ACADEX.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
                  Start Learning Today
                </button>
              </Link>
              <Link href="/courses">
                <button className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:-translate-y-1">
                  Browse English Courses
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
