import SvgIcon from '@/components/ui/SvgIcon'

export default function Features() {
  const features = [
    {
      icon: <SvgIcon icon="book" size={24} variant="white" />,
      title: "Grammar Mastery",
      description: "Master English grammar with comprehensive lessons covering all levels from basic to advanced structures."
    },
    {
      icon: <SvgIcon icon="award" size={24} variant="white" />,
      title: "IELTS Preparation",
      description: "Achieve your target IELTS score with specialized practice tests, strategies, and expert feedback."
    },
    {
      icon: <SvgIcon icon="dictionary" size={24} variant="white" />,
      title: "Vocabulary Builder",
      description: "Expand your vocabulary with 10,000+ words, phrases, and idioms used in real English contexts."
    },
    {
      icon: <SvgIcon icon="microphone" size={24} variant="white" />,
      title: "Pronunciation Practice",
      description: "Perfect your English pronunciation with AI-powered speech recognition and phonetic training."
    },
    {
      icon: <SvgIcon icon="chart" size={24} variant="white" />,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics and personalized study recommendations."
    },
    {
      icon: <SvgIcon icon="clock" size={24} variant="white" />,
      title: "Flexible Learning",
      description: "Study anytime, anywhere with mobile-friendly lessons and offline content access."
    }
  ]

  return (
    <section className="py-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium mb-4 border">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            Why Choose ACADEX
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Everything You Need to Master English
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
            From IELTS preparation to grammar mastery, our comprehensive platform provides all the tools you need for English fluency.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="group animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="card p-6 h-full transition-all duration-200 hover:shadow-lg">
                {/* Icon Container */}
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground mb-4 group-hover:scale-110 transition-transform duration-200">
                  {feature.icon}
                </div>
                
                <h3 className="text-lg md:text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  {feature.description}
                </p>
                
                {/* Hover Arrow */}
                <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 mt-4">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
