import { Typography, DisplayLG, H2, H3, BodyLG, BodyMD } from '@/components/ui/Typography'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'
import Icon, { IconName } from '@/components/ui/Icon'

export default function Features() {
  const features = [
    {
      icon: "clock" as IconName,
      title: "Short, simple lessons",
      description: "Easy to follow. No long lectures. Just what you need to know."
    },
    {
      icon: "video" as IconName,
      title: "Helpful illustration videos",
      description: "We use visuals to explain concepts clearly — even if English isn't your strength."
    },
    {
      icon: "heart" as IconName,
      title: "Made for Cambodian learners",
      description: "Our courses are designed with your real-life needs in mind."
    },
    {
      icon: "user" as IconName,
      title: "Learn at your own pace",
      description: "No deadlines. No stress. Start anytime and learn from anywhere."
    }
  ]

  return (
    <Section 
      className="relative overflow-hidden"
      background="gradient"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-40 left-20 w-64 h-64 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
        <div className="absolute bottom-40 right-20 w-64 h-64 bg-warning/30 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-20 right-40 w-48 h-48 bg-secondary/30 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <Container size="xl" className="relative">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-gray-900 px-6 py-3 rounded-full text-sm lg:text-base font-medium mb-8 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Why Learn with Acadex
          </div>
          
          <DisplayLG className="mb-8 tracking-tight">
            What You&apos;ll Learn
          </DisplayLG>
          
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

        {/* Features Grid */}
        <Grid cols={1} className="md:grid-cols-2 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-2xl hover:border-secondary hover:-translate-y-2 shadow-lg">
                {/* Icon Container */}
                <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-8 group-hover:bg-secondary transition-all duration-300 shadow-lg text-black group-hover:text-white">
                  <Icon name={feature.icon} size={36} color="current" />
                </div>
                
                <H3 className="mb-4 group-hover:text-primary transition-colors">
                  {feature.title}
                </H3>
                
                <BodyLG color="muted" className="leading-relaxed">
                  {feature.description}
                </BodyLG>
                
                {/* Hover Arrow */}
                <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 mt-8">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shadow-lg">
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
