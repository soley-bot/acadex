'use client'

import { useState } from 'react'
import Link from 'next/link'
import SvgIcon from '@/components/ui/SvgIcon'

interface QuizStat {
  title: string
  value: string
  description: string
}

export default function QuizPreview() {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      title: 'IELTS Practice Tests',
      description: 'Complete IELTS mock tests with authentic questions and scoring system',
      preview: 'Real IELTS exam simulation with detailed feedback'
    },
    {
      title: 'Grammar Assessment',
      description: 'Targeted grammar quizzes covering all English grammar rules and exceptions',
      preview: 'Identify and improve your grammar weaknesses'
    },
    {
      title: 'Vocabulary Testing',
      description: 'Build your vocabulary with contextual word tests and meaning exercises',
      preview: 'Learn new words through interactive challenges'
    }
  ]

  const stats: QuizStat[] = [
    {
      title: 'IELTS Questions',
      value: '2,500+',
      description: 'Authentic practice questions'
    },
    {
      title: 'Success Rate',
      value: '92%',
      description: 'Students improve scores'
    },
    {
      title: 'Grammar Topics',
      value: '150+',
      description: 'Comprehensive coverage'
    },
    {
      title: 'Study Time',
      value: '15 min',
      description: 'Average daily practice'
    }
  ]

  return (
    <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-background via-brand/5 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-2 rounded-full text-sm md:text-base font-medium mb-8 border border-brand/20">
            <SvgIcon icon="bolt" size={20} className="text-brand" />
            English Quiz Platform
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-6">
            Test Your Skills with Our 
            <span className="text-brand"> Quiz System</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Practice IELTS, grammar, vocabulary, and reading comprehension with our adaptive quiz platform designed for English learners.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 card hover:shadow-lg transition-shadow">
              <div className="text-2xl md:text-3xl font-bold text-brand mb-2">{stat.value}</div>
              <div className="font-semibold text-sm md:text-base mb-1">{stat.title}</div>
              <div className="text-xs md:text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Interactive Features Showcase */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Feature Navigation */}
          <div>
            <h3 className="text-3xl font-bold tracking-tight mb-8">
              Why Students Love Our Quiz System
            </h3>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`w-full text-left p-6 rounded-lg border transition-all ${
                    activeFeature === index
                      ? 'border-brand bg-brand/5 shadow-md'
                      : 'border-border hover:border-brand/50 hover:bg-brand/2'
                  }`}
                >
                  <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      activeFeature === index ? 'bg-brand/20' : 'bg-muted'
                    }`}>
                    <span className="text-xl font-bold">{index + 1}</span>
                  </div>
                    <div className="flex-1">
                      <h4 className={`text-lg font-semibold mb-2 ${
                        activeFeature === index ? 'text-brand' : 'text-foreground'
                      }`}>
                        {feature.title}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Feature Preview */}
          <div className="card p-8 bg-gradient-to-br from-card to-brand/5">
            <div className="text-center mb-8">
                            <div className="w-20 h-20 mx-auto mb-4 bg-brand/20 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-brand">{activeFeature + 1}</span>
              </div>
              <h4 className="text-2xl font-bold text-foreground mb-4">
                {features[activeFeature]?.title || 'Feature'}
              </h4>
              <p className="text-lg text-muted-foreground">
                {features[activeFeature]?.preview || 'Feature preview'}
              </p>
            </div>

            {/* Mock Interface Preview */}
            <div className="bg-background rounded-lg p-6 border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Question 3 of 10</span>
                <span className="text-sm font-medium text-brand">85% Complete</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-6">
                <div className="bg-brand h-2 rounded-full w-[85%]"></div>
              </div>
              
              <h5 className="text-lg font-semibold text-foreground mb-4">
                Which sentence uses the present perfect tense correctly?
              </h5>
              
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-brand bg-brand/10 text-brand">
                  I have lived in London for five years.
                </div>
                <div className="p-3 rounded-lg border border-border text-muted-foreground">
                  I am living in London for five years.
                </div>
                <div className="p-3 rounded-lg border border-border text-muted-foreground">
                  I live in London for five years.
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Correct!</strong> Present perfect uses &quot;have/has + past participle&quot; for actions starting in the past and continuing to the present.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="card p-12 bg-gradient-to-r from-brand/10 via-brand/5 to-brand/10 border-brand/20">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Ready to Test Your Skills?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of students who are improving their English skills with our interactive quiz platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quizzes" className="btn-primary text-lg px-8 flex items-center justify-center gap-2">
                <SvgIcon icon="check" size={20} variant="white" />
                Start Free Quiz
              </Link>
              <Link href="/courses" className="btn-outline text-lg px-8 flex items-center justify-center gap-2">
                <SvgIcon icon="book" size={20} />
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
