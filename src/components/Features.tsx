import { Typography, DisplayLG, H2, H3, BodyLG, BodyMD } from '@/components/ui/Typography'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'
import Icon, { IconName } from '@/components/ui/Icon'

export default function Features() {
  const features = [
    {
      icon: "book" as IconName,
      title: "Interactive Courses",
      description: "Learn with engaging video lessons, interactive exercises, and hands-on projects across multiple subjects."
    },
    {
      icon: "target" as IconName,
      title: "Personalized Learning",
      description: "AI-powered recommendations adapt to your learning style and pace for maximum effectiveness."
    },
    {
      icon: "trophy" as IconName,
      title: "Skill Assessments",
      description: "Test your knowledge with comprehensive quizzes and earn certificates to showcase your achievements."
    },
    {
      icon: "users" as IconName,
      title: "Expert Instructors",
      description: "Learn from industry professionals and subject matter experts with years of teaching experience."
    },
    {
      icon: "chart" as IconName,
      title: "Progress Analytics",
      description: "Track your learning journey with detailed insights and performance metrics to stay motivated."
    },
    {
      icon: "clock" as IconName,
      title: "Flexible Schedule",
      description: "Study at your own pace with 24/7 access to all content on any device, anywhere in the world."
    }
  ]

  return (
    <Section 
      className="relative overflow-hidden"
      background="gradient"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-40 left-20 w-64 h-64 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
        <div className="absolute bottom-40 right-20 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-20 right-40 w-48 h-48 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <Container size="xl" className="relative">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full text-sm lg:text-base font-medium mb-8 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Why Choose ACADEX
          </div>
          
          <DisplayLG className="mb-8 tracking-tight">
            Everything You Need to
            <span className="block text-red-600 mt-4">
              Master Any Subject
            </span>
          </DisplayLG>
          
          <BodyLG 
            color="muted" 
            className="max-w-4xl mx-auto leading-relaxed"
          >
            From languages and academics to professional skills and certifications. Our comprehensive platform 
            provides all the tools you need for success.
          </BodyLG>
        </div>

        {/* Features Grid */}
        <Grid cols={1} className="md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-2xl hover:border-red-200 hover:-translate-y-2 shadow-lg">
                {/* Icon Container */}
                <div className="w-20 h-20 bg-gradient-to-r from-gray-600 to-gray-500 rounded-2xl flex items-center justify-center mb-8 group-hover:from-red-600 group-hover:to-red-700 transition-all duration-300 shadow-lg">
                  <Icon name={feature.icon} size={36} color="white" />
                </div>
                
                <H3 className="mb-4 group-hover:text-red-600 transition-colors">
                  {feature.title}
                </H3>
                
                <BodyLG color="muted" className="leading-relaxed">
                  {feature.description}
                </BodyLG>
                
                {/* Hover Arrow */}
                <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 mt-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg">
                    <Icon name="arrow-right" size={20} color="white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Grid>
      </Container>
    </Section>
  )
}
