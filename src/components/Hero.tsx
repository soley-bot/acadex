import Link from 'next/link'

// Modern geometric elements for visual appeal
const GeometricPattern = () => (
  <div className="absolute inset-0 opacity-5 pointer-events-none">
    <div className="absolute top-20 left-10 w-32 h-32 border border-black transform rotate-45" />
    <div className="absolute top-40 right-20 w-24 h-24 bg-red-600 transform rotate-12 opacity-20" />
    <div className="absolute bottom-32 left-1/4 w-16 h-16 border-2 border-gray-300 rounded-full" />
    <div className="absolute bottom-20 right-1/3 w-20 h-20 bg-black transform rotate-45 opacity-10" />
  </div>
)

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      <GeometricPattern />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-full text-sm font-medium mb-8 border border-gray-200">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            #1 Learning Platform
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 text-black">
            Master Any Subject with
            <span className="block text-red-600 mt-2">
              Interactive Learning
            </span>
            <span className="block text-black">
              & Expert Courses
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
            From languages and academics to professional skills and test preparation. 
            Discover personalized learning paths designed by industry experts.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Link 
              href="/courses" 
              className="bg-red-600 text-white hover:bg-red-700 px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Explore Courses
              <span aria-hidden="true" className="text-2xl">→</span>
            </Link>
            <Link 
              href="/quizzes" 
              className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 transform hover:-translate-y-1"
            >
              Start Practicing
              <span aria-hidden="true" className="text-2xl">📝</span>
            </Link>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-20">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="text-4xl md:text-5xl font-black text-red-600 mb-2">10K+</div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Learners</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="text-4xl md:text-5xl font-black text-black mb-2">500+</div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Practice Questions</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="text-4xl md:text-5xl font-black text-black mb-2">50+</div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Expert Courses</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="text-4xl md:text-5xl font-black text-red-600 mb-2">95%</div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Success Rate</div>
            </div>
          </div>
        </div>
        
        {/* Learning Dashboard Preview */}
        <div className="mt-16 flow-root">
          <div className="mx-auto max-w-5xl">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 transform hover:scale-105 transition-all duration-500">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-black">Learning Dashboard</h3>
                    <p className="text-gray-600">Your personalized learning journey</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 font-medium">Today</div>
              </div>
              
              {/* Course Progress Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-black">Web Development</span>
                    <span className="text-sm text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-red-600 h-3 rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-black">Data Science</span>
                    <span className="text-sm text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full">72%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-red-600 h-3 rounded-full transition-all duration-500" style={{ width: '72%' }}></div>
                  </div>
                </div>
              </div>
              
              {/* Achievement Section */}
              <div className="flex items-center gap-4 p-6 bg-black rounded-xl text-white">
                <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">🏆</span>
                </div>
                <div>
                  <div className="font-bold text-lg">Congratulations!</div>
                  <div className="text-gray-300">You completed 5 lessons this week</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
