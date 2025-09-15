'use client'

import React from 'react'
import { 
  DashboardLayout, 
  DashboardHeader, 
  DashboardStats,
  DashboardSection,
  DashboardGrid
} from '@/components/dashboard'
import {
  StatContainer,
  OptimizedCourseCard,
  OptimizedQuizCard,
  ContentContainer
} from '@/components/dashboard/containers'
import { Button } from '@/components/ui/button'
import { BookOpen, Trophy, Target, TrendingUp, Users, Clock } from 'lucide-react'

// Mock data (same as before but condensed)
const mockStats = {
  active_courses: 5,
  completed_courses: 12,
  courses_in_progress: 5,
  total_quizzes: 48,
  quizzes_passed: 35,
  average_score: 82.5,
  best_score: 95,
  score_trend: 8.3,
  total_study_time: 2850,
  current_streak: 15,
  lessons_completed: 127,
  this_week_hours: 12,
  this_month_hours: 48,
  total_login_days: 89
}

const mockCourses = [
  {
    id: '1',
    course_id: '1',
    title: 'Advanced English Grammar',
    description: 'Master complex grammar structures and improve your writing skills with comprehensive exercises.',
    category: 'Grammar',
    difficulty: 'Advanced' as const,
    duration: '6 weeks',
    progress_percentage: 75,
    last_accessed: '2024-12-19',
    enrolled_at: '2024-11-01',
    image_url: '/images/courses/grammar-advanced.jpg',
    total_students: 1250,
    estimated_duration: '45 hours',
    total_lessons: 24,
    completed_lessons: 18
  },
  {
    id: '2',
    course_id: '2',
    title: 'IELTS Speaking Preparation',
    description: 'Comprehensive preparation for IELTS Speaking test with practice exercises.',
    category: 'IELTS',
    difficulty: 'Intermediate' as const,
    duration: '8 weeks',
    progress_percentage: 45,
    last_accessed: '2024-12-18',
    enrolled_at: '2024-11-15',
    image_url: '/images/courses/ielts-speaking.jpg',
    total_students: 890,
    estimated_duration: '60 hours',
    total_lessons: 32,
    completed_lessons: 14
  }
]

const mockQuizzes = [
  {
    id: '1',
    quiz_id: '1',
    user_id: 'user-1',
    quiz_title: 'Advanced Grammar Assessment',
    course_title: 'Advanced English Grammar',
    category: 'Grammar',
    difficulty: 'Advanced' as const,
    score: 88,
    total_questions: 25,
    correct_answers: 22,
    percentage: 88,
    status: 'completed' as const,
    completed_at: '2024-12-18T10:30:00Z',
    time_taken_minutes: 45,
    duration: '45',
    attempt_number: 2,
    timeSpent: '45 minutes'
  },
  {
    id: '2',
    quiz_id: '2',
    user_id: 'user-1',
    quiz_title: 'IELTS Speaking Mock Test',
    course_title: 'IELTS Speaking Preparation',
    category: 'IELTS',
    difficulty: 'Intermediate' as const,
    score: null,
    total_questions: 15,
    correct_answers: null,
    percentage: 0,
    status: 'in_progress' as const,
    completed_at: null,
    time_taken_minutes: 0,
    duration: '30',
    attempt_number: 1,
    timeSpent: '0 minutes'
  }
]

export default function OptimizedDashboardDemo() {
  const [viewMode, setViewMode] = React.useState<'mobile' | 'desktop'>('mobile')

  return (
    <DashboardLayout title="Optimized Dashboard Demo">
      <DashboardHeader
        title="Mobile-Optimized Dashboard"
        subtitle="Lightweight components with responsive design"
        userName="Jane Doe"
        userEmail="jane@example.com"
        notificationCount={2}
      />
      
      <div className="space-y-4 sm:space-y-6 md:space-y-8 p-3 sm:p-4 md:p-6">
        {/* View Mode Toggle */}
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            variant={viewMode === 'mobile' ? 'default' : 'outline'}
            onClick={() => setViewMode('mobile')}
          >
            Mobile View
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'desktop' ? 'default' : 'outline'}
            onClick={() => setViewMode('desktop')}
          >
            Desktop View
          </Button>
        </div>

        {/* Lightweight Stats Section */}
        <DashboardSection
          title="Lightweight Statistics"
          description="Using StatContainer instead of heavy StatsCard components"
        >
          <DashboardStats 
            stats={mockStats} 
            compact={viewMode === 'mobile'}
          />
        </DashboardSection>

        {/* Individual Stat Containers */}
        <DashboardSection
          title="Individual Stat Containers"
          description="Minimal containers with mobile-first responsive design"
        >
          <DashboardGrid 
            cols={{ default: 2, sm: 3, lg: 6 }} 
            gap={viewMode === 'mobile' ? 3 : 4}
          >
            <StatContainer
              title="Active Courses"
              value={5}
              description="Currently enrolled"
              icon={BookOpen}
              size={viewMode === 'mobile' ? 'xs' : 'sm'}
            />
            <StatContainer
              title="Average Score"
              value="82%"
              description="Quiz performance"
              icon={Target}
              variant="success"
              trend={{ value: 8.3, isPositive: true, label: "vs last month" }}
              size={viewMode === 'mobile' ? 'xs' : 'sm'}
            />
            <StatContainer
              title="Completed"
              value={12}
              description="Courses finished"
              icon={Trophy}
              variant="success"
              size={viewMode === 'mobile' ? 'xs' : 'sm'}
            />
            <StatContainer
              title="Study Time"
              value="47h"
              description="This month"
              icon={Clock}
              size={viewMode === 'mobile' ? 'xs' : 'sm'}
            />
            <StatContainer
              title="Current Streak"
              value="15 days"
              description="Learning streak"
              icon={Users}
              variant="success"
              size={viewMode === 'mobile' ? 'xs' : 'sm'}
            />
            <StatContainer
              title="Improvement"
              value="+15%"
              description="This month"
              icon={TrendingUp}
              variant="warning"
              size={viewMode === 'mobile' ? 'xs' : 'sm'}
            />
          </DashboardGrid>
        </DashboardSection>

        {/* Content Containers Demo */}
        <DashboardSection
          title="Content Container Variants"
          description="Lightweight alternatives to cards for different content types"
        >
          <DashboardGrid cols={{ default: 1, md: 2, lg: 4 }} gap={4}>
            <ContentContainer variant="minimal" size="sm">
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Minimal</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                For simple stats and data display with subtle background
              </p>
            </ContentContainer>
            
            <ContentContainer variant="subtle" size="sm">
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Subtle</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                For grouped content that needs slight separation
              </p>
            </ContentContainer>
            
            <ContentContainer variant="outlined" size="sm">
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Outlined</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                For content that needs definition without weight
              </p>
            </ContentContainer>
            
            <ContentContainer variant="surface" size="sm">
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Surface</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                For content areas that need background separation
              </p>
            </ContentContainer>
          </DashboardGrid>
        </DashboardSection>

        {/* Optimized Course Cards */}
        <DashboardSection
          title="Optimized Course Cards"
          description="Mobile-first design with proper visual hierarchy"
        >
          <DashboardGrid 
            cols={{ default: 1, md: 2 }} 
            gap={viewMode === 'mobile' ? 4 : 6}
          >
            {mockCourses.map((course) => (
              <OptimizedCourseCard
                key={course.id}
                course={course}
                compact={viewMode === 'mobile'}
                showProgress
                onClick={(course) => console.log('Course clicked:', course.title)}
              />
            ))}
          </DashboardGrid>
        </DashboardSection>

        {/* Compact Course Cards */}
        <DashboardSection
          title="Compact Course Cards"
          description="Space-efficient layout for mobile screens"
        >
          <DashboardGrid 
            cols={{ default: 1, sm: 2, lg: 3 }} 
            gap={3}
          >
            {mockCourses.map((course) => (
              <OptimizedCourseCard
                key={`compact-${course.id}`}
                course={course}
                compact
                showProgress
              />
            ))}
          </DashboardGrid>
        </DashboardSection>

        {/* Optimized Quiz Cards */}
        <DashboardSection
          title="Optimized Quiz Cards"
          description="Responsive quiz display with improved mobile layout"
        >
          <DashboardGrid 
            cols={{ default: 1, md: 2 }} 
            gap={viewMode === 'mobile' ? 4 : 6}
          >
            {mockQuizzes.map((quiz) => (
              <OptimizedQuizCard
                key={quiz.id}
                quiz={quiz}
                compact={viewMode === 'mobile'}
                showDetails
                onClick={(quiz) => console.log('Quiz clicked:', quiz.quiz_title)}
              />
            ))}
          </DashboardGrid>
        </DashboardSection>

        {/* Mobile Layout Improvements */}
        <DashboardSection
          title="Mobile Layout Features"
          description="Key improvements for mobile responsiveness"
        >
          <ContentContainer variant="subtle" size="md">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                📱 Mobile-First Improvements
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• <strong>Responsive Padding:</strong> p-3 sm:p-4 md:p-6 instead of fixed p-8</li>
                <li>• <strong>Lightweight Containers:</strong> StatContainer vs heavy StatsCard</li>
                <li>• <strong>Flexible Typography:</strong> text-sm sm:text-base md:text-lg scaling</li>
                <li>• <strong>Touch-Friendly:</strong> 44px minimum touch targets</li>
                <li>• <strong>Reduced Visual Weight:</strong> Less cards, more content containers</li>
                <li>• <strong>Responsive Grids:</strong> Adaptive column counts for all screen sizes</li>
                <li>• <strong>Compact Variants:</strong> Space-efficient layouts for mobile</li>
              </ul>
            </div>
          </ContentContainer>
        </DashboardSection>
      </div>
    </DashboardLayout>
  )
}