'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Save, Loader2, Plus, Trash2, BookOpen, FileText, Video } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface SimplifiedCourseFormProps {
  course?: {
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
    learning_objectives?: string[]
  }
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface SimpleModule {
  title: string
  lessons: SimpleLesson[]
}

interface SimpleLesson {
  title: string
  content: string
  duration_minutes: number
  is_free_preview: boolean
}

const categories = [
  'English Grammar', 'IELTS Preparation', 'Vocabulary Building', 
  'Business English', 'Conversation Skills', 'Writing Skills',
  'Reading Comprehension', 'Listening Skills', 'Other'
]

const levels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
]

// Content templates for quick start
const contentTemplates = {
  grammar: `## Lesson Overview
This lesson covers fundamental grammar concepts that will help you improve your English communication.

## Learning Objectives
By the end of this lesson, you will be able to:
- Understand the core grammar rule
- Apply it in written communication
- Use it confidently in speaking

## Key Points
1. **Definition**: [Explain the grammar concept]
2. **Examples**: [Provide clear examples]
3. **Common Mistakes**: [List typical errors to avoid]

## Practice Exercises
[Include practice activities]

## Summary
[Recap the key takeaways]`,

  vocabulary: `## Vocabulary Focus
Learn essential words and phrases for [topic].

## New Words
1. **Word 1** - Definition and example sentence
2. **Word 2** - Definition and example sentence
3. **Word 3** - Definition and example sentence

## Usage Examples
[Show how to use the vocabulary in context]

## Memory Tips
[Provide strategies to remember these words]

## Practice Activities
[Include vocabulary exercises]`,

  conversation: `## Conversation Skills
Practice speaking and listening in real-life situations.

## Dialogue Example
[Include a sample conversation]

## Key Phrases
- Phrase 1: [Usage explanation]
- Phrase 2: [Usage explanation]
- Phrase 3: [Usage explanation]

## Role-Play Activity
[Describe practice scenarios]

## Pronunciation Tips
[Include pronunciation guidance]`
}

export function SimplifiedCourseForm({ course, isOpen, onClose, onSuccess }: SimplifiedCourseFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  console.log('🔄 SimplifiedCourseForm rendered, isOpen:', isOpen, 'user:', user?.name)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor_name: '',
    price: 0,
    category: 'English Grammar',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration: '',
    image_url: '',
    is_published: false,
    learning_objectives: [] as string[]
  })

  const [modules, setModules] = useState<SimpleModule[]>([
    {
      title: 'Introduction',
      lessons: [
        {
          title: 'Welcome to the Course',
          content: contentTemplates.grammar,
          duration_minutes: 15,
          is_free_preview: true
        }
      ]
    }
  ])

  const loadCourseContent = useCallback(async (courseId: string) => {
    try {
      const { data: modulesData, error } = await supabase
        .from('course_modules')
        .select(`
          *,
          course_lessons (*)
        `)
        .eq('course_id', courseId)
        .order('order_index')

      if (error) throw error

      const formattedModules = modulesData.map(module => ({
        title: module.title,
        lessons: module.course_lessons
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((lesson: any) => ({
            title: lesson.title,
            content: lesson.content || '',
            duration_minutes: lesson.duration_minutes || 15,
            is_free_preview: lesson.is_free_preview
          }))
      }))

      if (formattedModules.length > 0) {
        setModules(formattedModules)
      }
    } catch (err) {
      console.error('Error loading course content:', err)
    }
  }, [])

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        instructor_name: course.instructor_name,
        price: course.price,
        category: course.category,
        level: course.level,
        duration: course.duration,
        image_url: course.image_url || '',
        is_published: course.is_published,
        learning_objectives: course.learning_objectives || []
      })
      // Load course content if editing
      loadCourseContent(course.id)
    } else {
      // Reset for new course
      setFormData({
        title: '',
        description: '',
        instructor_name: user?.name || '',
        price: 0,
        category: 'English Grammar',
        level: 'beginner',
        duration: '',
        image_url: '',
        is_published: false,
        learning_objectives: []
      })
      setModules([
        {
          title: 'Introduction',
          lessons: [
            {
              title: 'Welcome to the Course',
              content: contentTemplates.grammar,
              duration_minutes: 15,
              is_free_preview: true
            }
          ]
        }
      ])
    }
    setError(null)
  }, [course, user, isOpen, loadCourseContent])

  const addModule = () => {
    setModules([...modules, {
      title: `Module ${modules.length + 1}`,
      lessons: []
    }])
  }

  const updateModule = (index: number, title: string) => {
    const updated = [...modules]
    if (updated[index]) {
      updated[index] = { ...updated[index], title }
      setModules(updated)
    }
  }

  const deleteModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index))
  }

  const addLesson = (moduleIndex: number) => {
    const updated = [...modules]
    if (updated[moduleIndex]) {
      updated[moduleIndex] = {
        ...updated[moduleIndex],
        lessons: [
          ...updated[moduleIndex].lessons,
          {
            title: `Lesson ${updated[moduleIndex].lessons.length + 1}`,
            content: contentTemplates.grammar,
            duration_minutes: 15,
            is_free_preview: false
          }
        ]
      }
      setModules(updated)
    }
  }

  const updateLesson = (moduleIndex: number, lessonIndex: number, field: keyof SimpleLesson, value: any) => {
    const updated = [...modules]
    if (updated[moduleIndex] && updated[moduleIndex].lessons[lessonIndex]) {
      const updatedLessons = [...updated[moduleIndex].lessons]
      updatedLessons[lessonIndex] = {
        ...updatedLessons[lessonIndex],
        [field]: value
      } as SimpleLesson
      updated[moduleIndex] = {
        ...updated[moduleIndex],
        lessons: updatedLessons
      }
      setModules(updated)
    }
  }

  const deleteLesson = (moduleIndex: number, lessonIndex: number) => {
    const updated = [...modules]
    if (updated[moduleIndex]) {
      updated[moduleIndex] = {
        ...updated[moduleIndex],
        lessons: updated[moduleIndex].lessons.filter((_, i) => i !== lessonIndex)
      }
      setModules(updated)
    }
  }

  const insertTemplate = (moduleIndex: number, lessonIndex: number, template: string) => {
    updateLesson(moduleIndex, lessonIndex, 'content', contentTemplates[template as keyof typeof contentTemplates])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 FORM SUBMITTED - handleSubmit called')
    setLoading(true)
    setError(null)

    console.log('=== COURSE CREATION DEBUG ===')
    console.log('Form Data:', formData)
    console.log('Modules to save:', modules)
    console.log('Modules count:', modules.length)
    console.log('Total lessons:', modules.reduce((total, module) => total + module.lessons.length, 0))
    console.log('User:', user)

    // Basic validation
    if (!formData.title || !formData.description) {
      const validationError = 'Title and description are required'
      console.error('❌ Validation failed:', validationError)
      setError(validationError)
      setLoading(false)
      return
    }

    if (!user) {
      const authError = 'User not authenticated'
      console.error('❌ Auth failed:', authError)
      setError(authError)
      setLoading(false)
      return
    }

    try {
            // Try using the optimized database function first
      try {
        console.log('=== TRYING DATABASE RPC FUNCTION ===')
        const rpcCourseData = {
          title: formData.title,
          description: formData.description,
          instructor_id: user!.id,
          instructor_name: formData.instructor_name || user!.name || 'Unknown',
          price: formData.price,
          category: formData.category,
          level: formData.level,
          duration: formData.duration || null,
          image_url: formData.image_url || null,
          learning_objectives: formData.learning_objectives,
          is_published: formData.is_published,
          student_count: 0,
          status: formData.is_published ? 'published' : 'draft',
          updated_at: new Date().toISOString()
        }

        console.log('📊 RPC courseData:', rpcCourseData)

        const { error } = await supabase.rpc('save_course_with_content', {
          course_data: rpcCourseData,
          modules_data: modules,
          is_update: !!course?.id
        })

        console.log('RPC function result:', { error })

        if (error) throw error

        console.log('✅ RPC function succeeded - course and modules should be saved')
        onSuccess()
        onClose()
        return
      } catch (rpcError) {
        console.log('❌ Database function failed or not available:', rpcError)
        console.log('Falling back to individual operations...')
        
        // Fallback to individual operations
        let courseId: string

        const courseData = {
          title: formData.title,
          description: formData.description,
          instructor_id: user!.id,
          instructor_name: formData.instructor_name || user!.name || 'Unknown',
          price: formData.price,
          category: formData.category,
          level: formData.level,
          duration: formData.duration || null,
          image_url: formData.image_url || null,
          learning_objectives: formData.learning_objectives,
          is_published: formData.is_published,
          student_count: 0, // Default value
          status: formData.is_published ? 'published' : 'draft',
          updated_at: new Date().toISOString()
        }

        console.log('📊 Prepared courseData for database:', courseData)

        if (course?.id) {
          // Update existing course
          const { error } = await supabase
            .from('courses')
            .update(courseData)
            .eq('id', course.id)

          if (error) throw error
          courseId = course.id

          // Delete existing modules (cascading delete will handle lessons)
          await supabase
            .from('course_modules')
            .delete()
            .eq('course_id', courseId)
        } else {
          // Create new course
          const { data, error } = await supabase
            .from('courses')
            .insert(courseData)
            .select()
            .single()

          if (error) throw error
          courseId = data.id
        }

        // Insert modules and lessons
        console.log('=== MODULE INSERTION DEBUG ===')
        console.log('Course ID for modules:', courseId)
        console.log('Starting module insertion for', modules.length, 'modules')
        
        for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
          const courseModule = modules[moduleIndex]
          if (!courseModule) continue
          
          console.log(`Inserting module ${moduleIndex}:`, courseModule.title)
          
          const { data: moduleData, error: moduleError } = await supabase
            .from('course_modules')
            .insert({
              course_id: courseId,
              title: courseModule.title,
              description: null,
              order_index: moduleIndex,
              is_published: true
            })
            .select()
            .single()

          console.log(`Module ${moduleIndex} result:`, { moduleData, moduleError })

          if (moduleError) throw moduleError

          // Insert lessons for this module
          console.log(`Inserting ${courseModule.lessons.length} lessons for module ${moduleIndex}`)
          for (let lessonIndex = 0; lessonIndex < courseModule.lessons.length; lessonIndex++) {
            const lesson = courseModule.lessons[lessonIndex]
            if (!lesson) continue
            
            console.log(`  Inserting lesson ${lessonIndex}:`, lesson.title)
            
            const { error: lessonError } = await supabase
              .from('course_lessons')
              .insert({
                module_id: moduleData.id,
                title: lesson.title,
                description: null,
                content: lesson.content,
                video_url: null,
                duration_minutes: lesson.duration_minutes,
                order_index: lessonIndex,
                is_published: true,
                is_free_preview: lesson.is_free_preview
              })

            console.log(`  Lesson ${lessonIndex} result:`, { lessonError })

            if (lessonError) throw lessonError
          }
        }

        onSuccess()
        onClose()
      }
    } catch (err) {
      console.error('❌ FATAL ERROR in course creation:', err)
      console.error('Error type:', typeof err)
      console.error('Error instanceof Error:', err instanceof Error)
      if (err instanceof Error) {
        console.error('Error message:', err.message)
        console.error('Error stack:', err.stack)
      }
      console.error('Raw error object:', JSON.stringify(err, null, 2))
      
      setError(err instanceof Error ? err.message : 'Failed to save course')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-blue-50">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {course ? 'Edit Course' : 'Create New Course'}
              </h2>
              <p className="text-sm text-gray-600">
                Simplified course creation for text-based content
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form 
          onSubmit={(e) => {
            console.log('📝 FORM onSubmit event triggered', e)
            handleSubmit(e)
          }} 
          noValidate
          className="flex-1 overflow-y-auto"
        >
          {/* DEBUGGING: Simple button test */}
          <div className="p-4 bg-yellow-100 border border-yellow-300 rounded m-4">
            <h3 className="font-bold text-yellow-800 mb-2">🧪 Debug Test</h3>
            <button 
              type="button"
              onClick={() => {
                console.log('🔍 DEBUG: Simple button clicked!')
                alert('Debug button works in SimplifiedCourseForm!')
              }}
              className="bg-yellow-600 text-white px-3 py-1 rounded text-sm mr-2"
            >
              Test Click
            </button>
            <button 
              type="button"
              onClick={() => {
                console.log('🔍 DEBUG: Form data:', formData)
                console.log('🔍 DEBUG: Loading state:', loading)
                console.log('🔍 DEBUG: Error state:', error)
              }}
              className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
            >
              Log State
            </button>
          </div>
          <div className="p-6 space-y-8">
            {/* Debug info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <strong>Debug Info:</strong> Form ready, user: {user?.name || 'Not loaded'}, modules: {modules.length}
            </div>
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Basic Course Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Advanced English Grammar Mastery"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent bg-background/50 backdrop-blur-sm resize-vertical"
                    placeholder="Describe what students will learn, key topics covered, and learning outcomes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {levels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 4 weeks, 20 hours"
                  />
                </div>

                {/* Learning Objectives */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What Students Will Learn
                  </label>
                  <div className="space-y-2">
                    {formData.learning_objectives.map((objective, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={objective}
                          onChange={(e) => {
                            const updated = [...formData.learning_objectives]
                            updated[index] = e.target.value
                            setFormData({ ...formData, learning_objectives: updated })
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Master English grammar fundamentals"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.learning_objectives.filter((_, i) => i !== index)
                            setFormData({ ...formData, learning_objectives: updated })
                          }}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ 
                          ...formData, 
                          learning_objectives: [...formData.learning_objectives, ''] 
                        })
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Add Learning Objective
                    </button>
                    <p className="text-xs text-gray-500">
                      These will appear in the &quot;What you&apos;ll learn&quot; section on the course page
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
                  <button
                    type="button"
                    onClick={addModule}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Module
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {modules.map((module, moduleIndex) => (
                  <div key={moduleIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Module Header */}
                    <div className="bg-blue-50 p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          <input
                            type="text"
                            value={module.title}
                            onChange={(e) => updateModule(moduleIndex, e.target.value)}
                            className="flex-1 font-medium bg-transparent border-none focus:ring-0 focus:outline-none"
                            placeholder="Module title"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => addLesson(moduleIndex)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Add Lesson"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteModule(moduleIndex)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Delete Module"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Lessons */}
                    <div className="p-4 space-y-4">
                      {module.lessons.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No lessons yet. Click the + button to add your first lesson.</p>
                        </div>
                      ) : (
                        module.lessons.map((lesson, lessonIndex) => (
                          <div key={lessonIndex} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                            {/* Lesson Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={lesson.title}
                                  onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'title', e.target.value)}
                                  className="font-medium bg-transparent border-none p-0 focus:ring-0 focus:outline-none w-full"
                                  placeholder="Lesson title"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={lesson.duration_minutes}
                                  onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'duration_minutes', parseInt(e.target.value) || 15)}
                                  className="w-16 text-xs px-2 py-1 border border-gray-200 rounded text-center"
                                  min="1"
                                />
                                <span className="text-xs text-gray-500">min</span>
                                <label className="flex items-center gap-1 text-xs text-gray-600">
                                  <input
                                    type="checkbox"
                                    checked={lesson.is_free_preview}
                                    onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'is_free_preview', e.target.checked)}
                                    className="w-3 h-3"
                                  />
                                  Free
                                </label>
                                <button
                                  type="button"
                                  onClick={() => deleteLesson(moduleIndex, lessonIndex)}
                                  className="text-red-600 hover:text-red-700 p-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Content Templates */}
                            <div className="mb-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-gray-700">Quick Templates:</span>
                                {Object.keys(contentTemplates).map(template => (
                                  <button
                                    key={template}
                                    type="button"
                                    onClick={() => insertTemplate(moduleIndex, lessonIndex, template)}
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                  >
                                    {template.charAt(0).toUpperCase() + template.slice(1)}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Lesson Content */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">
                                Lesson Content
                              </label>
                              <textarea
                                value={lesson.content}
                                onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'content', e.target.value)}
                                placeholder="Write your lesson content here. You can include detailed explanations, examples, exercises, and any other learning materials for this lesson."
                                rows={15}
                                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent bg-background/50 backdrop-blur-sm font-mono text-sm resize-vertical min-h-[200px]"
                              />
                              <p className="text-xs text-muted-foreground">
                                Tip: This field supports markdown formatting and can be resized vertically for longer content.
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                    Publish course immediately
                  </label>
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    onClick={() => {
                      console.log('🎯 SUBMIT BUTTON CLICKED')
                      console.log('📊 Current form data:', formData)
                      console.log('✅ Title filled:', !!formData.title)
                      console.log('✅ Description filled:', !!formData.description)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {course ? 'Update Course' : 'Create Course'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
