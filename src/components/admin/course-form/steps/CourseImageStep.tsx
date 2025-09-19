import React, { memo, useCallback, useState } from 'react'
import {
  Card,
  Stack,
  Group,
  Title,
  Text,
  Button,
  FileInput,
  Image,
  Alert,
  Progress,
  ActionIcon,
  Badge,
  Center,
  Box
} from '@mantine/core'
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
    <Card withBorder>
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Text size="sm" fw={500}>{title}</Text>
          <ActionIcon color="red" variant="subtle" onClick={onRemove}>
            <IconX size={16} />
          </ActionIcon>
        </Group>
        <Image
          src={image.url || (image.file ? URL.createObjectURL(image.file) : undefined)}
          alt={image.alt_text}
          height={120}
          fit="cover"
          radius="sm"
        />
        {image.upload_progress !== undefined && image.upload_progress < 100 && (
          <Progress value={image.upload_progress} size="xs" animated />
        )}
      </Stack>
    </Card>
  )

  const ImageUploadBox = ({ title, description, onFileSelect, disabled }: {
    title: string
    description: string
    onFileSelect: (file: File | null) => void
    disabled?: boolean
  }) => (
    <Card withBorder padding="md">
      <Stack align="center" gap="md" style={{ minHeight: 120 }}>
        <IconPhoto size={40} color="var(--mantine-color-dimmed)" />
        <div style={{ textAlign: 'center' }}>
          <Text size="lg" fw={500}>{title}</Text>
          <Text size="sm" c="dimmed">{description}</Text>
        </div>
        <FileInput
          placeholder="Select image file"
          accept="image/*"
          onChange={onFileSelect}
          disabled={disabled || isUploading}
          leftSection={<IconUpload size={16} />}
        />
      </Stack>
    </Card>
  )

  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder>
      <Stack gap="lg">
        {/* Header */}
        <Group gap="xs">
          <IconPhoto size={20} color="var(--mantine-color-blue-6)" />
          <Title order={3}>Course Images</Title>
        </Group>

        <Text size="sm" c="dimmed">
          Add high-quality images to make your course more attractive to students.
        </Text>

        {/* Featured Image */}
        <div>
          <Group justify="space-between" mb="sm">
            <div>
              <Text fw={500}>Featured Image</Text>
              <Text size="sm" c="dimmed">Main course image (recommended: 1200x675px)</Text>
            </div>
            <Badge variant="light" color="red">Required</Badge>
          </Group>

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
          <Group justify="space-between" mb="sm">
            <div>
              <Text fw={500}>Thumbnail Image</Text>
              <Text size="sm" c="dimmed">Square image for course cards (recommended: 400x400px)</Text>
            </div>
            <Badge variant="light">Optional</Badge>
          </Group>

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
          <Group justify="space-between" mb="sm">
            <div>
              <Text fw={500}>Gallery Images</Text>
              <Text size="sm" c="dimmed">Additional images to showcase course content</Text>
            </div>
            <Badge variant="light">
              {images.gallery_images?.length || 0}/6 images
            </Badge>
          </Group>

          {images.gallery_images && images.gallery_images.length > 0 && (
            <Stack gap="sm" mb="md">
              {images.gallery_images.map((image, index) => (
                <ImagePreview
                  key={index}
                  image={image}
                  onRemove={() => removeImage('gallery', index)}
                  title={`Gallery Image ${index + 1}`}
                />
              ))}
            </Stack>
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
          <Card withBorder variant="light">
            <Stack gap="xs">
              <Text size="sm" fw={500}>Uploading Images...</Text>
              {Object.entries(uploadProgress).map(([id, progress]) => (
                <div key={id}>
                  <Group justify="space-between" mb={4}>
                    <Text size="xs">{id.replace('-', ' ').toUpperCase()}</Text>
                    <Text size="xs">{progress}%</Text>
                  </Group>
                  <Progress value={progress} size="sm" animated />
                </div>
              ))}
            </Stack>
          </Card>
        )}

        {/* Guidelines */}
        <Alert icon={<IconAlertTriangle size={16} />} variant="light">
          <Stack gap="xs">
            <Text size="sm" fw={500}>Image Guidelines:</Text>
            <Text size="sm" component="ul" style={{ margin: 0, paddingLeft: 20 }}>
              <li>Use high-quality, professional images</li>
              <li>Featured image should be 1200x675px for best results</li>
              <li>Thumbnail should be square (400x400px recommended)</li>
              <li>Maximum file size: 5MB per image</li>
              <li>Supported formats: JPG, PNG, WebP</li>
            </Text>
          </Stack>
        </Alert>
      </Stack>
    </Card>
  )
})

CourseImageStep.displayName = 'CourseImageStep'