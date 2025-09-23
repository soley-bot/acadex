import React, { memo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  IconPlus, 
  IconTrash, 
  IconBook, 
  IconVideo,
  IconAlertTriangle
} from '@tabler/icons-react'

interface LessonData {
  id?: string
  title: string
  description: string
  content: string
  video_url?: string
  video_type?: 'upload' | 'youtube'
  duration_minutes?: number
  order_index: number
  is_free_preview: boolean
  quiz_id?: string
}

interface ModuleData {
  id?: string
  title: string
  description: string
  order_index: number
  lessons: LessonData[]
}

interface QuizOption {
  id: string
  title: string
  description?: string
}

interface CourseContentStepProps {
  modules: ModuleData[]
  availableQuizzes: QuizOption[]
  onChange: (modules: ModuleData[]) => void
  onQuizChange?: (quizId: string) => void
}

export const CourseContentStep = memo<CourseContentStepProps>(({
  modules,
  availableQuizzes,
  onChange,
  onQuizChange
}) => {
  const [expandedModules, setExpandedModules] = useState<string[]>([])

  const addModule = () => {
    const newModule: ModuleData = {
      title: '',
      description: '',
      order_index: modules.length,
      lessons: []
    }
    onChange([...modules, newModule])
  }

  const updateModule = (moduleIndex: number, updates: Partial<ModuleData>) => {
    const updatedModules = modules.map((module, index) =>
      index === moduleIndex ? { ...module, ...updates } : module
    )
    onChange(updatedModules)
  }

  const removeModule = (moduleIndex: number) => {
    const updatedModules = modules.filter((_, index) => index !== moduleIndex)
      .map((module, index) => ({ ...module, order_index: index }))
    onChange(updatedModules)
  }

  const addLesson = (moduleIndex: number) => {
    const newLesson: LessonData = {
      title: '',
      description: '',
      content: '',
      order_index: modules[moduleIndex].lessons.length,
      is_free_preview: false
    }
    
    const updatedModules = modules.map((module, index) =>
      index === moduleIndex 
        ? { ...module, lessons: [...module.lessons, newLesson] }
        : module
    )
    onChange(updatedModules)
  }

  const updateLesson = (moduleIndex: number, lessonIndex: number, updates: Partial<LessonData>) => {
    const updatedModules = modules.map((module, index) =>
      index === moduleIndex 
        ? {
            ...module,
            lessons: module.lessons.map((lesson, lIndex) =>
              lIndex === lessonIndex ? { ...lesson, ...updates } : lesson
            )
          }
        : module
    )
    onChange(updatedModules)
  }

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const updatedModules = modules.map((module, index) =>
      index === moduleIndex 
        ? {
            ...module,
            lessons: module.lessons.filter((_, lIndex) => lIndex !== lessonIndex)
              .map((lesson, lIndex) => ({ ...lesson, order_index: lIndex }))
          }
        : module
    )
    onChange(updatedModules)
  }

  const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0)
  const totalDuration = modules.reduce((total, module) => 
    total + module.lessons.reduce((moduleTotal, lesson) => 
      moduleTotal + (lesson.duration_minutes || 0), 0), 0)

  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconBook size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold">Course Content</h3>
          </div>
          <Button
            onClick={addModule}
            variant="outline"
            className="flex items-center gap-2"
          >
            <IconPlus size={16} />
            Add Module
          </Button>
        </div>

        {/* Course Stats */}
        <Card className="border border-gray-200 bg-gray-50">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Modules</p>
                <p className="text-sm font-medium">{modules.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Lessons</p>
                <p className="text-sm font-medium">{totalLessons}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Duration</p>
                <p className="text-sm font-medium">{totalDuration} minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules List */}
        {modules.length === 0 ? (
          <Card className="border border-gray-200">
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <p className="text-lg text-gray-500">No modules yet</p>
              <p className="text-sm text-gray-500 text-center">
                Add your first module to start building your course content
              </p>
              <Button
                onClick={addModule}
                className="flex items-center gap-2"
              >
                <IconPlus size={16} />
                Create First Module
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {modules.map((module, moduleIndex) => (
              <Card key={moduleIndex} className="border border-gray-200">
                <CardContent className="space-y-4 p-6">
                  {/* Module Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Badge variant="secondary" className="text-xs">
                        Module {moduleIndex + 1}
                      </Badge>
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Module title"
                          value={module.title}
                          onChange={(e) => updateModule(moduleIndex, { title: e.target.value })}
                          className="border-none text-base font-medium p-0 h-auto focus-visible:ring-0"
                        />
                        <Textarea
                          placeholder="Module description"
                          value={module.description}
                          onChange={(e) => updateModule(moduleIndex, { description: e.target.value })}
                          className="border-none text-sm p-0 resize-none focus-visible:ring-0"
                          rows={2}
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeModule(moduleIndex)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>

                  {/* Lessons */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium">
                        Lessons ({module.lessons.length})
                      </h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addLesson(moduleIndex)}
                        className="flex items-center gap-2"
                      >
                        <IconPlus size={14} />
                        Add Lesson
                      </Button>
                    </div>

                    {module.lessons.length === 0 ? (
                      <Alert>
                        <AlertDescription>
                          <p className="text-sm">No lessons in this module yet</p>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-3">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <Card key={lessonIndex} className="border border-gray-200 p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {lessonIndex + 1}
                                  </Badge>
                                  {lesson.is_free_preview && (
                                    <Badge className="bg-green-100 text-green-800 text-xs">Free Preview</Badge>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeLesson(moduleIndex, lessonIndex)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                                >
                                  <IconTrash size={14} />
                                </Button>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <Input
                                  placeholder="Lesson title"
                                  value={lesson.title}
                                  onChange={(e) => updateLesson(moduleIndex, lessonIndex, { title: e.target.value })}
                                  className="text-sm"
                                />
                                <Input
                                  type="number"
                                  placeholder="Duration (min)"
                                  value={lesson.duration_minutes || ''}
                                  onChange={(e) => updateLesson(moduleIndex, lessonIndex, { duration_minutes: Number(e.target.value) || 0 })}
                                  min="0"
                                  className="text-sm"
                                />
                              </div>

                              <Textarea
                                placeholder="Lesson description"
                                value={lesson.description}
                                onChange={(e) => updateLesson(moduleIndex, lessonIndex, { description: e.target.value })}
                                rows={2}
                                className="text-sm"
                              />

                              <div>
                                <Label className="flex items-center gap-2 text-sm">
                                  <IconVideo size={16} />
                                  Video URL
                                </Label>
                                <Input
                                  placeholder="Video URL (YouTube or upload)"
                                  value={lesson.video_url}
                                  onChange={(e) => updateLesson(moduleIndex, lessonIndex, { video_url: e.target.value })}
                                  className="text-sm mt-1"
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id={`free-preview-${moduleIndex}-${lessonIndex}`}
                                    checked={lesson.is_free_preview}
                                    onCheckedChange={(checked) => updateLesson(moduleIndex, lessonIndex, { is_free_preview: checked })}
                                  />
                                  <Label htmlFor={`free-preview-${moduleIndex}-${lessonIndex}`} className="text-sm">Free preview</Label>
                                </div>
                                <Select
                                  value={lesson.quiz_id || ''}
                                  onValueChange={(value) => updateLesson(moduleIndex, lessonIndex, { quiz_id: value || undefined })}
                                >
                                  <SelectTrigger className="w-48 text-sm">
                                    <SelectValue placeholder="Attach quiz" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableQuizzes.map((quiz) => (
                                      <SelectItem key={quiz.id} value={quiz.id}>
                                        {quiz.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Alert */}
        {modules.length > 0 && totalLessons === 0 && (
          <Alert>
            <IconAlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <p className="text-sm">
                Your course has {modules.length} module(s) but no lessons yet. 
                Add lessons to each module to complete your course structure.
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
})

CourseContentStep.displayName = 'CourseContentStep'