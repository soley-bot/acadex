import { Card, CardContent } from '@/components/ui/card'
import { BlobBackground } from '@/components/ui/BlobBackground'
import { CheckCircle, Zap, Crosshair, BarChart, ArrowRight } from 'lucide-react'
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
    <section
      className="relative overflow-hidden section-padding"
    >
      {/* Standardized Animated Background */}
      <BlobBackground variant="default" />

      <div className="container container-xl relative">
        {/* Section Header - Fluid Typography */}
        <AnimatedDiv variant="fadeInUp" className="text-center space-y-6 mb-12">
          <AnimatedDiv variant="scaleIn" delay={0.2}>
            <div className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span className="font-medium">A Smarter Way to Prepare</span>
            </div>
          </AnimatedDiv>

          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 tracking-tight leading-tight md:leading-tight">
            Focus on What Truly Matters for Your Score
          </h2>

          <div className="max-w-4xl mx-auto leading-relaxed text-gray-600">
            <p className="text-base md:text-lg lg:text-xl">
              Getting a high score in IELTS is not about knowing everything. It is about mastering the foundational skills that examiners look for. We help you isolate and fix the common errors in vocabulary and grammar that are preventing you from reaching your goal.
            </p>
          </div>
        </AnimatedDiv>

        {/* Features Grid - Fluid Card System */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <StaggerItem key={index}>
                <HoverScale scale={1.03} className="group h-full">
                  <Card variant="glass" className="p-6 h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <CardContent className="p-0 space-y-4">
                      {/* Icon Container */}
                      <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center group-hover:bg-secondary transition-all duration-300 shadow-lg text-white">
                        <IconComponent size={30} />
                      </div>

                      <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>

                      <p className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </HoverScale>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  )
}