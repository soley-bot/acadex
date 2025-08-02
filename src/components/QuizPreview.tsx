'use client'

import { useState } from 'react'
import Link from 'next/link'

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
    <section className="py-24 px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-full text-sm font-medium mb-8 border border-border">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            Quiz Platform
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 text-foreground">
            Test Your Skills with Our 
            <span className="block text-primary mt-2">Quiz System</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
            Practice across multiple subjects with our adaptive quiz platform designed for comprehensive skill assessment.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-8 bg-card rounded-2xl shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl md:text-5xl font-black text-primary mb-3">{stat.value}</div>
              <div className="font-bold text-lg mb-2 text-foreground">{stat.title}</div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Interactive Features Showcase */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Feature Navigation */}
          <div>
            <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-8 text-foreground">
              Why Students Love Our Quiz System
            </h3>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 ${
                    activeFeature === index
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-border bg-card hover:border-primary/30 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      activeFeature === index 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-2 text-foreground">
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
          <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl font-black text-primary-foreground">{activeFeature + 1}</span>
              </div>
              <h4 className="text-2xl font-bold text-foreground mb-4">
                {features[activeFeature]?.title || 'Feature'}
              </h4>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {features[activeFeature]?.preview || 'Feature preview'}
              </p>
            </div>

            {/* Mock Interface Preview */}
            <div className="bg-muted rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Question 3 of 10</span>
                <span className="text-sm font-bold text-primary">85% Complete</span>
              </div>
              <div className="w-full bg-border rounded-full h-3 mb-6">
                <div className="bg-primary h-3 rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
              </div>
              
              <h5 className="text-lg font-bold text-foreground mb-4">
                Which sentence uses the present perfect tense correctly?
              </h5>
              
              <div className="space-y-3">
                <div className="p-4 rounded-lg border-2 border-primary bg-primary/10 text-primary font-medium">
                  I have lived in London for five years.
                </div>
                <div className="p-4 rounded-lg border border-border text-muted-foreground hover:border-border/50 transition-colors">
                  I am living in London for five years.
                </div>
                <div className="p-4 rounded-lg border border-border text-muted-foreground hover:border-border/50 transition-colors">
                  I live in London for five years.
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Correct!</strong> Present perfect uses &quot;have/has + past participle&quot; for actions starting in the past and continuing to the present.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-foreground rounded-2xl p-12 text-background shadow-2xl">
            <h3 className="text-3xl md:text-4xl font-black text-background mb-4">
              Ready to Test Your Skills?
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto font-light">
              Join thousands of students who are improving their skills with our interactive quiz platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/quizzes" className="inline-flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <span>✓</span>
                Start Free Quiz
              </Link>
              <Link href="/courses" className="inline-flex items-center justify-center gap-3 border-2 border-background text-background hover:bg-background hover:text-foreground px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:-translate-y-1">
                <span>📚</span>
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
