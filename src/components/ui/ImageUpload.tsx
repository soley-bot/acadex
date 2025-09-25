import * as React from "react"
import { Input } from "./input"

interface ImageUploadProps {
  value?: string | null
  onChange?: (url: string | null) => void
  onFileUpload?: (file: File) => Promise<string | null>
  onImageSelect?: (file: File) => void
  context?: string
  placeholder?: string
  preview?: string
  className?: string
}

const ImageUpload = React.forwardRef<HTMLInputElement, ImageUploadProps>(
  ({ 
    className = "", 
    onImageSelect, 
    onChange,
    onFileUpload,
    value,
    context,
    placeholder = "Enter image URL or upload file",
    preview, 
    ...props 
  }, ref) => {
    const [urlValue, setUrlValue] = React.useState(value || "")

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        if (onImageSelect) {
          onImageSelect(file)
        }
        if (onFileUpload) {
          try {
            const url = await onFileUpload(file)
            if (onChange) {
              onChange(url)
            }
          } catch (error) {
            console.error('File upload failed:', error)
          }
        }
      }
    }

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value
      setUrlValue(url)
      if (onChange) {
        onChange(url || null)
      }
    }

    React.useEffect(() => {
      setUrlValue(value || "")
    }, [value])

    return (
      <div className={`space-y-4 ${className}`}>
        <div className="space-y-2">
          <Input
            type="url"
            placeholder={placeholder}
            value={urlValue}
            onChange={handleUrlChange}
            ref={ref}
            {...props}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        {(preview || urlValue) && (
          <div className="mt-2">
            <img src={preview || urlValue} alt="Preview" className="max-w-xs rounded-md" />
          </div>
        )}
      </div>
    )
  }
)

ImageUpload.displayName = "ImageUpload"

export { ImageUpload }
