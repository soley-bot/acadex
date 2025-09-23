import React, { memo, useCallback, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  IconPhoto,
  IconUpload,
  IconX,
  IconCheck,
  IconAlertTriangle
} from '@tabler/icons-react'

interface CourseImageData {
  id?: string
  url?: string
  file?: File
  thumbnail_url?: string
  alt_text?: string
  upload_progress?: number
}

interface CourseImageStepProps {
  images: {
    featured_image?: CourseImageData
    thumbnail_image?: CourseImageData
    gallery_images?: CourseImageData[]
  }
  onChange: (images: CourseImageStepProps['images']) => void
  onUpload?: (file: File, type: 'featured' | 'thumbnail' | 'gallery') => Promise<string>
  maxFileSize?: number
  isUploading?: boolean
}

export const CourseImageStep = memo<CourseImageStepProps>(({
  images,
  onChange,
  onUpload,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  isUploading = false
}) => {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const handleFileChange = useCallback((
    file: File | null,
    type: 'featured' | 'thumbnail' | 'gallery'
  ) => {
    if (!file) return

    const newImage: CourseImageData = {
      file,
      url: URL.createObjectURL(file),
      alt_text: `${type} image for course`
    }

    if (onUpload) {
      onUpload(file, type).then(url => {
        if (type === 'gallery') {
          onChange({
            ...images,
            gallery_images: [...(images.gallery_images || []), { ...newImage, url }]
          })
        } else {
          onChange({
            ...images,
            [type === 'featured' ? 'featured_image' : 'thumbnail_image']: { ...newImage, url }
          })
        }
      })
    } else {
      if (type === 'gallery') {
        onChange({
          ...images,
          gallery_images: [...(images.gallery_images || []), newImage]
        })
      } else {
        onChange({
          ...images,
          [type === 'featured' ? 'featured_image' : 'thumbnail_image']: newImage
        })
      }
    }
  }, [images, onChange, onUpload])

  const removeImage = (type: 'featured' | 'thumbnail' | 'gallery', index?: number) => {
    if (type === 'gallery' && typeof index === 'number') {
      onChange({
        ...images,
        gallery_images: images.gallery_images?.filter((_, i) => i !== index)
      })
    } else {
      onChange({
        ...images,
        [type === 'featured' ? 'featured_image' : 'thumbnail_image']: undefined
      })
    }
  }

  const ImagePreview = ({ image, onRemove, title }: { 
    image: CourseImageData, 
    onRemove: () => void,
    title: string 
  }) => (
    <Card className="border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">{title}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <IconX size={16} />
          </Button>
        </div>
        <div className="relative">
          <img
            src={image.url || (image.file ? URL.createObjectURL(image.file) : undefined)}
            alt={image.alt_text}
            className="w-full h-30 object-cover rounded-md"
          />
          {image.upload_progress !== undefined && image.upload_progress < 100 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
              <Progress value={image.upload_progress} className="w-3/4" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const ImageUploadBox = ({ title, description, onFileSelect, disabled }: {
    title: string
    description: string
    onFileSelect: (file: File | null) => void
    disabled?: boolean
  }) => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null
      onFileSelect(file)
    }

    return (
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-3" style={{ minHeight: 120 }}>
            <IconPhoto size={40} className="text-gray-400" />
            <div>
              <h4 className="text-lg font-medium">{title}</h4>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            <Label htmlFor={`file-${title.replace(/\s+/g, '-').toLowerCase()}`} className="cursor-pointer">
              <Input
                id={`file-${title.replace(/\s+/g, '-').toLowerCase()}`}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={disabled}
                className="sr-only"
              />
              <Button type="button" disabled={disabled} className="pointer-events-none">
                <IconUpload size={16} className="mr-2" />
                Select Image
              </Button>
            </Label>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconPhoto size={20} className="text-blue-600" />
          Course Images
        </CardTitle>
        <p className="text-sm text-gray-600">
          Add high-quality images to make your course more attractive to students.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-8">{/* Featured Image */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium">Featured Image</h4>
              <p className="text-sm text-gray-600">Main course image (recommended: 1200x675px)</p>
            </div>
            <Badge variant="destructive">Required</Badge>
          </div>

          {images.featured_image ? (
            <ImagePreview
              image={images.featured_image}
              onRemove={() => removeImage('featured')}
              title="Featured Image"
            />
          ) : (
            <ImageUploadBox
              title="Upload Featured Image"
              description="Main course image (max 5MB)"
              onFileSelect={(file) => handleFileChange(file, 'featured')}
              disabled={isUploading}
            />
          )}
        </div>

        {/* Thumbnail Image */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium">Thumbnail Image</h4>
              <p className="text-sm text-gray-600">Square image for course cards (recommended: 400x400px)</p>
            </div>
            <Badge variant="secondary">Optional</Badge>
          </div>

          {images.thumbnail_image ? (
            <ImagePreview
              image={images.thumbnail_image}
              onRemove={() => removeImage('thumbnail')}
              title="Thumbnail Image"
            />
          ) : (
            <ImageUploadBox
              title="Upload Thumbnail"
              description="Square format recommended (max 5MB)"
              onFileSelect={(file) => handleFileChange(file, 'thumbnail')}
              disabled={isUploading}
            />
          )}
        </div>

        {/* Gallery Images */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium">Gallery Images</h4>
              <p className="text-sm text-gray-600">Additional images to showcase course content</p>
            </div>
            <Badge variant="secondary">
              {images.gallery_images?.length || 0}/6 images
            </Badge>
          </div>

          {images.gallery_images && images.gallery_images.length > 0 && (
            <div className="space-y-4 mb-4">
              {images.gallery_images.map((image, index) => (
                <ImagePreview
                  key={index}
                  image={image}
                  onRemove={() => removeImage('gallery', index)}
                  title={`Gallery Image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {(!images.gallery_images || images.gallery_images.length < 6) && (
            <ImageUploadBox
              title="Add Gallery Images"
              description="Additional showcase images (max 6 total)"
              onFileSelect={(file) => handleFileChange(file, 'gallery')}
              disabled={isUploading}
            />
          )}
        </div>

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <Card className="border border-gray-200 bg-gray-50">
            <CardContent className="space-y-2">
              <h4 className="text-sm font-medium">Uploading Images...</h4>
              {Object.entries(uploadProgress).map(([id, progress]) => (
                <div key={id}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs">{id.replace('-', ' ').toUpperCase()}</p>
                    <p className="text-xs">{progress}%</p>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Guidelines */}
        <Alert>
          <IconAlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="text-sm font-medium">Image Guidelines:</p>
              <ul className="text-sm space-y-1 ml-0 pl-5">
                <li>Use high-quality, professional images</li>
                <li>Featured image should be 1200x675px for best results</li>
                <li>Thumbnail should be square (400x400px recommended)</li>
                <li>Maximum file size: 5MB per image</li>
                <li>Supported formats: JPG, PNG, WebP</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
})

CourseImageStep.displayName = 'CourseImageStep'