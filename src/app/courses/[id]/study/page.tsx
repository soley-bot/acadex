'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { courseAPI, enrollmentAPI } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'

interface Course {
  id: string
  title: string
  description: string
  instructor_name: string
  category: string
  level: string
  duration: string
}

interface Lesson {
  id: number
  title: string
  content: string
  videoUrl?: string
  duration: string
  completed: boolean
}

export default function CourseStudyPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [currentLesson, setCurrentLesson] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchCourseAndContent = async () => {
      try {
        setLoading(true)
        
        // Fetch course details
        const { data: courseData, error: courseError } = await courseAPI.getCourse(params.id as string)
        
        if (courseError || !courseData) {
          setError('Course not found')
          return
        }

        setCourse(courseData)

        // For now, create sample lessons. In a real app, these would come from the database
        const sampleLessons: Lesson[] = [
          {
            id: 1,
            title: 'Introduction to ' + courseData.title,
            content: `Welcome to ${courseData.title}! In this comprehensive course, you'll learn everything you need to know about ${courseData.category.toLowerCase()}.

This course is designed for ${courseData.level} level students and will take approximately ${courseData.duration} to complete.

What you'll learn:
• Fundamental concepts and principles
• Practical skills and techniques  
• Real-world applications
• Best practices and industry standards

Let's get started on your learning journey!`,
            duration: '15 min',
            completed: false
          },
          {
            id: 2,
            title: 'Core Concepts',
            content: `In this lesson, we'll dive deep into the core concepts of ${courseData.category.toLowerCase()}.

Key Topics:
• Basic terminology and definitions
• Fundamental principles
• Common patterns and approaches
• Industry best practices

Understanding these concepts is crucial for building a solid foundation in ${courseData.category.toLowerCase()}.`,
            duration: '25 min',
            completed: false
          },
          {
            id: 3,
            title: 'Practical Applications',
            content: `Now that you understand the theory, let's explore practical applications.

In this lesson you'll learn:
• How to apply concepts in real scenarios
• Common use cases and examples
• Problem-solving techniques
• Tips and tricks from experts

Practice exercises are included to help reinforce your learning.`,
            duration: '30 min',
            completed: false
          },
          {
            id: 4,
            title: 'Advanced Techniques',
            content: `Ready to take your skills to the next level? This lesson covers advanced techniques and strategies.

Advanced Topics:
• Complex problem-solving approaches
• Optimization techniques
• Advanced tools and methods
• Professional workflows

These skills will help you stand out in your field.`,
            duration: '35 min',
            completed: false
          },
          {
            id: 5,
            title: 'Final Project & Assessment',
            content: `Congratulations on making it to the final lesson! It's time to put everything together.

In this final lesson:
• Complete a comprehensive project
• Apply all the skills you've learned
• Get feedback on your work
• Receive your completion certificate

This project will serve as a portfolio piece to showcase your new skills.`,
            duration: '45 min',
            completed: false
          }
        ]

        setLessons(sampleLessons)
        
        // Calculate progress (in a real app, this would come from the database)
        const completedLessons = sampleLessons.filter(lesson => lesson.completed).length
        const progressPercentage = (completedLessons / sampleLessons.length) * 100
        setProgress(progressPercentage)

      } catch (err) {
        console.error('Error fetching course:', err)
        setError('Failed to load course')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCourseAndContent()
    }
  }, [params.id, user, router])

  const markLessonComplete = async () => {
    const updatedLessons = [...lessons]
    if (updatedLessons[currentLesson]) {
      updatedLessons[currentLesson].completed = true
      setLessons(updatedLessons)

      // Calculate new progress
      const completedLessons = updatedLessons.filter(lesson => lesson.completed).length
      const progressPercentage = (completedLessons / updatedLessons.length) * 100
      setProgress(progressPercentage)
    }

    // In a real app, you'd save this progress to the database
    // await enrollmentAPI.updateProgress(enrollmentId, progressPercentage)
  }

  const nextLesson = () => {
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1)
    }
  }

  const previousLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="pt-16">
        {/* Course Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block">
                  ← Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-600">Instructor: {course.instructor_name}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Progress</div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600 mt-1">{Math.round(progress)}% Complete</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Lesson Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h2>
                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLesson(index)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        currentLesson === index
                          ? 'bg-blue-50 border-blue-200 border'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          lesson.completed
                            ? 'bg-green-100 text-green-700'
                            : currentLesson === index
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {lesson.completed ? '✓' : index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                          <div className="text-xs text-gray-500">{lesson.duration}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border">
                {/* Lesson Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {lessons[currentLesson]?.title}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Lesson {currentLesson + 1} of {lessons.length}</span>
                        <span>•</span>
                        <span>{lessons[currentLesson]?.duration}</span>
                        {lessons[currentLesson]?.completed && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 font-medium">Completed ✓</span>
                          </>
                        )}
                      </div>
                    </div>
                    {!lessons[currentLesson]?.completed && (
                      <button
                        onClick={markLessonComplete}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>

                {/* Lesson Content */}
                <div className="p-6">
                  <div className="prose max-w-none">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {lessons[currentLesson]?.content}
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="p-6 border-t bg-gray-50">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={previousLesson}
                      disabled={currentLesson === 0}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Previous Lesson
                    </button>
                    
                    {currentLesson === lessons.length - 1 ? (
                      <Link
                        href="/dashboard"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Complete Course
                      </Link>
                    ) : (
                      <button
                        onClick={nextLesson}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Next Lesson →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
