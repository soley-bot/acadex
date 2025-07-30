import Image from 'next/image'
import Link from "next/link";
import SvgIcon from '@/components/ui/SvgIcon'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gray-50"></div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-full text-sm font-medium mb-8 border border-gray-200">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            About ACADEX
          </div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight mb-8 text-black">
            Empowering English Learners
            <span className="block text-red-600 mt-2">Worldwide</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            We&apos;re dedicated to helping students master English through comprehensive IELTS preparation, 
            grammar mastery, vocabulary building, and interactive learning experiences.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-red-200">
                Our Mission
              </div>
              <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-6 text-black">
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
                <Link href="/courses" className="bg-red-600 text-white hover:bg-red-700 px-8 py-4 rounded-lg font-bold transition-all duration-200 text-center shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  Start Learning English
                </Link>
                <Link href="/quizzes" className="border-2 border-black text-black hover:bg-black hover:text-white px-8 py-4 rounded-lg font-bold transition-all duration-200 text-center">
                  Take Practice Test
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl transform hover:scale-105 transition-transform duration-300">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-2xl">🎯</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-4 text-center text-black">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed text-center">
                  To become the world&apos;s leading platform for English language learning, 
                  where every student can achieve fluency, excel in IELTS, and unlock global opportunities 
                  through confident English communication.
                </p>
                <div className="mt-8 pt-6 border-t border-gray-200">
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
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Values Section */}
      <section className="py-20 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-full text-sm font-medium mb-8 border border-gray-300">
              Our Values
            </div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-6 text-black">
              What Drives Our English Education Mission
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              These core principles guide our commitment to helping students achieve English fluency and academic success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-red-600 text-2xl">✅</span>
                </div>
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-4 text-black">IELTS Excellence</h3>
              <p className="text-gray-600 leading-relaxed">
                We provide comprehensive IELTS preparation with authentic practice tests, expert strategies, 
                and personalized feedback to help students achieve their target band scores.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-red-600 text-2xl">🌍</span>
                </div>
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-4 text-black">Global Accessibility</h3>
              <p className="text-gray-600 leading-relaxed">
                English opens global opportunities. We make quality English education accessible 
                to learners worldwide, regardless of location or background.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-red-600 text-2xl">⚡</span>
                </div>
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-4 text-black">Adaptive Learning</h3>
              <p className="text-gray-600 leading-relaxed">
                We use innovative technology to create personalized learning paths that adapt 
                to each student&apos;s level, learning style, and goals for maximum effectiveness.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-red-600 text-2xl">⭐</span>
                </div>
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-4 text-black">Proven Methods</h3>
              <p className="text-gray-600 leading-relaxed">
                Our curriculum combines proven language acquisition techniques with modern 
                interactive methods to ensure effective and engaging English learning.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-red-600 text-2xl">📈</span>
                </div>
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-4 text-black">Continuous Progress</h3>
              <p className="text-gray-600 leading-relaxed">
                We believe in continuous improvement. Our platform tracks your progress 
                and adapts to help you achieve steady growth in your English proficiency.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-red-600 text-2xl">👥</span>
                </div>
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-4 text-black">Learning Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Join a global community of English learners who support each other, share 
                experiences, and celebrate achievements together on their language learning journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-6 text-black">
              Trusted by English Learners Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join thousands of students who are achieving their English goals and unlocking global opportunities with ACADEX.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-black text-red-600 mb-2">25K+</div>
                <div className="text-sm text-gray-600 font-medium">English Students</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-black text-red-600 mb-2">2,500+</div>
                <div className="text-sm text-gray-600 font-medium">IELTS Questions</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-black text-red-600 mb-2">150+</div>
                <div className="text-sm text-gray-600 font-medium">Grammar Topics</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-black text-red-600 mb-2">92%</div>
                <div className="text-sm text-gray-600 font-medium">Score Improvement</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-6 text-white">
            Ready to Master English?
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Join thousands of students who are achieving IELTS success and English fluency with ACADEX.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-red-600 text-white hover:bg-red-700 px-8 py-4 rounded-lg font-bold transition-all duration-200 text-center shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Start Learning Today
            </Link>
            <Link href="/courses" className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 rounded-lg font-bold transition-all duration-200 text-center">
              Browse English Courses
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
