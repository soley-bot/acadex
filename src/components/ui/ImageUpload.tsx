'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  onFileUpload?: (file: File) => Promise<string>
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function ImageUpload({
  value,
  onChange,
  onFileUpload,
  disabled = false,
  className = '',
  placeholder = 'Upload an image or enter URL'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [urlInput, setUrlInput] = useState(value || '')
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update urlInput when value prop changes to keep it in sync
  useEffect(() => {
    setUrlInput(value || '')
  }, [value])

  const handleFileSelect = useCallback(async (file: File) => {
    if (!onFileUpload) return

    try {
      setUploading(true)
      const url = await onFileUpload(file)
      onChange(url)
      setUrlInput(url)
    } catch (error) {
      console.error('Error uploading file:', error)
      // You could add toast notification here
    } finally {
      setUploading(false)
    }
  }, [onFileUpload, onChange])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const handleUrlSubmit = useCallback(() => {
    onChange(urlInput || null)
  }, [urlInput, onChange])

  const handleRemove = useCallback(() => {
    onChange(null)
    setUrlInput('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onChange])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mode Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setInputMode('upload')}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            inputMode === 'upload'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setInputMode('url')}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            inputMode === 'url'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Enter URL
        </button>
      </div>

      {inputMode === 'upload' ? (
        /* File Upload Mode */
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || uploading}
            className="hidden"
            value="" // Always keep file input uncontrolled by setting empty value
          />
          
          <div
            onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
            `}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
                <p className="text-gray-600">Uploading image...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-600 mb-1">
                  Drop an image here or click to browse
                </p>
                <p className="text-sm text-gray-400">
                  Supports JPG, PNG, WebP (max 5MB)
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* URL Input Mode */
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput || ''} // Ensure always controlled
            onChange={(e) => setUrlInput(e.target.value)}
            onBlur={handleUrlSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            disabled={disabled}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2 truncate">{value}</p>
        </div>
      )}

      {/* Fallback when no image */}
      {!value && (
        <div className="flex items-center justify-center w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No image selected</p>
          </div>
        </div>
      )}
    </div>
  )
}
