import React, { useState, useCallback, useMemo } from 'react'
import { Search, Filter, Plus, Grid, List, Star, Globe, Lock, Tag, Clock, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useTemplates, useFeaturedTemplates, useUseTemplate } from '@/hooks/useTemplates'
import { useFeatureFlag } from '@/lib/featureFlags'
import { useToast } from '@/hooks/use-toast'
import type { TemplateFilters, QuestionTemplate } from '@/types/templates'

interface TemplateLibraryProps {
  onSelectTemplate?: (template: QuestionTemplate) => void
  onCreateNew?: () => void
  showCreateButton?: boolean
  compactView?: boolean
}

export function TemplateLibrary({
  onSelectTemplate,
  onCreateNew,
  showCreateButton = true,
  compactView = false
}: TemplateLibraryProps) {
  const { toast } = useToast()
  const templatesEnabled = useFeatureFlag('QUESTION_TEMPLATES')
  const useTemplateMutation = useUseTemplate()
  
  // State for filters and view
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<TemplateFilters>({
    is_public: true // Default to showing public templates
  })

  // Debounced search
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue])

  // Update filters with debounced search
  const activeFilters = useMemo(() => ({
    ...filters,
    search_query: debouncedSearch || undefined
  }), [filters, debouncedSearch])

  // Fetch templates
  const { 
    data: templatesData, 
    isLoading, 
    error 
  } = useTemplates(activeFilters, currentPage, compactView ? 10 : 20)

  // Fetch featured templates for hero section
  const { 
    data: featuredData, 
    isLoading: featuredLoading 
  } = useFeaturedTemplates(compactView ? 3 : 6)

  // Handle template selection/usage
  const handleUseTemplate = useCallback(async (template: QuestionTemplate) => {
    try {
      const result = await useTemplateMutation.mutateAsync({
        templateId: template.id,
        actionType: 'use',
        context: { source: 'template_library' }
      })

      if (onSelectTemplate) {
        onSelectTemplate(template)
      }

      toast({
        title: 'Template Applied',
        description: `"${template.title}" template is ready to use`,
      })
    } catch (error) {
      toast({
        title: 'Failed to Use Template',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      })
    }
  }, [useTemplateMutation, onSelectTemplate, toast])

  // Filter handlers
  const updateFilter = useCallback((key: keyof TemplateFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }))
    setCurrentPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({ is_public: true })
    setSearchValue('')
    setCurrentPage(1)
  }, [])

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Template card component
  const TemplateCard = React.memo(({ template }: { template: QuestionTemplate }) => (
    <Card 
      key={template.id}
      variant="interactive" 
      className="group transition-all duration-200 hover:shadow-lg"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
              {template.title}
            </h3>
            {template.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {template.is_featured && (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            )}
            {template.is_public ? (
              <Globe className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            {template.question_type.replace('_', ' ')}
          </Badge>
          {template.difficulty_level && (
            <Badge 
              variant="outline" 
              className={`text-xs ${getDifficultyColor(template.difficulty_level)}`}
            >
              {template.difficulty_level}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {template.category}
          </Badge>
        </div>

        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{template.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {template.usage_count} uses
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {new Date(template.created_at).toLocaleDateString()}
            </span>
          </div>
          <Button
            onClick={() => handleUseTemplate(template)}
            disabled={useTemplateMutation.isPending}
            className="bg-primary hover:bg-secondary text-white hover:text-black"
          >
            {useTemplateMutation.isPending ? 'Using...' : 'Use Template'}
          </Button>
        </div>
      </CardContent>
    </Card>
  ))

  TemplateCard.displayName = 'TemplateCard'

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
      {Array.from({ length: compactView ? 6 : 9 }).map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </Card>
      ))}
    </div>
  )

  if (!templatesEnabled) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Question Templates</h1>
          <p className="text-muted-foreground">
            Discover and use proven question patterns to create engaging assessments faster
          </p>
        </div>
        {showCreateButton && onCreateNew && (
          <Button onClick={onCreateNew} className="bg-primary hover:bg-secondary text-white hover:text-black">
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        )}
      </div>

      {/* Featured Templates Section */}
      {!compactView && featuredData?.data && featuredData.data.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Featured Templates</h2>
          </div>
          {featuredLoading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {featuredData.data.map((template: QuestionTemplate) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card variant="glass" className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={filters.category || 'all'}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full p-2 border border-input rounded-md text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="grammar">Grammar</option>
                  <option value="vocabulary">Vocabulary</option>
                  <option value="reading">Reading</option>
                  <option value="listening">Listening</option>
                  <option value="writing">Writing</option>
                  <option value="speaking">Speaking</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Question Type</label>
                <select
                  value={filters.question_type || 'all'}
                  onChange={(e) => updateFilter('question_type', e.target.value)}
                  className="w-full p-2 border border-input rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="fill_blank">Fill in the Blank</option>
                  <option value="true_false">True/False</option>
                  <option value="essay">Essay</option>
                  <option value="matching">Matching</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select
                  value={filters.difficulty_level || 'all'}
                  onChange={(e) => updateFilter('difficulty_level', e.target.value)}
                  className="w-full p-2 border border-input rounded-md text-sm"
                >
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Language</label>
                <select
                  value={filters.language || 'all'}
                  onChange={(e) => updateFilter('language', e.target.value)}
                  className="w-full p-2 border border-input rounded-md text-sm"
                >
                  <option value="all">All Languages</option>
                  <option value="english">English</option>
                  <option value="khmer">Khmer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <select
                  value={filters.subject_area || 'all'}
                  onChange={(e) => updateFilter('subject_area', e.target.value)}
                  className="w-full p-2 border border-input rounded-md text-sm"
                >
                  <option value="all">All Subjects</option>
                  <option value="ielts">IELTS</option>
                  <option value="toefl">TOEFL</option>
                  <option value="general_english">General English</option>
                  <option value="business_english">Business English</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Templates Grid/List */}
      <div>
        {error && (
          <Card variant="glass" className="p-6 text-center">
            <p className="text-muted-foreground">
              Failed to load templates. Please try again.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </Card>
        )}

        {isLoading && <LoadingSkeleton />}

        {templatesData?.data && templatesData.data.length > 0 && (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {templatesData.data.map((template: QuestionTemplate) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>

            {/* Pagination */}
            {templatesData.pagination && templatesData.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <span className="px-4 py-2 text-sm">
                  Page {currentPage} of {templatesData.pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(templatesData.pagination.totalPages, currentPage + 1))}
                  disabled={currentPage === templatesData.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {templatesData?.data && templatesData.data.length === 0 && (
          <Card variant="glass" className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
              <p className="text-muted-foreground mb-6">
                No templates match your current filters. Try adjusting your search criteria.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
                {showCreateButton && onCreateNew && (
                  <Button onClick={onCreateNew} className="bg-primary hover:bg-secondary text-white hover:text-black">
                    Create First Template
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default TemplateLibrary