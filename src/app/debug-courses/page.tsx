'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false })

        if (coursesError) {
          console.error('Courses error:', coursesError)
        } else {
          console.log('All courses:', coursesData)
          setCourses(coursesData || [])
        }

        // Get all modules
        const { data: modulesData, error: modulesError } = await supabase
          .from('course_modules')
          .select(`
            *,
            course_lessons (*)
          `)
          .order('created_at', { ascending: false })

        if (modulesError) {
          console.error('Modules error:', modulesError)
        } else {
          console.log('All modules:', modulesData)
          setModules(modulesData || [])
        }

      } catch (err) {
        console.error('Debug fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading debug data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Debug - Courses & Modules</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Courses */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Courses ({courses.length})</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {courses.map((course) => (
                <div key={course.id} className="border rounded p-3">
                  <div className="font-medium text-sm text-gray-900 mb-1">
                    {course.title}
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div><strong>ID:</strong> {course.id}</div>
                    <div><strong>Type:</strong> {typeof course.id}</div>
                    <div><strong>Length:</strong> {course.id.length}</div>
                    <div><strong>Instructor:</strong> {course.instructor_name}</div>
                    <div><strong>Published:</strong> {course.is_published ? 'Yes' : 'No'}</div>
                    <div><strong>Created:</strong> {new Date(course.created_at).toLocaleString()}</div>
                  </div>
                  <a 
                    href={`/courses/${course.id}/study`}
                    className="text-blue-600 hover:text-blue-700 text-xs mt-2 inline-block"
                  >
                    → Study Page
                  </a>
                </div>
              ))}
              {courses.length === 0 && (
                <div className="text-gray-500 text-center py-8">
                  No courses found in database
                </div>
              )}
            </div>
          </div>

          {/* Modules */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Course Modules ({modules.length})</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {modules.map((module) => (
                <div key={module.id} className="border rounded p-3">
                  <div className="font-medium text-sm text-gray-900 mb-1">
                    {module.title}
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div><strong>Module ID:</strong> {module.id}</div>
                    <div><strong>Course ID:</strong> {module.course_id}</div>
                    <div><strong>Published:</strong> {module.is_published ? 'Yes' : 'No'}</div>
                    <div><strong>Order:</strong> {module.order_index}</div>
                    <div><strong>Lessons:</strong> {module.course_lessons?.length || 0}</div>
                    <div><strong>Created:</strong> {new Date(module.created_at).toLocaleString()}</div>
                  </div>
                  {module.course_lessons && module.course_lessons.length > 0 && (
                    <div className="mt-2 pl-4 border-l-2 border-gray-200">
                      <div className="text-xs font-medium text-gray-700">Lessons:</div>
                      {module.course_lessons.map((lesson: any, idx: number) => (
                        <div key={lesson.id} className="text-xs text-gray-600">
                          {idx + 1}. {lesson.title} ({lesson.is_published ? 'Published' : 'Draft'})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {modules.length === 0 && (
                <div className="text-gray-500 text-center py-8">
                  No modules found in database
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Notes:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Course IDs should be UUIDs (36 characters)</li>
            <li>• Numeric IDs indicate data issues or legacy data</li>
            <li>• Modules must have matching course_id to appear</li>
            <li>• Both courses and modules must be published (is_published = true)</li>
            <li>• Check console for detailed query results</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
