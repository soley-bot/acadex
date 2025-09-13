import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  QuestionTemplate,
  TemplateFilters,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  BulkTemplateRequest,
  TemplatesResponse,
  PaginatedTemplatesResponse
} from '@/types/templates'

const BASE_URL = '/api/templates'

// Query Keys
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (filters: TemplateFilters, page: number, limit: number) => [...templateKeys.lists(), filters, page, limit] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
}

// Fetch templates with filtering and pagination
export function useTemplates(filters: TemplateFilters = {}, page = 1, limit = 20) {
  return useQuery({
    queryKey: templateKeys.list(filters, page, limit),
    queryFn: async (): Promise<PaginatedTemplatesResponse> => {
      const params = new URLSearchParams()
      
      if (filters.category) params.append('category', filters.category)
      if (filters.question_type) params.append('question_type', filters.question_type)
      if (filters.difficulty_level) params.append('difficulty_level', filters.difficulty_level)
      if (filters.language) params.append('language', filters.language)
      if (filters.subject_area) params.append('subject_area', filters.subject_area)
      if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','))
      if (filters.is_featured !== undefined) params.append('featured', filters.is_featured.toString())
      if (filters.is_public !== undefined) params.append('public', filters.is_public.toString())
      if (filters.search_query) params.append('search', filters.search_query)
      
      params.append('page', page.toString())
      params.append('limit', limit.toString())

      const response = await fetch(`${BASE_URL}?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.statusText}`)
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Fetch single template
export function useTemplate(templateId: string | null) {
  return useQuery({
    queryKey: templateKeys.detail(templateId || ''),
    queryFn: async (): Promise<TemplatesResponse> => {
      if (!templateId) throw new Error('Template ID is required')
      
      const response = await fetch(`${BASE_URL}/${templateId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.statusText}`)
      }
      
      return response.json()
    },
    enabled: !!templateId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Create template mutation
export function useCreateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTemplateRequest): Promise<TemplatesResponse> => {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create template')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Invalidate and refetch templates list
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
      
      // Add the new template to the cache
      queryClient.setQueryData(templateKeys.detail(data.data.id), data)
    },
  })
}

// Update template mutation
export function useUpdateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      templateId, 
      data 
    }: { 
      templateId: string
      data: UpdateTemplateRequest 
    }): Promise<TemplatesResponse> => {
      const response = await fetch(`${BASE_URL}/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update template')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // Update the specific template in cache
      queryClient.setQueryData(templateKeys.detail(variables.templateId), data)
      
      // Invalidate templates list to reflect changes
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
    },
  })
}

// Delete template mutation
export function useDeleteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (templateId: string): Promise<{ success: boolean; message: string }> => {
      const response = await fetch(`${BASE_URL}/${templateId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete template')
      }

      return response.json()
    },
    onSuccess: (_, templateId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: templateKeys.detail(templateId) })
      
      // Invalidate templates list
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
    },
  })
}

// Use template mutation (record usage and get template data)
export function useUseTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      templateId, 
      actionType = 'use',
      context = {}
    }: { 
      templateId: string
      actionType?: string
      context?: Record<string, any>
    }): Promise<any> => {
      const response = await fetch(`${BASE_URL}/${templateId}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action_type: actionType,
          context
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to use template')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalidate template to refresh usage stats
      queryClient.invalidateQueries({ 
        queryKey: templateKeys.detail(variables.templateId) 
      })
      
      // Invalidate templates list to update usage counts
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
    },
  })
}

// Bulk template operations mutation
export function useBulkTemplateOperations() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: BulkTemplateRequest): Promise<any> => {
      const response = await fetch(`${BASE_URL}/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to perform bulk operation')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalidate all template queries since bulk operations affect multiple templates
      queryClient.invalidateQueries({ queryKey: templateKeys.all })
      
      // Remove specific templates from cache if they were deleted
      if (variables.action === 'delete') {
        variables.template_ids.forEach(templateId => {
          queryClient.removeQueries({ queryKey: templateKeys.detail(templateId) })
        })
      }
    },
  })
}

// Featured templates - optimized query for homepage/dashboard
export function useFeaturedTemplates(limit = 6) {
  return useQuery({
    queryKey: [...templateKeys.lists(), 'featured', limit],
    queryFn: async (): Promise<PaginatedTemplatesResponse> => {
      const params = new URLSearchParams({
        featured: 'true',
        public: 'true',
        limit: limit.toString(),
        page: '1'
      })

      const response = await fetch(`${BASE_URL}?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch featured templates: ${response.statusText}`)
      }
      
      return response.json()
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for featured content
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

// Template categories - for filter dropdowns
export function useTemplateCategories() {
  return useQuery({
    queryKey: [...templateKeys.all, 'categories'],
    queryFn: async (): Promise<string[]> => {
      // This would ideally come from a dedicated endpoint or be cached
      // For now, we'll derive it from a templates query
      const response = await fetch(`${BASE_URL}?limit=1000`)
      if (!response.ok) {
        throw new Error('Failed to fetch template categories')
      }
      
      const data: PaginatedTemplatesResponse = await response.json()
      const categories = [...new Set(data.data.map(t => t.category))].sort()
      
      return categories
    },
    staleTime: 30 * 60 * 1000, // 30 minutes for categories
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}