import { Card, CardContent } from '@/components/ui/card'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'
import { BlobBackground } from '@/components/ui/BlobBackground'
import { Clock, Video, Users, Puzzle, ArrowRight } from 'lucide-react'

export default function Features() {
  const features = [
    {
      icon: Clock,
      title: "Short, simple lessons",
      description: "Easy to follow. No long lectures. Just what you need to know."
    },
    {
      icon: Video,
      title: "Helpful illustration videos",
      description: "We use visuals to explain concepts clearly — even if English isn't your strength."
    },
    {
      icon: Users,
      title: "Community learning support",
      description: "Connect with fellow learners and get help when you need it most."
    },
    {
      icon: Puzzle,
      title: "Interactive practice exercises",
      description: "Learn by doing with hands-on activities that make concepts stick."
    }
  ]

  return (
    <Section 
      className="relative overflow-hidden py-16 md:py-20 lg:py-24"
      background="gradient"
    >
      {/* Standardized Animated Background */}
      <BlobBackground variant="default" />

      <Container size="xl" className="relative">
        {/* Section Header - Professional Typography */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full shadow-lg mb-8">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span className="font-medium">Why Learn with Acadex</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 tracking-tight">
            What You&apos;ll Learn
          </h2>
          
          <div className="max-w-4xl mx-auto leading-relaxed text-gray-600">
            <div className="space-y-2 text-lg">
              <div>• Everyday English for work and life</div>
              <div>• Communication skills for school, interviews, and more</div>
              <div>• How to study better and stay focused</div>
              <div>• Career preparation and confidence building</div>
            </div>
            <div className="mt-6 text-sm">
              New topics are coming — we&apos;re starting small but growing.
            </div>
          </div>
        </div>

        {/* Features Grid - Professional Card System */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="group">
                <Card variant="glass" className="p-8 h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <CardContent className="p-0">
                    {/* Icon Container */}
                    <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-8 group-hover:bg-secondary transition-all duration-300 shadow-lg text-white">
                      <IconComponent size={36} />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    {/* Hover Arrow */}
                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 mt-8">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shadow-lg">
                        <ArrowRight size={20} className="text-white" />
                      </div>
                    </div>
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
