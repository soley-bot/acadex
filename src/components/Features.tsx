import { Card, CardContent } from '@/components/ui/card'
import { Container, Section } from '@/components/ui/Layout'
import { BlobBackground } from '@/components/ui/BlobBackground'
import { CheckCircle, Zap, Crosshair, BarChart, ArrowRight } from 'lucide-react'

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
    <Section 
      className="relative overflow-hidden py-12 md:py-16 lg:py-20"
      background="gradient"
    >
      {/* Standardized Animated Background */}
      <BlobBackground variant="default" />

      <Container size="xl" className="relative">
        {/* Section Header - Professional Typography */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full shadow-lg mb-6">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span className="font-medium">A Smarter Way to Prepare</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Focus on What Truly Matters for Your Score
          </h2>
          
          <div className="max-w-4xl mx-auto leading-relaxed text-gray-600">
            <p className="space-y-2 text-lg">
              Getting a high score in IELTS is not about knowing everything. It is about mastering the foundational skills that examiners look for. We help you isolate and fix the common errors in vocabulary and grammar that are preventing you from reaching your goal.
            </p>
          </div>
        </div>

        {/* Features Grid - Professional Card System */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="group">
                <Card variant="glass" className="p-6 h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <CardContent className="p-0">
                    {/* Icon Container */}
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary transition-all duration-300 shadow-lg text-white">
                      <IconComponent size={30} />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  )
}
