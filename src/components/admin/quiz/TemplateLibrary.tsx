import React, { useState, useMemo } from 'react'
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Target, 
  ChevronDown,
  Plus,
  Wand2,
  Tag
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  QUESTION_TEMPLATES, 
  TEMPLATE_CATEGORIES,
  getTemplatesByCategory,
  getTemplatesByType,
  getTemplatesByDifficulty,
  searchTemplates,
  type QuestionTemplate 
} from './QuestionTemplates'
import { QuestionTypeIndicator } from './QuestionTypeIndicators'
import { FEATURE_FLAGS } from '@/lib/featureFlags'
import { trackFormEvent } from '@/lib/quizFormMonitoring'
import type { QuestionType } from '@/lib/supabase'

interface TemplateLibraryProps {
  onSelectTemplate: (template: QuestionTemplate) => void
  onClose?: () => void
  preferredType?: QuestionType
  preferredCategory?: string
  className?: string
}

export function TemplateLibrary({
  onSelectTemplate,
  onClose,
  preferredType,
  preferredCategory,
  className = ''
}: TemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>(preferredCategory || 'all')
  const [selectedType, setSelectedType] = useState<QuestionType | 'all'>(preferredType || 'all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Filter templates based on current selections
  const filteredTemplates = useMemo(() => {
    let templates = QUESTION_TEMPLATES

    // Apply search filter
    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery)
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      templates = templates.filter(t => t.category === selectedCategory)
    }

    // Apply type filter
    if (selectedType !== 'all') {
      templates = templates.filter(t => t.questionType === selectedType)
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'all') {
      templates = templates.filter(t => t.difficulty === selectedDifficulty)
    }

    return templates
  }, [searchQuery, selectedCategory, selectedType, selectedDifficulty])

  const handleSelectTemplate = (template: QuestionTemplate) => {
    trackFormEvent('template_selected', {
      templateId: template.id,
      templateType: template.questionType,
      templateCategory: template.category
    })
    onSelectTemplate(template)
  }

  if (!FEATURE_FLAGS.QUESTION_TEMPLATES) {
    return null
  }

  return (
    <div className={`bg-white ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Question Templates</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
              {/* Category Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => (
                    <option key={key} value={key}>{category.label}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Question Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as QuestionType | 'all')}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All Types</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="single_choice">Single Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="fill_blank">Fill in the Blank</option>
                  <option value="essay">Essay</option>
                  <option value="matching">Matching</option>
                  <option value="ordering">Ordering</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as 'easy' | 'medium' | 'hard' | 'all')}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Template Grid */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No templates found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onClick={() => handleSelectTemplate(template)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{filteredTemplates.length} templates available</span>
          <div className="flex items-center gap-4">
            <span>Total: {QUESTION_TEMPLATES.length}</span>
            <span>Categories: {Object.keys(TEMPLATE_CATEGORIES).length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface TemplateCardProps {
  template: QuestionTemplate
  onClick: () => void
}

function TemplateCard({ template, onClick }: TemplateCardProps) {
  const categoryInfo = TEMPLATE_CATEGORIES[template.category]
  
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    hard: 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <Card
      variant="interactive"
      className="cursor-pointer hover:shadow-md transition-all duration-200 group"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
            {template.name}
          </CardTitle>
          <Plus className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
        </div>
        <p className="text-xs text-gray-600 line-clamp-2">{template.description}</p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-2 mb-3">
          <QuestionTypeIndicator 
            questionType={template.questionType} 
            size="sm"
          />
          <span className={`px-1.5 py-0.5 rounded text-xs border ${difficultyColors[template.difficulty]}`}>
            {template.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{Math.ceil(template.estimatedTime / 60)}min</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span>{template.template.points || 1} pts</span>
          </div>
          <div className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            <span className={`text-${categoryInfo.color}-600`}>
              {categoryInfo.label}
            </span>
          </div>
        </div>

        {template.template.tags && template.template.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {template.template.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {template.template.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{template.template.tags.length - 3}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Quick Template Selector for specific types
interface QuickTemplateSelectorProps {
  questionType: QuestionType
  onSelectTemplate: (template: QuestionTemplate) => void
  className?: string
}

export function QuickTemplateSelector({ 
  questionType, 
  onSelectTemplate, 
  className = '' 
}: QuickTemplateSelectorProps) {
  const templates = getTemplatesByType(questionType).slice(0, 3) // Show top 3

  if (!FEATURE_FLAGS.QUESTION_TEMPLATES || templates.length === 0) {
    return null
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Wand2 className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-900">Quick Templates</span>
      </div>
      <div className="space-y-2">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className="w-full text-left p-2 bg-white border border-blue-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="text-sm font-medium text-gray-900">{template.name}</div>
            <div className="text-xs text-gray-600">{template.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
