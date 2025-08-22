'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Loader2, Sparkles, Target, BookOpen, Clock, Lightbulb, Users, Zap } from 'lucide-react'

// Enhanced interfaces for AI course generation
export interface CourseGenerationRequest {
  topic: string
  level: 'beginner' | 'intermediate' | 'advanced'
  module_count: number
  lessons_per_module: number
  focus_area?: string
  course_type?: 'comprehensive' | 'practical' | 'intensive'
  language_level?: 'basic' | 'intermediate' | 'advanced' | 'native'
  target_audience?: string
  learning_style?: 'visual' | 'practical' | 'theoretical' | 'mixed'
}

export interface GeneratedCourseModule {
  title: string
  description: string
  order_index: number
  lessons: GeneratedCourseLesson[]
}

export interface GeneratedCourseLesson {
  title: string
  description: string
  content: string
  order_index: number
  duration_minutes: number
  is_free_preview: boolean
}

export interface GeneratedCourse {
  title: string
  description: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  instructor_name: string
  price: number
  learning_objectives: string[]
  modules: GeneratedCourseModule[]
}

interface AICourseGeneratorProps {
  isOpen: boolean
  onClose: () => void
  onCourseGenerated: (course: GeneratedCourse) => void
}

export function AICourseGenerator({ isOpen, onClose, onCourseGenerated }: AICourseGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<CourseGenerationRequest>({
    topic: '',
    level: 'beginner',
    module_count: 4,
    lessons_per_module: 4,
    focus_area: '',
    course_type: 'comprehensive',
    language_level: 'intermediate',
    target_audience: '',
    learning_style: 'mixed'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.topic.trim()) {
      setError('Please enter a topic for the course')
      return
    }

    if (formData.module_count < 3 || formData.module_count > 10) {
      setError('Module count must be between 3 and 10')
      return
    }

    if (formData.lessons_per_module < 2 || formData.lessons_per_module > 10) {
      setError('Lessons per module must be between 2 and 10')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('🚀 [AI_COURSE] Generating course with data:', formData)
      
      // Transform formData to match API expectations
      const apiRequest = {
        title: formData.topic,
        description: `A comprehensive ${formData.level} course on ${formData.topic}${formData.focus_area ? ` focusing on ${formData.focus_area}` : ''}`,
        level: formData.level,
        module_count: formData.module_count,
        lessons_per_module: formData.lessons_per_module,
        course_format: formData.course_type || 'comprehensive',
        subject_area: formData.focus_area || '',
        target_audience: formData.target_audience || '',
        language_focus: formData.language_level || 'intermediate'
      }
      
      console.log('📝 [AI_COURSE] Sending API request:', apiRequest)
      
      const response = await fetch('/api/admin/generate-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiRequest)
      })

      const result = await response.json()
      console.log('📚 [AI_COURSE] Generation result:', result)

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate course')
      }

      // Transform the nested API response to flat GeneratedCourse structure
      const aiResponse = result.course
      const flattenedCourse: GeneratedCourse = {
        title: aiResponse.course?.title || aiResponse.title || formData.topic,
        description: aiResponse.course?.description || aiResponse.description || `A comprehensive ${formData.level} course on ${formData.topic}`,
        category: formData.focus_area || 'English Learning',
        level: formData.level,
        duration: `${formData.module_count * formData.lessons_per_module * 25} minutes`, // Estimate duration
        instructor_name: 'AI Generated Course',
        price: 0,
        learning_objectives: aiResponse.course?.learning_objectives || aiResponse.learning_objectives || [
          `Master ${formData.topic} concepts`,
          `Apply ${formData.level} level skills`,
          'Complete practical exercises'
        ],
        modules: aiResponse.modules || []
      }

      console.log('🎯 [AI_COURSE] Flattened course structure:', flattenedCourse)
      onCourseGenerated(flattenedCourse)
      onClose()
    } catch (err: any) {
      console.error('💥 [AI_COURSE] Generation error:', err)
      setError(err.message || 'Failed to generate course')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card variant="elevated" className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 border-b border-border">
          <CardTitle className="flex items-center gap-3 text-foreground">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <Sparkles className="h-4 w-4 text-secondary" />
            </div>
            AI Course Generator
          </CardTitle>
          <CardDescription>
            Create comprehensive courses with AI assistance. Generate structured content with modules, lessons, and learning objectives.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Card variant="base" className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-4">
                  <p className="text-destructive text-sm">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Course Topic & Focus */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-foreground">Course Topic & Focus</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Main Topic *
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g., Advanced English Grammar, Business Communication, IELTS Preparation..."
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Specific Focus Area
                  </label>
                  <input
                    type="text"
                    value={formData.focus_area || ''}
                    onChange={(e) => setFormData({ ...formData, focus_area: e.target.value })}
                    placeholder="e.g., Present Perfect, Email Writing, Speaking Fluency..."
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={formData.target_audience || ''}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    placeholder="e.g., Business professionals, Students, Beginners..."
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Course Structure */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-foreground">Course Structure</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Number of Modules
                  </label>
                  <select
                    value={formData.module_count}
                    onChange={(e) => setFormData({ ...formData, module_count: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    {[3, 4, 5, 6, 8, 10].map(num => (
                      <option key={num} value={num}>{num} modules</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <BookOpen className="h-4 w-4 inline mr-1" />
                    Lessons per Module
                  </label>
                  <select
                    value={formData.lessons_per_module}
                    onChange={(e) => setFormData({ ...formData, lessons_per_module: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    {[2, 3, 4, 5, 6, 8, 10].map(num => (
                      <option key={num} value={num}>{num} lessons</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Target className="h-4 w-4 inline mr-1" />
                    Difficulty Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Zap className="h-4 w-4 inline mr-1" />
                    Course Type
                  </label>
                  <select
                    value={formData.course_type}
                    onChange={(e) => setFormData({ ...formData, course_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    <option value="comprehensive">Comprehensive</option>
                    <option value="practical">Practical Focused</option>
                    <option value="intensive">Intensive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Learning Preferences */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-foreground">Learning Preferences</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Language Level
                  </label>
                  <select
                    value={formData.language_level}
                    onChange={(e) => setFormData({ ...formData, language_level: e.target.value as any })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    <option value="basic">Basic (A1-A2)</option>
                    <option value="intermediate">Intermediate (B1-B2)</option>
                    <option value="advanced">Advanced (C1-C2)</option>
                    <option value="native">Native Level</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Lightbulb className="h-4 w-4 inline mr-1" />
                    Learning Style
                  </label>
                  <select
                    value={formData.learning_style}
                    onChange={(e) => setFormData({ ...formData, learning_style: e.target.value as any })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    <option value="mixed">Mixed Approach</option>
                    <option value="visual">Visual Learning</option>
                    <option value="practical">Hands-on Practice</option>
                    <option value="theoretical">Theory Focused</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Feature Info */}
            <Card variant="glass" className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Advanced AI Course Generation</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Our AI will create a comprehensive course with structured modules, detailed lessons, 
                      learning objectives, and content tailored to your specifications.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>• Structured curriculum design</div>
                      <div>• Detailed lesson content</div>
                      <div>• Learning objectives</div>
                      <div>• Progress tracking ready</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading || !formData.topic.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-secondary text-white hover:text-black font-medium rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Course...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Course
                  </>
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
