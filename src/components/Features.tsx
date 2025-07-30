export default function Features() {
  const features = [
    {
      icon: "📚",
      title: "Interactive Courses",
      description: "Learn with engaging video lessons, interactive exercises, and hands-on projects across multiple subjects."
    },
    {
      icon: "🎯",
      title: "Personalized Learning",
      description: "AI-powered recommendations adapt to your learning style and pace for maximum effectiveness."
    },
    {
      icon: "🏆",
      title: "Skill Assessments",
      description: "Test your knowledge with comprehensive quizzes and earn certificates to showcase your achievements."
    },
    {
      icon: "👥",
      title: "Expert Instructors",
      description: "Learn from industry professionals and subject matter experts with years of teaching experience."
    },
    {
      icon: "📊",
      title: "Progress Analytics",
      description: "Track your learning journey with detailed insights and performance metrics to stay motivated."
    },
    {
      icon: "⏰",
      title: "Flexible Schedule",
      description: "Study at your own pace with 24/7 access to all content on any device, anywhere in the world."
    }
  ]

  return (
    <section className="py-24 px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-full text-sm font-medium mb-6 border border-gray-200">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            Why Choose ACADEX
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 text-black">
            Everything You Need to
            <span className="block text-red-600 mt-2">
              Master Any Subject
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            From languages and academics to professional skills and certifications. Our comprehensive platform 
            provides all the tools you need for success.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-white border border-gray-200 rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-2xl hover:border-red-300 hover:-translate-y-2">
                {/* Icon Container */}
                <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:bg-red-600 transition-all duration-300 shadow-lg">
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-black group-hover:text-red-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed text-lg">
                  {feature.description}
                </p>
                
                {/* Hover Arrow */}
                <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 mt-8">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
