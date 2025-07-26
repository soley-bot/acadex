'use client'

import { useState, useEffect } from 'react'
import { getCourses } from '@/lib/database'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  description: string
  instructor_id: string
  instructor_name: string
  category: string
  level: string
  price: number
  duration: string
  image_url?: string
  rating: number
  student_count: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const filters: any = {}
        
        if (selectedCategory !== 'all') {
          filters.category = selectedCategory
        }
        
        if (selectedLevel !== 'all') {
          filters.level = selectedLevel
        }
        
        const { data, error: fetchError } = await getCourses(filters)
        
        if (fetchError) {
          console.error('Error fetching courses:', fetchError)
          setError('Failed to load courses')
        } else {
          setCourses(data || [])
        }
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError('Failed to load courses')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [selectedCategory, selectedLevel])

  const categories = ['all', 'Grammar', 'Vocabulary', 'Pronunciation', 'Speaking', 'Business English', 'Writing', 'Literature', 'Test Preparation']
  const levels = ['all', 'beginner', 'intermediate', 'advanced']

    const getLevelBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700'
      case 'advanced': return 'bg-red-100 text-red-700'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const formatLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-default"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium mb-6 border">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            Course Catalog
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
            Expert-Led
            <span className="block text-primary mt-2">Learning Courses</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Master new skills with our comprehensive courses designed by industry experts. 
            From beginner basics to advanced mastery, find your perfect learning path.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-6 lg:px-8 border-b bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Filter Courses</h3>
            
            {/* Category Filter */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Level Filter */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-gray-700">Level:</span>
              <div className="flex flex-wrap gap-2">
                {levels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedLevel === level
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {level === 'all' ? 'All Levels' : formatLevel(level)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Active Filters Summary */}
            {(selectedCategory !== 'all' || selectedLevel !== 'all') && (
              <div className="flex items-center gap-2 pt-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {selectedCategory !== 'all' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                    {selectedCategory}
                  </span>
                )}
                {selectedLevel !== 'all' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                    {formatLevel(selectedLevel)}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedLevel('all')
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-foreground">
              Available Courses
            </h2>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No courses found matching your criteria.</p>
              <button 
                onClick={() => {
                  setSelectedCategory('all')
                  setSelectedLevel('all')
                }}
                className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-black transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="card hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full"
                >
                  {/* Course Header */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-sm text-blue-600 font-medium">
                        {course.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(course.level)}`}>
                        {formatLevel(course.level)}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-neutral-900 mb-3 line-clamp-2">
                      {course.title}
                    </h3>
                    
                    <p className="text-neutral-600 mb-4 text-sm leading-relaxed line-clamp-3 flex-grow">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {course.instructor_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-sm text-neutral-700">{course.instructor_name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-neutral-500 mb-6">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {course.student_count.toLocaleString()} students
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{course.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="text-xl font-bold text-neutral-900">
                        ${course.price}
                      </div>
                      <Link href={`/courses/${course.id}`}>
                        <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-black transition-colors">
                          View Course
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
