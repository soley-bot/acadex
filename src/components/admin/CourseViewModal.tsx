'use client'

import Image from 'next/image'
import { X, Users, Calendar, DollarSign, BookOpen, Clock, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface CourseViewModalProps {
  course: {
    id: string
    title: string
    description: string
    instructor_name: string
    price: number
    category: string
    level: 'beginner' | 'intermediate' | 'advanced'
    duration: string
    image_url?: string
    is_published: boolean
    created_at: string
    student_count: number
  } | null
  isOpen: boolean
  onClose: () => void
  onEdit?: () => void
}

export function CourseViewModal({ course, isOpen, onClose, onEdit }: CourseViewModalProps) {
  if (!isOpen || !course) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
      case 'intermediate': return 'bg-amber-100 text-amber-800 border border-amber-200'
      case 'advanced': return 'bg-destructive/20 text-red-800 border border-destructive/30'
      default: return 'bg-muted/40 text-gray-800 border border-gray-200'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="surface-primary rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-subtle">
        <div className="flex items-center justify-between p-6 border-b border-subtle">
          <div>
            <h2 className="heading-subsection">Course Details</h2>
            <p className="text-sm text-tertiary">View course information</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/40 rounded-lg transition-colors text-tertiary hover:text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Course Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-primary mb-2">{course.title}</h3>
                <p className="text-secondary mb-4">{course.description}</p>
                
                <div className="flex items-center gap-4 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(course.level || 'beginner')}`}>
                    {course.level ? (course.level.charAt(0).toUpperCase() + course.level.slice(1)) : 'Beginner'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.is_published 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              
              {course.image_url && (
                <div className="ml-6">
                  <Image 
                    src={course.image_url} 
                    alt={course.title}
                    width={128}
                    height={96}
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-secondary mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Students</p>
                    <p className="text-lg font-semibold">{course.student_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="text-lg font-semibold">${course.price}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-orange-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="text-lg font-semibold">{course.duration}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="text-lg font-semibold">{course.category}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructor
                  </label>
                  <p className="text-gray-900">{course.instructor_name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created Date
                  </label>
                  <p className="text-gray-900">{formatDate(course.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-secondary-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
            >
              Close
            </button>
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-brand hover:bg-brand/90 text-brand-foreground rounded-lg transition-colors"
              >
                Edit Course
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
