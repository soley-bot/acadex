'use client'

import { useState, useEffect } from 'react'
import { getCourses } from '@/lib/database'
import Link from 'next/link'
import Image from 'next/image'

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

  const categories = ['all', 'Development', 'Design', 'Data Science', 'Marketing', 'Cloud Computing', 'Mobile']
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
      <div className="min-h-screen bg-gray-900">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Loading courses...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
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
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-gray-50"></div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-3 py-1.5 rounded-full text-sm font-medium mb-6 border border-brand/20">
            <span className="w-2 h-2 bg-brand rounded-full"></span>
            Course Catalog
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground">
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
      <section className="py-8 px-6 lg:px-8 border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Filter Courses</h3>
            
            {/* Category Filter */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-muted-foreground">Category:</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-brand text-brand-foreground'
                        : 'bg-background text-foreground hover:bg-muted border border-border hover:border-brand/50'
                    }`}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Level Filter */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-muted-foreground">Level:</span>
              <div className="flex flex-wrap gap-2">
                {levels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedLevel === level
                        ? 'bg-brand text-brand-foreground'
                        : 'bg-background text-foreground hover:bg-muted border border-border hover:border-brand/50'
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
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-brand/10 text-brand text-xs font-medium rounded border border-brand/20">
                    {selectedCategory}
                  </span>
                )}
                {selectedLevel !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-brand/10 text-brand text-xs font-medium rounded border border-brand/20">
                    {formatLevel(selectedLevel)}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedLevel('all')
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground underline ml-2"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-foreground">
              Available Courses
            </h2>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center border border-border">
                <Image 
                  src="/Icons8/icons8-document-50.png" 
                  alt="No courses" 
                  width={32} 
                  height={32} 
                  className="w-8 h-8 opacity-60" 
                />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-4">We couldn&apos;t find any courses matching your current filters.</p>
              <button 
                onClick={() => {
                  setSelectedCategory('all')
                  setSelectedLevel('all')
                }}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="group bg-card rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-border hover:border-primary/30 flex flex-col h-full"
                >
                  {/* Course Image Placeholder - Will be replaced with actual images later */}
                  <div className="relative h-48 bg-muted overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
                          <Image 
                            src="/Icons8/icons8-document-50.png" 
                            alt="Course" 
                            width={32} 
                            height={32} 
                            className="w-8 h-8 opacity-60" 
                          />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">{course.category}</p>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(course.level)}`}>
                        {formatLevel(course.level)}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed line-clamp-3 flex-grow">
                      {course.description}
                    </p>

                    {/* Instructor */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-muted-foreground font-medium text-sm">
                          {course.instructor_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{course.instructor_name}</p>
                        <p className="text-xs text-muted-foreground">Instructor</p>
                      </div>
                    </div>
                    
                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-6 pb-4 border-b border-border">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                          <Image src="/Icons8/icons8-clock-50.png" alt="Duration" width={18} height={18} className="w-[18px] h-[18px]" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Image src="/Icons8/icons8-contacts-50.png" alt="Students" width={18} height={18} className="w-[18px] h-[18px]" />
                          {course.student_count.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Image src="/Icons8/icons8-checkmark-50.png" alt="Rating" width={18} height={18} className="w-[18px] h-[18px]" />
                        <span className="font-medium">{course.rating}</span>
                      </div>
                    </div>
                    
                    {/* Price and CTA */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="text-2xl font-bold text-foreground">
                        <span className="text-lg text-muted-foreground font-normal">$</span>{course.price}
                      </div>
                      <Link href={`/courses/${course.id}`}>
                        <button className="inline-flex items-center px-4 py-2 bg-brand text-brand-foreground rounded-lg font-medium hover:bg-brand/90 transition-colors">
                          <span>View Course</span>
                          <Image src="/Icons8/icons8-external-link-50.png" alt="External link" width={18} height={18} className="w-[18px] h-[18px] ml-2" />
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
