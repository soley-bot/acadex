import Link from 'next/link'
import { LinkButton } from '@/components/ui/LinkButton'
import { Typography, DisplayXL, H2, H3, BodyLG, BodyMD } from '@/components/ui/Typography'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'
import Icon from '@/components/ui/Icon'

export default function Hero() {
  return (
    <Section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      background="gradient"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-warning/30 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-6000"></div>
      </div>
      
      <Container size="xl" className="relative text-center">
        <div className="max-w-4xl mx-auto">
          {/* Hero Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-gray-900 px-4 py-2 lg:px-6 lg:py-3 rounded-full text-sm lg:text-base font-medium mb-8 lg:mb-12 shadow-lg transform hover:scale-105 transition-all duration-200">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Made for Cambodian Learners
          </div>
          
          {/* Main Heading */}
          <DisplayXL className="mb-8 lg:mb-12 leading-tight">
            Learn Real Skills,
            <span className="block text-primary mt-4">
              Your Way
            </span>
          </DisplayXL>
          
          {/* Subtitle */}
          <BodyLG 
            color="muted" 
            className="mb-12 lg:mb-16 leading-relaxed max-w-3xl mx-auto"
          >
            Acadex is a growing online platform made for Cambodian students and young professionals. 
            We offer simple lessons and clear explanations — with short videos, friendly visuals, and zero pressure.
          </BodyLG>
          
          {/* CTA Buttons */}
          <Flex direction="col" gap="md" className="sm:flex-row justify-center mb-20 lg:mb-24">
            <Link href="/courses">
              <button className="bg-primary hover:bg-secondary text-black hover:text-white px-8 py-4 lg:px-10 lg:py-5 rounded-2xl font-bold text-lg lg:text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 min-w-[200px]">
                Browse Courses
                <span className="ml-3 text-xl">→</span>
              </button>
            </Link>
            <Link href="/quizzes">
              <button className="border-2 border-secondary text-secondary bg-white/80 backdrop-blur-sm hover:bg-primary hover:text-black px-8 py-4 lg:px-10 lg:py-5 rounded-2xl font-bold text-lg lg:text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 min-w-[200px] flex items-center justify-center">
                Try Our Quiz
                <span className="ml-3"></span>
              </button>
            </Link>
          </Flex>
          
          {/* Stats Section */}
          <Grid cols={2} className="md:grid-cols-4 max-w-5xl mx-auto mb-20 lg:mb-24">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 lg:p-8 shadow-xl border border-white/20 transform hover:scale-105 transition-all duration-300">
              <Typography variant="display-md" color="primary" className="mb-2">100+</Typography>
              <BodyMD color="muted" className="font-medium">Early Learners</BodyMD>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 lg:p-8 shadow-xl border border-white/20 transform hover:scale-105 transition-all duration-300">
              <Typography variant="display-md" className="mb-2">50+</Typography>
              <BodyMD color="muted" className="font-medium">Practice Questions</BodyMD>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 lg:p-8 shadow-xl border border-white/20 transform hover:scale-105 transition-all duration-300">
              <Typography variant="display-md" className="mb-2">5+</Typography>
              <BodyMD color="muted" className="font-medium">Quality Courses</BodyMD>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 lg:p-8 shadow-xl border border-white/20 transform hover:scale-105 transition-all duration-300">
              <Typography variant="display-md" color="primary" className="mb-2">100%</Typography>
              <BodyMD color="muted" className="font-medium">Made with Care</BodyMD>
            </div>
          </Grid>

          {/* Learning Dashboard Preview */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-12 transform hover:scale-[1.02] transition-all duration-500">
              {/* Dashboard Header */}
              <Flex 
                align="center" 
                justify="between" 
                className="mb-8 lg:mb-12 pb-6 lg:pb-8 border-b border-gray-200"
              >
                <Flex align="center" gap="md">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-secondary to-secondary/90 rounded-2xl flex items-center justify-center shadow-lg">
                    <Icon name="target" size={32} color="white" />
                  </div>
                  <div>
                    <H3 className="mb-1">Learning Dashboard</H3>
                    <BodyMD color="muted">Your personalized learning journey</BodyMD>
                  </div>
                </Flex>
                <BodyMD color="muted" className="font-medium bg-muted/40 px-3 py-1 rounded-full">Today</BodyMD>
              </Flex>
              
              {/* Course Progress Grid */}
              <Grid cols={1} className="md:grid-cols-2 mb-8 lg:mb-12">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <Flex align="center" justify="between" className="mb-4 lg:mb-6">
                    <H3>Everyday English</H3>
                    <Typography variant="body-md" color="primary" className="font-bold bg-primary/10 px-3 py-1 lg:px-4 lg:py-2 rounded-full">70%</Typography>
                  </Flex>
                  <div className="w-full bg-muted/60 rounded-full h-3 lg:h-4">
                    <div className="bg-gradient-to-r from-primary to-primary/90 h-3 lg:h-4 rounded-full transition-all duration-500 shadow-sm" style={{ width: '70%' }}></div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <Flex align="center" justify="between" className="mb-4 lg:mb-6">
                    <H3>Study Skills</H3>
                    <Typography variant="body-md" color="primary" className="font-bold bg-primary/10 px-3 py-1 lg:px-4 lg:py-2 rounded-full">45%</Typography>
                  </Flex>
                  <div className="w-full bg-muted/60 rounded-full h-3 lg:h-4">
                    <div className="bg-gradient-to-r from-primary to-primary/90 h-3 lg:h-4 rounded-full transition-all duration-500 shadow-sm" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </Grid>
              
              {/* Achievement Section */}
              <Flex 
                align="center" 
                gap="md" 
                className="p-6 lg:p-8 bg-gradient-to-r from-primary/5 via-white to-secondary/5 rounded-2xl text-secondary shadow-xl"
              >
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Icon name="trophy" size={32} color="gray-900" />
                </div>
                <div>
                  <Typography variant="h3" className="text-secondary mb-1">Great progress!</Typography>
                  <BodyMD className="text-gray-600">You completed 3 lessons this week</BodyMD>
                </div>
              </Flex>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
