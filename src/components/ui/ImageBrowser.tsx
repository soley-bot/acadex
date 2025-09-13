'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Grid, 
  List, 
  Search, 
  Filter, 
  Check, 
  ExternalLink,
  Folder,
  Image as ImageIcon
} from 'lucide-react'
import Image from 'next/image'
import { getOptimizedImageUrl } from '@/lib/storage'

interface ImageBrowserProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
  selectedUrl?: string | null
}

interface ImageItem {
  id: string
  name: string
  url: string
  bucket?: string
  folder?: string
  size?: number
  lastModified?: string
  type: 'public' | 'storage'
}

// Pre-defined public images from the imageMapping
const PUBLIC_IMAGES: ImageItem[] = [
  {
    id: 'english-grammar',
    name: 'English Grammar',
    url: '/images/courses/english-grammar.jpg',
    type: 'public',
    folder: 'courses'
  },
  {
    id: 'conversation-practice',
    name: 'Conversation Practice',
    url: '/images/courses/conversation-practice.jpg',
    type: 'public',
    folder: 'courses'
  },
  {
    id: 'business-english',
    name: 'Business English',
    url: '/images/courses/business-english.jpg',
    type: 'public',
    folder: 'courses'
  },
  {
    id: 'ielts-preparation',
    name: 'IELTS Preparation',
    url: '/images/courses/ielts-preparation.jpg',
    type: 'public',
    folder: 'courses'
  },
  {
    id: 'academic-writing',
    name: 'Academic Writing',
    url: '/images/courses/academic-writing.jpg',
    type: 'public',
    folder: 'courses'
  },
  {
    id: 'vocabulary-building',
    name: 'Vocabulary Building',
    url: '/images/courses/vocabulary-building.jpg',
    type: 'public',
    folder: 'courses'
  },
  {
    id: 'learning-together',
    name: 'Learning Together',
    url: '/images/hero/learning-together.jpg',
    type: 'public',
    folder: 'hero'
  },
  {
    id: 'online-learning',
    name: 'Online Learning',
    url: '/images/hero/online-learning.jpg',
    type: 'public',
    folder: 'hero'
  },
  {
    id: 'graduation-success',
    name: 'Graduation Success',
    url: '/images/hero/graduation-success.jpg',
    type: 'public',
    folder: 'hero'
  }
]

export function ImageBrowser({ isOpen, onClose, onSelect, selectedUrl }: ImageBrowserProps) {
  const [images, setImages] = useState<ImageItem[]>(PUBLIC_IMAGES)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'public' | 'storage'>('all')
  const [selectedBucket, setSelectedBucket] = useState<'all' | 'course-images' | 'quiz-images' | 'user-avatars'>('all')

  // Load images from storage buckets
  const loadStorageImages = useCallback(async () => {
    setLoading(true)
    try {
      let storageImages: ImageItem[] = []
      
      const buckets = selectedBucket === 'all' 
        ? ['course-images', 'quiz-images', 'user-avatars']
        : [selectedBucket]
      
      for (const bucket of buckets) {
        const { data: files, error } = await supabase.storage
          .from(bucket)
          .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
        
        if (files && !error) {
          const bucketImages = files
            .filter((file: any) => file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/))
            .map((file: any) => ({
              id: `${bucket}-${file.name}`,
              name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
              url: supabase.storage.from(bucket).getPublicUrl(file.name).data.publicUrl,
              bucket,
              size: file.metadata?.size,
              lastModified: file.created_at,
              type: 'storage' as const
            }))
          
          storageImages.push(...bucketImages)
        }
      }
      
      // Combine public images with storage images
      setImages([...PUBLIC_IMAGES, ...storageImages])
      
    } catch (error) {
      console.error('Error loading storage images:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedBucket])

  // Load images from storage buckets
  useEffect(() => {
    if (isOpen) {
      loadStorageImages()
    }
  }, [isOpen, selectedBucket, loadStorageImages])

  // Filter images based on search and filters
  const filteredImages = images.filter(image => {
    const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.folder?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTypeFilter = selectedFilter === 'all' || image.type === selectedFilter
    
    const matchesBucketFilter = selectedBucket === 'all' || 
                               image.bucket === selectedBucket ||
                               (selectedBucket === 'course-images' && image.folder === 'courses') ||
                               (selectedBucket === 'quiz-images' && image.folder === 'hero')
    
    return matchesSearch && matchesTypeFilter && matchesBucketFilter
  })

  const handleSelect = (image: ImageItem) => {
    onSelect(image.url)
    onClose()
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const kb = bytes / 1024
    if (kb < 1024) return `${Math.round(kb)}KB`
    return `${Math.round(kb / 1024 * 10) / 10}MB`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Browse Images</h2>
            <p className="text-sm text-gray-600">Select an existing image to reuse</p>
          </div>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 p-4 border-b bg-gray-50">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* View Mode */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none border-l"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 p-4 border-b">
          <Filter className="h-4 w-4 text-gray-600" />
          
          {/* Type Filter */}
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Sources</option>
            <option value="public">Public Images</option>
            <option value="storage">Storage Images</option>
          </select>

          {/* Bucket Filter */}
          <select
            value={selectedBucket}
            onChange={(e) => setSelectedBucket(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Categories</option>
            <option value="course-images">Course Images</option>
            <option value="quiz-images">Quiz Images</option>
            <option value="user-avatars">User Avatars</option>
          </select>

          <span className="text-sm text-gray-600">
            {filteredImages.length} images found
          </span>
        </div>

        {/* Images Grid/List */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-gray-600">Loading images...</p>
              </div>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No images found</p>
                <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredImages.map((image) => (
                <Card 
                  key={image.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedUrl === image.url ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelect(image)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-square">
                      <Image
                        src={getOptimizedImageUrl(image.url, { width: 200, height: 200, quality: 80 })}
                        alt={image.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                      {selectedUrl === image.url && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge variant={image.type === 'public' ? 'default' : 'secondary'} className="text-xs">
                          {image.type === 'public' ? 'Public' : image.bucket?.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm text-gray-900 truncate">{image.name}</h4>
                      {image.size && (
                        <p className="text-xs text-gray-500">{formatFileSize(image.size)}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredImages.map((image) => (
                <Card 
                  key={image.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedUrl === image.url ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelect(image)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={getOptimizedImageUrl(image.url, { width: 64, height: 64, quality: 80 })}
                          alt={image.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 truncate">{image.name}</h4>
                          <Badge variant={image.type === 'public' ? 'default' : 'secondary'} className="text-xs">
                            {image.type === 'public' ? 'Public' : image.bucket?.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Folder className="h-3 w-3" />
                            {image.folder || image.bucket}
                          </span>
                          {image.size && (
                            <span>{formatFileSize(image.size)}</span>
                          )}
                          {image.lastModified && (
                            <span>{new Date(image.lastModified).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedUrl === image.url && (
                          <div className="bg-primary text-white rounded-full p-1">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}