'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Save, Trash2, GripVertical, Clock, BookOpen, Upload, X, FileText, Loader2, Award, Target, List } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { createSupabaseClient } from '@/lib/supabase'
import type { Course } from '@/lib/supabase'
import { toast } from 'sonner'
import { categories, levels } from '@/lib/courseConstants'

interface Lesson {
  id: string
  course_id?: string
  title: string
  content: string
  duration_minutes: number
  order_index: number
  video_url?: string
  is_published: boolean
}

interface CourseBuilderProps {
  course?: Course | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CourseBuilder({ course, isOpen, onClose, onSuccess }: CourseBuilderProps) {
  const [courseData, setCourseData] = useState<Partial<Course>>({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    price: 0,
    duration: '',
    instructor_name: '',
    image_url: '',
    is_published: false,
    learning_objectives: ['']
  })

  const [lessons, setLessons] = useState<Lesson[]>([])
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingLessons, setIsLoadingLessons] = useState(false)

  // Load course data and lessons when editing
  useEffect(() => {
    if (course?.id && isOpen) {
      setCourseData(course)
      setImagePreview(course.image_url || '')
      loadLessons(course.id)
    } else if (isOpen && !course) {
      // Reset for new course
      setCourseData({
        title: '',
        description: '',
        category: '',
        level: 'beginner',
        price: 0,
        duration: '',
        instructor_name: '',
        image_url: '',
        is_published: false,
        learning_objectives: ['']
      })
      setLessons([])
      setImagePreview('')
      setActiveLessonId(null)
    }
  }, [course, isOpen])

  const loadLessons = async (courseId: string) => {
    setIsLoadingLessons(true)
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index')

      if (error) throw error
      setLessons(data || [])
    } catch (error: any) {
      console.error('Error loading lessons:', error)
      toast.error('Failed to load lessons')
    } finally {
      setIsLoadingLessons(false)
    }
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const supabase = createSupabaseClient()

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `course-covers/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath)

      setImagePreview(publicUrl)
      setCourseData({ ...courseData, image_url: publicUrl })
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    }
  }

  const removeImage = () => {
    setImagePreview('')
    setCourseData({ ...courseData, image_url: '' })
  }

  const addLesson = () => {
    const newLesson: Lesson = {
      id: `temp-${Date.now()}`,
      course_id: course?.id || 'temp',
      title: '',
      content: '',
      duration_minutes: 30,
      order_index: lessons.length,
      video_url: '',
      is_published: false
    }

    setLessons([...lessons, newLesson])
    setActiveLessonId(newLesson.id)
  }

  const updateLesson = (id: string, updates: Partial<Lesson>) => {
    setLessons(lessons.map(l => l.id === id ? { ...l, ...updates } : l))
  }

  const deleteLesson = (id: string) => {
    setLessons(lessons.filter(l => l.id !== id))
    if (activeLessonId === id) {
      setActiveLessonId(null)
    }
  }

  const duplicateLesson = (id: string) => {
    const lesson = lessons.find(l => l.id === id)
    if (lesson) {
      const duplicated = { ...lesson, id: `temp-${Date.now()}`, title: `${lesson.title} (Copy)` }
      const index = lessons.findIndex(l => l.id === id)
      const newLessons = [...lessons]
      newLessons.splice(index + 1, 0, duplicated)
      setLessons(newLessons)
    }
  }

  const addLearningObjective = () => {
    setCourseData({
      ...courseData,
      learning_objectives: [...(courseData.learning_objectives || ['']), '']
    })
  }

  const updateLearningObjective = (index: number, value: string) => {
    const newObjectives = [...(courseData.learning_objectives || [''])]
    newObjectives[index] = value
    setCourseData({ ...courseData, learning_objectives: newObjectives })
  }

  const removeLearningObjective = (index: number) => {
    if ((courseData.learning_objectives || ['']).length > 1) {
      const newObjectives = (courseData.learning_objectives || ['']).filter((_, i) => i !== index)
      setCourseData({ ...courseData, learning_objectives: newObjectives })
    }
  }

  const handleSave = async () => {
    // Validation
    if (!courseData.title?.trim()) {
      toast.error('Please enter a course title')
      return
    }

    if (!courseData.description?.trim()) {
      toast.error('Please enter a course description')
      return
    }

    if (!courseData.category) {
      toast.error('Please select a category')
      return
    }

    setIsSaving(true)

    // Show progress toast
    const toastId = toast.loading(course ? 'Updating course...' : 'Creating course...')

    try {
      const supabase = createSupabaseClient()
      let courseId = course?.id

      // Prepare course data
      const coursePayload = {
        ...courseData,
        learning_objectives: (courseData.learning_objectives || ['']).filter(obj => obj.trim() !== '')
      }

      // Save/Update Course
      if (courseId) {
        toast.loading('Saving course details...', { id: toastId })
        const { error } = await supabase
          .from('courses')
          .update(coursePayload)
          .eq('id', courseId)

        if (error) throw error
      } else {
        toast.loading('Creating new course...', { id: toastId })
        const { data, error } = await supabase
          .from('courses')
          .insert(coursePayload)
          .select()
          .single()

        if (error) throw error
        courseId = data.id
      }

      // Save Lessons
      if (courseId && lessons.length > 0) {
        toast.loading(`Saving ${lessons.length} lesson${lessons.length !== 1 ? 's' : ''}...`, { id: toastId })

        // Delete old lessons first (if editing)
        if (course?.id) {
          await supabase
            .from('course_lessons')
            .delete()
            .eq('course_id', courseId)
        }

        // Insert new/updated lessons
        const lessonsPayload = lessons.map((lesson, index) => ({
          course_id: courseId,
          title: lesson.title,
          content: lesson.content,
          duration_minutes: lesson.duration_minutes,
          order_index: index,
          video_url: lesson.video_url || null,
          is_published: lesson.is_published
        }))

        const { error: lessonsError } = await supabase
          .from('course_lessons')
          .insert(lessonsPayload)

        if (lessonsError) throw lessonsError
      }

      // Show success message
      toast.success(
        course
          ? `Course updated successfully! ${lessons.length} lesson${lessons.length !== 1 ? 's' : ''} saved.`
          : `Course created successfully with ${lessons.length} lesson${lessons.length !== 1 ? 's' : ''}!`,
        { id: toastId, duration: 3000 }
      )

      // Small delay to let user see success message
      await new Promise(resolve => setTimeout(resolve, 500))

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error saving course:', error)
      toast.error(error.message || 'Failed to save course', { id: toastId })
    } finally {
      setIsSaving(false)
    }
  }

  const renderLessonEditor = (lesson: Lesson) => {
    return (
      <div className="space-y-4">
        {/* Lesson Title */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Lesson Title
          </label>
          <input
            type="text"
            value={lesson.title || ''}
            onChange={(e) => updateLesson(lesson.id, { title: e.target.value })}
            placeholder="Enter lesson title..."
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Lesson Content */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Lesson Content
          </label>
          <textarea
            value={lesson.content || ''}
            onChange={(e) => updateLesson(lesson.id, { content: e.target.value })}
            placeholder="Enter lesson content, description, or instructions..."
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
            rows={8}
          />
        </div>

        {/* Video URL & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Video URL (Optional)
            </label>
            <input
              type="text"
              value={lesson.video_url || ''}
              onChange={(e) => updateLesson(lesson.id, { video_url: e.target.value })}
              placeholder="https://youtube.com/..."
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              <Clock className="w-4 h-4 inline mr-1" />
              Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="300"
              value={lesson.duration_minutes || 30}
              onChange={(e) => updateLesson(lesson.id, { duration_minutes: parseInt(e.target.value) || 30 })}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Publish Toggle */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id={`publish-${lesson.id}`}
            checked={lesson.is_published}
            onChange={(e) => updateLesson(lesson.id, { is_published: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <label htmlFor={`publish-${lesson.id}`} className="text-sm font-medium text-gray-700 cursor-pointer">
            Publish this lesson (make it visible to students)
          </label>
        </div>
      </div>
    )
  }

  const totalDuration = lessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0)
  const totalHours = Math.floor(totalDuration / 60)
  const totalMinutes = totalDuration % 60

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {course ? 'Edit Course' : 'Create New Course'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} • {totalHours}h {totalMinutes}m total duration
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Course
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel - Course Settings */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <div className="p-6 space-y-5">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Course Details
                    </h3>

                    {/* Title */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Course Title *
                      </label>
                      <input
                        type="text"
                        value={courseData.title || ''}
                        onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                        placeholder="Enter course title..."
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Cover Image */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Cover Image
                      </label>
                      {imagePreview || courseData.image_url ? (
                        <div className="relative w-full h-40">
                          <Image
                            src={imagePreview || courseData.image_url || ''}
                            alt="Course cover"
                            fill
                            className="object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            onClick={removeImage}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 font-medium">Upload Image</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Description *
                      </label>
                      <textarea
                        value={courseData.description || ''}
                        onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                        placeholder="Brief description..."
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                        rows={3}
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Category *
                      </label>
                      <select
                        value={courseData.category || ''}
                        onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Level */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Difficulty Level
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {levels.map((level) => (
                          <button
                            key={level.value}
                            onClick={() => setCourseData({ ...courseData, level: level.value as any })}
                            className={cn(
                              "p-2 rounded-lg border-2 text-sm font-medium capitalize transition-all",
                              courseData.level === level.value
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            )}
                          >
                            {level.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Instructor & Price */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Price ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={courseData.price || 0}
                          onChange={(e) => setCourseData({ ...courseData, price: parseFloat(e.target.value) || 0 })}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={courseData.duration || ''}
                          onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                          placeholder="e.g. 8 weeks"
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Instructor Name */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Instructor Name
                      </label>
                      <input
                        type="text"
                        value={courseData.instructor_name || ''}
                        onChange={(e) => setCourseData({ ...courseData, instructor_name: e.target.value })}
                        placeholder="Your name"
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Publish Toggle */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          id="publish-course"
                          checked={courseData.is_published || false}
                          onChange={(e) => setCourseData({ ...courseData, is_published: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label htmlFor="publish-course" className="text-sm font-medium text-gray-700 cursor-pointer">
                          Publish course
                        </label>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {lessons.length}
                          </div>
                          <div className="text-xs text-blue-700 mt-1">
                            Lessons
                          </div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {totalHours}h {totalMinutes}m
                          </div>
                          <div className="text-xs text-green-700 mt-1">
                            Duration
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Panel - Lessons & Learning Objectives */}
              <div className="lg:col-span-2 space-y-6">
                {/* Learning Objectives */}
                <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Learning Objectives
                        </h3>
                      </div>
                      <Button variant="outline" size="sm" onClick={addLearningObjective}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {(courseData.learning_objectives || ['']).map((objective, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={objective}
                            onChange={(e) => updateLearningObjective(index, e.target.value)}
                            placeholder={`Learning objective ${index + 1}`}
                            className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                          />
                          {(courseData.learning_objectives || ['']).length > 1 && (
                            <button
                              onClick={() => removeLearningObjective(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Add Lesson Button */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                  <div className="p-6">
                    <button
                      onClick={addLesson}
                      className="w-full p-4 rounded-lg border-2 border-dashed border-blue-300 bg-white hover:bg-blue-50 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-600">Add New Lesson</span>
                    </button>
                  </div>
                </Card>

                {/* Lessons List */}
                {isLoadingLessons ? (
                  <Card className="p-12">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                      <p className="text-sm text-gray-600">Loading lessons...</p>
                    </div>
                  </Card>
                ) : lessons.length === 0 ? (
                  <Card className="border-2 border-dashed border-gray-300">
                    <div className="p-12 text-center">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No lessons yet
                      </h3>
                      <p className="text-sm text-gray-600">
                        Click &quot;Add New Lesson&quot; above to get started
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {lessons.map((lesson, index) => {
                      const isActive = activeLessonId === lesson.id

                      return (
                        <Card
                          key={lesson.id}
                          className={cn(
                            "border-2 transition-all",
                            isActive
                              ? "border-blue-500 shadow-lg"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <div className="p-6">
                            {/* Lesson Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <button className="cursor-move text-gray-400 hover:text-gray-600">
                                  <GripVertical className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    Lesson {index + 1}
                                  </Badge>
                                  <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {lesson.duration_minutes} min
                                  </Badge>
                                  {lesson.is_published && (
                                    <Badge className="bg-green-100 text-green-700 border-green-200">
                                      Published
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setActiveLessonId(isActive ? null : lesson.id)}
                                  className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  {isActive ? 'Collapse' : 'Edit'}
                                </button>
                                <button
                                  onClick={() => duplicateLesson(lesson.id)}
                                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  Copy
                                </button>
                                <button
                                  onClick={() => deleteLesson(lesson.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Lesson Preview/Editor */}
                            {isActive ? (
                              <div className="border-t pt-4">
                                {renderLessonEditor(lesson)}
                              </div>
                            ) : (
                              <div className="pl-8">
                                <p className="text-gray-900 font-medium">
                                  {lesson.title || <span className="text-gray-400 italic">No lesson title</span>}
                                </p>
                                {lesson.content && (
                                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                    {lesson.content}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
