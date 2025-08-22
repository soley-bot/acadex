'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'
import { BlobBackground } from '@/components/ui/BlobBackground'
import { Brain, Lightbulb, Medal, Clock, CheckCircle, Play } from 'lucide-react'

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
            <span className="font-medium">Quiz Platform</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 tracking-tight">
            Test Your Skills with Our 
            <span className="block text-primary mt-4">Quiz System</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Practice across multiple subjects with our adaptive quiz platform designed for comprehensive skill assessment.
          </p>
        </div>

        {/* Stats Grid - Professional Card System */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-20">
          {stats.map((stat, index) => (
            <Card key={index} variant="glass" className="text-center p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="text-3xl font-bold text-primary mb-3">{stat.value}</div>
                <div className="text-lg font-semibold text-gray-900 mb-2">{stat.title}</div>
                <p className="text-gray-600">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Interactive Features Showcase - Professional Card System */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center mb-20">
          {/* Feature Navigation */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">
              Why Students Love Our Quiz System
            </h2>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 ${
                    activeFeature === index
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-primary/30 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      activeFeature === index 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Feature Preview - Professional Card */}
          <Card variant="glass" className="p-8">
            <CardContent className="p-0">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-secondary text-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-black">{activeFeature + 1}</span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  {features[activeFeature]?.title || 'Feature'}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {features[activeFeature]?.preview || 'Feature preview'}
                </p>
              </div>

              {/* Mock Interface Preview */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">Question 3 of 10</span>
                  <span className="text-sm font-medium text-gray-900">85% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                  <div className="bg-primary h-3 rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
                </div>
                
                <h5 className="text-lg font-medium text-gray-900 mb-4">
                  Which sentence uses the present perfect tense correctly?
                </h5>
                
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border-2 border-primary bg-primary/10 text-primary font-medium">
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
                  <p className="text-sm text-green-800">
                    <strong>Correct!</strong> Present perfect uses &quot;have/has + past participle&quot; for actions starting in the past and continuing to the present.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action - Professional Card System */}
        <div className="text-center">
          <Card variant="glass" className="p-12">
            <CardContent className="p-0">
              <h2 className="text-3xl font-bold text-secondary mb-4">
                Ready to Test Your Skills?
              </h2>
              <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
                Join thousands of students who are improving their skills with our interactive quiz platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/quizzes">
                  <button className="bg-primary hover:bg-secondary text-white hover:text-black px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 min-w-[180px] flex items-center justify-center gap-3">
                    <CheckCircle size={20} />
                    Start Free Quiz
                  </button>
                </Link>
                <Link href="/courses">
                  <button className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 min-w-[180px] flex items-center justify-center gap-3">
                    <Play size={20} />
                    Explore Courses
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  )
}
