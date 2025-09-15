'use client'

import React from 'react'
import { 
  DashboardLayout, 
  DashboardHeader, 
  DashboardStats,
  DashboardSection,
  DashboardGrid,
  CourseCard,
  QuizCard,
  LoadingSkeleton,
  StatsCard
} from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { BookOpen, Trophy, Target, TrendingUp } from 'lucide-react'

// Mock data for demonstration
const mockStats = {
  active_courses: 5,
  completed_courses: 12,
  courses_in_progress: 5,
  total_quizzes: 48,
  quizzes_passed: 35,
  average_score: 82.5,
  best_score: 95,
  score_trend: 8.3,
  total_study_time: 2850, // minutes
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
    description: 'Master complex grammar structures and improve your writing skills with comprehensive exercises and real-world examples.',
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
    completed_lessons: 18,
    next_lesson: {
      id: '19',
      title: 'Subjunctive Mood Usage'
    }
  },
  {
    id: '2',
    course_id: '2',
    title: 'IELTS Speaking Preparation',
    description: 'Comprehensive preparation for IELTS Speaking test with practice exercises and expert feedback.',
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
    completed_lessons: 14,
    next_lesson: {
      id: '15',
      title: 'Part 2: Long Turn Practice'
    }
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
    started_at: '2024-12-18T09:45:00Z',
    time_taken_minutes: 45,
    duration: '45 minutes',
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
    started_at: '2024-12-19T14:15:00Z',
    time_taken_minutes: 0,
    duration: '30 minutes',
    attempt_number: 1,
    timeSpent: '0 minutes'
  }
]

export default function DashboardComponentsDemo() {
  const [isLoading, setIsLoading] = React.useState(false)

  const toggleLoading = () => setIsLoading(!isLoading)

  return (
    <DashboardLayout title="Dashboard Components Demo">
      <DashboardHeader
        title="Dashboard Components Demo"
        subtitle="Showcase of reusable dashboard components"
        userName="John Doe"
        userEmail="john@example.com"
        notificationCount={3}
        showSearch
        onSearchChange={(value) => console.log('Search:', value)}
      />
      
      <div className="space-y-8 p-6">
        {/* Controls */}
        <div className="flex justify-center">
          <Button onClick={toggleLoading}>
            {isLoading ? 'Hide Loading States' : 'Show Loading States'}
          </Button>
        </div>

        {/* Stats Section */}
        <DashboardSection
          title="Dashboard Statistics"
          description="Overview of your learning progress and achievements"
        >
          {isLoading ? (
            <DashboardGrid cols={{ default: 2, lg: 6 }} gap={4}>
              {Array.from({ length: 6 }).map((_, i) => (
                <LoadingSkeleton key={i} variant="stats" />
              ))}
            </DashboardGrid>
          ) : (
            <DashboardStats stats={mockStats} />
          )}
        </DashboardSection>

        {/* Individual Stats Cards */}
        <DashboardSection
          title="Individual Stats Cards"
          description="Examples of different stat card variants"
        >
          {isLoading ? (
            <DashboardGrid cols={{ default: 2, md: 4 }} gap={4}>
              {Array.from({ length: 4 }).map((_, i) => (
                <LoadingSkeleton key={i} variant="stats" />
              ))}
            </DashboardGrid>
          ) : (
            <DashboardGrid cols={{ default: 2, md: 4 }} gap={4}>
              <StatsCard
                title="Active Courses"
                value={5}
                description="Currently enrolled"
                icon={BookOpen}
                variant="default"
              />
              <StatsCard
                title="Average Score"
                value="82%"
                description="Quiz performance"
                icon={Target}
                variant="success"
                trend={{ value: 8.3, isPositive: true, label: "vs last month" }}
              />
              <StatsCard
                title="Completed"
                value={12}
                description="Courses finished"
                icon={Trophy}
                variant="success"
              />
              <StatsCard
                title="Improvement"
                value="+15%"
                description="This month"
                icon={TrendingUp}
                variant="warning"
              />
            </DashboardGrid>
          )}
        </DashboardSection>

        {/* Course Cards */}
        <DashboardSection
          title="Course Cards"
          description="Course enrollment display with progress tracking"
        >
          {isLoading ? (
            <DashboardGrid cols={{ default: 1, md: 2 }} gap={6}>
              <LoadingSkeleton variant="card" />
              <LoadingSkeleton variant="card" />
            </DashboardGrid>
          ) : (
            <DashboardGrid cols={{ default: 1, md: 2 }} gap={6}>
              {mockCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  showProgress
                  onClick={(course) => console.log('Course clicked:', course.title)}
                />
              ))}
            </DashboardGrid>
          )}
        </DashboardSection>

        {/* Compact Course Cards */}
        <DashboardSection
          title="Compact Course Cards"
          description="Space-efficient course display for lists"
        >
          {isLoading ? (
            <DashboardGrid cols={{ default: 1, md: 2, lg: 3 }} gap={4}>
              {Array.from({ length: 3 }).map((_, i) => (
                <LoadingSkeleton key={i} variant="card" className="h-32" />
              ))}
            </DashboardGrid>
          ) : (
            <DashboardGrid cols={{ default: 1, md: 2, lg: 3 }} gap={4}>
              {mockCourses.map((course) => (
                <CourseCard
                  key={`compact-${course.id}`}
                  course={course}
                  compact
                  showProgress
                />
              ))}
            </DashboardGrid>
          )}
        </DashboardSection>

        {/* Quiz Cards */}
        <DashboardSection
          title="Quiz Cards"
          description="Quiz attempts and results display"
        >
          {isLoading ? (
            <DashboardGrid cols={{ default: 1, md: 2 }} gap={6}>
              <LoadingSkeleton variant="card" />
              <LoadingSkeleton variant="card" />
            </DashboardGrid>
          ) : (
            <DashboardGrid cols={{ default: 1, md: 2 }} gap={6}>
              {mockQuizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  showDetails
                  onClick={(quiz) => console.log('Quiz clicked:', quiz.quiz_title)}
                />
              ))}
            </DashboardGrid>
          )}
        </DashboardSection>

        {/* Loading Skeleton Variants */}
        <DashboardSection
          title="Loading Skeletons"
          description="Different skeleton variants for loading states"
        >
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-3">List Skeleton</h4>
              <LoadingSkeleton variant="list" count={3} />
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-3">Table Skeleton</h4>
              <LoadingSkeleton variant="table" count={4} />
            </div>
          </div>
        </DashboardSection>
      </div>
    </DashboardLayout>
  )
}