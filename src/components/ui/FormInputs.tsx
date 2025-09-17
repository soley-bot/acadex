/**
 * Shared Form Input Components
 * Standardized input fields for forms
 */

'use client'

import { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, InputHTMLAttributes } from 'react'
import { X, Plus, Upload, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

// Standard Text Input
interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function TextInput({ value, onChange, placeholder, className = "", ...props }: TextInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${className}`}
      {...props}
    />
  )
}

// Number Input
interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'onChange' | 'value' | 'type'> {
  value: number | null
  onChange: (value: number | null) => void
  placeholder?: string
  className?: string
}

export function NumberInput({ value, onChange, placeholder, className = "", ...props }: NumberInputProps) {
  return (
    <input
      type="number"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${className}`}
      {...props}
    />
  )
}

// Textarea Input
interface TextareaInputProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
}

export function TextareaInput({ value, onChange, placeholder, rows = 4, className = "", ...props }: TextareaInputProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical ${className}`}
      {...props}
    />
  )
}

// Select Input
interface SelectInputProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
  className?: string
}

export function SelectInput({ value, onChange, options, placeholder, className = "", ...props }: SelectInputProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 border border-border/40 rounded-lg 
        focus:ring-2 focus:ring-primary/30 focus:border-primary/60 
        bg-background text-foreground
        hover:border-border/60
        transition-colors duration-200
        appearance-none cursor-pointer
        ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: 'right 0.5rem center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '1.5em 1.5em',
        paddingRight: '2.5rem'
      }}
      {...props}
    >
      {placeholder && (
        <option value="" disabled className="text-muted-foreground">
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option 
          key={option.value} 
          value={option.value}
          className="bg-background text-foreground py-2"
        >
          {option.label}
        </option>
      ))}
    </select>
  )
}

// Checkbox Input
interface CheckboxInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'onChange' | 'checked' | 'type'> {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  className?: string
}

export function CheckboxInput({ checked, onChange, label, className = "", ...props }: CheckboxInputProps) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        {...props}
      />
      <span className="text-sm text-foreground">{label}</span>
    </label>
  )
}

// File Upload Input
interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  className?: string
  children?: ReactNode
}

export function FileUpload({ onFileSelect, accept = "image/*", className = "", children }: FileUploadProps) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      {children || (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Click to upload file</p>
        </div>
      )}
    </div>
  )
}

// Image Preview Component
interface ImagePreviewProps {
  src: string
  alt: string
  onRemove?: () => void
  className?: string
}

export function ImagePreview({ src, alt, onRemove, className = "" }: ImagePreviewProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      <div className="relative w-full h-32 rounded-lg border overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// Tag Input (for multiple values)
interface TagInputProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
  className?: string
}

export function TagInput({ tags, onTagsChange, placeholder = "Add tag...", className = "" }: TagInputProps) {
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const target = e.target as HTMLInputElement
      addTag(target.value)
      target.value = ''
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-primary/20 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        onKeyPress={handleKeyPress}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  )
}

// Rich Text Editor Placeholder (for future implementation)
interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className = "" }: RichTextEditorProps) {
  // For now, using textarea - can be enhanced with a rich text library later
  return (
    <TextareaInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={6}
      className={className}
    />
  )
}
