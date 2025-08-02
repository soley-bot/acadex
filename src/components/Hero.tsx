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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-6000"></div>
      </div>
      
      <Container size="xl" className="relative text-center">
        <div className="max-w-4xl mx-auto">
          {/* Hero Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-full text-sm lg:text-base font-medium mb-8 lg:mb-12 shadow-lg transform hover:scale-105 transition-all duration-200">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            #1 Learning Platform
          </div>
          
          {/* Main Heading */}
          <DisplayXL className="mb-8 lg:mb-12 leading-tight">
            Master Any Subject with
            <span className="block text-red-600 mt-4">
              Interactive Learning
            </span>
            <span className="block text-gray-700 mt-2">
              & Expert Courses
            </span>
          </DisplayXL>
          
          {/* Subtitle */}
          <BodyLG 
            color="muted" 
            className="mb-12 lg:mb-16 leading-relaxed max-w-3xl mx-auto"
          >
            From languages and academics to professional skills and test preparation. 
            Discover personalized learning paths designed by industry experts.
          </BodyLG>
          
          {/* CTA Buttons */}
          <Flex direction="col" gap="md" className="sm:flex-row justify-center mb-20 lg:mb-24">
            <Link href="/courses">
              <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 lg:px-10 lg:py-5 rounded-2xl font-bold text-lg lg:text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 min-w-[200px]">
                Explore Courses
                <span className="ml-3 text-xl">→</span>
              </button>
            </Link>
            <Link href="/quizzes">
              <button className="border-2 border-red-600 text-red-600 bg-white/80 backdrop-blur-sm hover:bg-red-600 hover:text-white px-8 py-4 lg:px-10 lg:py-5 rounded-2xl font-bold text-lg lg:text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 min-w-[200px]">
                Start Practicing
                <Icon name="edit" size={20} className="ml-3" />
              </button>
            </Link>
          </Flex>
          
          {/* Stats Section */}
          <Grid cols={2} className="md:grid-cols-4 max-w-5xl mx-auto mb-20 lg:mb-24">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 lg:p-8 shadow-xl border border-white/20 transform hover:scale-105 transition-all duration-300">
              <Typography variant="display-md" color="primary" className="mb-2">10K+</Typography>
              <BodyMD color="muted" className="font-medium">Active Learners</BodyMD>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 lg:p-8 shadow-xl border border-white/20 transform hover:scale-105 transition-all duration-300">
              <Typography variant="display-md" className="mb-2">500+</Typography>
              <BodyMD color="muted" className="font-medium">Practice Questions</BodyMD>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 lg:p-8 shadow-xl border border-white/20 transform hover:scale-105 transition-all duration-300">
              <Typography variant="display-md" className="mb-2">50+</Typography>
              <BodyMD color="muted" className="font-medium">Expert Courses</BodyMD>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 lg:p-8 shadow-xl border border-white/20 transform hover:scale-105 transition-all duration-300">
              <Typography variant="display-md" color="primary" className="mb-2">95%</Typography>
              <BodyMD color="muted" className="font-medium">Success Rate</BodyMD>
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
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Icon name="target" size={32} color="white" />
                  </div>
                  <div>
                    <H3 className="mb-1">Learning Dashboard</H3>
                    <BodyMD color="muted">Your personalized learning journey</BodyMD>
                  </div>
                </Flex>
                <BodyMD color="muted" className="font-medium bg-gray-100 px-3 py-1 rounded-full">Today</BodyMD>
              </Flex>
              
              {/* Course Progress Grid */}
              <Grid cols={1} className="md:grid-cols-2 mb-8 lg:mb-12">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <Flex align="center" justify="between" className="mb-4 lg:mb-6">
                    <H3>Web Development</H3>
                    <Typography variant="body-md" color="primary" className="font-bold bg-red-50 px-3 py-1 lg:px-4 lg:py-2 rounded-full">85%</Typography>
                  </Flex>
                  <div className="w-full bg-gray-200 rounded-full h-3 lg:h-4">
                    <div className="bg-gradient-to-r from-red-600 to-red-700 h-3 lg:h-4 rounded-full transition-all duration-500 shadow-sm" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <Flex align="center" justify="between" className="mb-4 lg:mb-6">
                    <H3>Data Science</H3>
                    <Typography variant="body-md" color="primary" className="font-bold bg-red-50 px-3 py-1 lg:px-4 lg:py-2 rounded-full">72%</Typography>
                  </Flex>
                  <div className="w-full bg-gray-200 rounded-full h-3 lg:h-4">
                    <div className="bg-gradient-to-r from-red-600 to-red-700 h-3 lg:h-4 rounded-full transition-all duration-500 shadow-sm" style={{ width: '72%' }}></div>
                  </div>
                </div>
              </Grid>
              
              {/* Achievement Section */}
              <Flex 
                align="center" 
                gap="md" 
                className="p-6 lg:p-8 bg-gradient-to-r from-gray-700 to-gray-600 rounded-2xl text-white shadow-xl"
              >
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg">
                  <Icon name="trophy" size={32} color="white" />
                </div>
                <div>
                  <Typography variant="h3" className="text-white mb-1">Congratulations!</Typography>
                  <BodyMD className="text-gray-300">You completed 5 lessons this week</BodyMD>
                </div>
              </Flex>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
