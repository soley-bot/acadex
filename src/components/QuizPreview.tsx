'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Typography, DisplayLG, H2, H3, H4, H5, BodyLG, BodyMD } from '@/components/ui/Typography'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'
import Icon from '@/components/ui/Icon'

interface QuizStat {
  title: string
  value: string
  description: string
}

export default function QuizPreview() {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      title: 'Interactive Practice Tests',
      description: 'Comprehensive practice tests across multiple subjects with real-time scoring',
      preview: 'Simulate real exam conditions with detailed feedback'
    },
    {
      title: 'Skill Assessment',
      description: 'Targeted assessments to identify strengths and areas for improvement',
      preview: 'Personalized learning paths based on your performance'
    },
    {
      title: 'Progress Tracking',
      description: 'Track your learning journey with detailed analytics and insights',
      preview: 'Visual progress reports and achievement milestones'
    }
  ]

  const stats: QuizStat[] = [
    {
      title: 'Practice Questions',
      value: '10,000+',
      description: 'Across all subjects'
    },
    {
      title: 'Success Rate',
      value: '95%',
      description: 'Students improve performance'
    },
    {
      title: 'Subject Areas',
      value: '50+',
      description: 'Comprehensive coverage'
    },
    {
      title: 'Study Time',
      value: '15 min',
      description: 'Average daily practice'
    }
  ]

  return (
    <Section 
      className="relative overflow-hidden"
      background="gradient"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      <Container size="xl" className="relative">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full text-sm lg:text-base font-medium mb-8 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Quiz Platform
          </div>
          <DisplayLG className="mb-8 tracking-tight">
            Test Your Skills with Our 
            <span className="block text-red-600 mt-4">Quiz System</span>
          </DisplayLG>
          <BodyLG 
            color="muted" 
            className="max-w-4xl mx-auto leading-relaxed"
          >
            Practice across multiple subjects with our adaptive quiz platform designed for comprehensive skill assessment.
          </BodyLG>
        </div>

        {/* Stats Grid */}
        <Grid cols={2} className="lg:grid-cols-4 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Typography variant="display-md" color="primary" className="mb-3">{stat.value}</Typography>
              <BodyLG className="font-bold mb-2">{stat.title}</BodyLG>
              <Typography variant="caption" className="text-gray-600 font-medium uppercase tracking-wide">{stat.description}</Typography>
            </div>
          ))}
        </Grid>

        {/* Interactive Features Showcase */}
        <Grid cols={1} className="lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Feature Navigation */}
          <div>
            <H2 className="mb-8 tracking-tight">
              Why Students Love Our Quiz System
            </H2>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 ${
                    activeFeature === index
                      ? 'border-red-600 bg-red-50 shadow-lg'
                      : 'border-white/20 bg-white/80 backdrop-blur-lg hover:border-red-300 hover:shadow-md'
                  }`}
                >
                  <Flex align="start" gap="md">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      activeFeature === index 
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <H4 className="mb-2">
                        {feature.title}
                      </H4>
                      <BodyLG color="muted" className="leading-relaxed">
                        {feature.description}
                      </BodyLG>
                    </div>
                  </Flex>
                </button>
              ))}
            </div>
          </div>

          {/* Feature Preview */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl font-black text-white">{activeFeature + 1}</span>
              </div>
              <H4 className="mb-4">
                {features[activeFeature]?.title || 'Feature'}
              </H4>
              <BodyLG color="muted" className="leading-relaxed">
                {features[activeFeature]?.preview || 'Feature preview'}
              </BodyLG>
            </div>

            {/* Mock Interface Preview */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <Flex align="center" justify="between" className="mb-4">
                <Typography variant="caption" className="text-gray-600 font-medium">Question 3 of 10</Typography>
                <Typography variant="caption" color="primary" className="font-bold">85% Complete</Typography>
              </Flex>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div className="bg-gradient-to-r from-red-600 to-red-700 h-3 rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
              </div>
              
              <H5 className="mb-4">
                Which sentence uses the present perfect tense correctly?
              </H5>
              
              <div className="space-y-3">
                <div className="p-4 rounded-lg border-2 border-red-600 bg-red-50 text-red-700 font-medium">
                  I have lived in London for five years.
                </div>
                <div className="p-4 rounded-lg border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors">
                  I am living in London for five years.
                </div>
                <div className="p-4 rounded-lg border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors">
                  I live in London for five years.
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Typography variant="caption" className="text-green-800">
                  <strong>Correct!</strong> Present perfect uses &quot;have/has + past participle&quot; for actions starting in the past and continuing to the present.
                </Typography>
              </div>
            </div>
          </div>
        </Grid>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-2xl p-12 text-white shadow-2xl">
            <H2 className="text-white mb-4">
              Ready to Test Your Skills?
            </H2>
            <BodyLG className="text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of students who are improving their skills with our interactive quiz platform.
            </BodyLG>
            <Flex direction="col" gap="md" className="sm:flex-row justify-center">
              <Link href="/quizzes" className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <Icon name="check" size={20} color="white" />
                Start Free Quiz
              </Link>
              <Link href="/courses" className="inline-flex items-center justify-center gap-3 border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:-translate-y-1">
                <Icon name="book" size={20} color="current" />
                Explore Courses
              </Link>
            </Flex>
          </div>
        </div>
      </Container>
    </Section>
  )
}
