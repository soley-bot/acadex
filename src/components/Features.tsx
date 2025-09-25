import { Card, CardContent } from '@/components/ui/card'
import { BlobBackground } from '@/components/ui/BlobBackground'
import { CheckCircle, Zap, Crosshair, BarChart, ArrowRight } from 'lucide-react'
import { AnimatedDiv, StaggerContainer, StaggerItem, HoverScale } from '@/components/ui/AnimatedComponents'

export default function Features() {
  const features = [
    {
      icon: Crosshair,
      title: "Focused Practice",
      description: "Target specific areas like listening comprehension or writing structure with bite-sized quizzes designed for quick improvement."
    },
    {
      icon: CheckCircle,
      title: "Quality Questions",
      description: "Every quiz question follows IELTS format standards, giving you authentic practice that mirrors the real exam experience."
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get immediate feedback on your answers with clear explanations to help you understand concepts and improve faster."
    },
    {
      icon: BarChart,
      title: "Track Progress",
      description: "Monitor your improvement across all IELTS sections with simple progress tracking and performance insights."
    }
  ]

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Practice
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple, effective tools to help you prepare for IELTS at your own pace
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <StaggerItem key={index}>
                <div className="text-center group">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6 text-white group-hover:bg-primary/90 transition-colors">
                    <IconComponent size={28} />
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </div>
      </div>
    </section>
  )
}

