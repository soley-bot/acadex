import * as React from "react"
import { Input } from "./input"
import { Textarea } from "./textarea"

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className = "", label, error, ...props }, ref) => (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <Input ref={ref} className={className} {...props} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
)

interface TextareaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const TextareaInput = React.forwardRef<HTMLTextAreaElement, TextareaInputProps>(
  ({ className = "", label, error, ...props }, ref) => (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <Textarea ref={ref} className={className} {...props} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
)

TextInput.displayName = "TextInput"
TextareaInput.displayName = "TextareaInput"

export { TextInput, TextareaInput }
