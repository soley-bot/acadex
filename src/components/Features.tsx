import { CheckCircle, Zap, Crosshair, BarChart } from 'lucide-react'
import { AnimatedDiv, StaggerContainer, StaggerItem, HoverScale } from '@/components/ui/AnimatedComponents'

export default function Features() {
  const features = [
    {
      icon: Crosshair,
      title: "Targeted Micro-Quizzes",
      description: "Stop wasting hours on generic lessons. Fix a specific weakness, like 'Complex Sentences' or 'Environment Vocabulary,' in just 15 minutes."
    },
    {
      icon: CheckCircle,
      title: "Expert-Verified Content",
      description: "Every question is AI-assisted for variety and human-verified for quality by an experienced educator. This isn't just English; it's the English that impresses examiners."
    },
    {
      icon: Zap,
      title: "Instant, Detailed Feedback",
      description: "Understand the 'why' behind every answer. Our clear, detailed explanations in Khmer help you learn from your mistakes so you don't repeat them on exam day."
    },
    {
      icon: BarChart,
      title: "Build Real Mastery",
      description: "Don't just memorize word lists. Our interactive quizzes force you to apply your knowledge in context, building the deep understanding needed for a high score."
    }
  ]

  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl">
        {/* Section Header */}
        <AnimatedDiv variant="fadeInUp" className="text-center space-y-6 mb-16 lg:mb-20">
          <AnimatedDiv variant="scaleIn" delay={0.2}>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-full shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span className="font-semibold">A Smarter Way to Prepare</span>
            </div>
          </AnimatedDiv>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
            Focus on What Truly Matters for Your Score
          </h2>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Getting a high score in IELTS is not about knowing everything. It is about mastering the foundational skills that examiners look for.
          </p>
        </AnimatedDiv>

        {/* Features Grid - Modern Card Design */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <StaggerItem key={index}>
                <HoverScale scale={1.02} className="h-full">
                  <div className="group h-full bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 hover:border-primary/20 transition-all duration-300">
                    {/* Icon Container */}
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                      <IconComponent className="text-white" size={28} />
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </HoverScale>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  )
}
