'use client'

// Secure HTML sanitization to prevent XSS attacks
const sanitizeHTML = (html: string): string => {
  // Remove potentially dangerous tags and attributes
  const dangerousTags = /<(script|iframe|object|embed|form|input|textarea|button|link|meta|base)[^>]*>.*?<\/\1>|<(script|iframe|object|embed|form|input|textarea|button|link|meta|base)[^>]*\/?>|<[^>]*on\w+=[^>]*>/gi
  const sanitized = html.replace(dangerousTags, '')
  
  // Remove javascript: and data: protocols
  return sanitized.replace(/(href|src|action)=["']?(javascript:|data:|vbscript:)[^"']*["']?/gi, '')
}

interface RichTextRendererProps {
  content: string
  className?: string
}

export function RichTextRenderer({ content, className = "" }: RichTextRendererProps) {
  const formatRichText = (text: string): string => {
    // Input validation and sanitization
    if (!text || typeof text !== 'string') {
      return ''
    }
    
    // Limit content length to prevent DoS
    const safeText = text.substring(0, 10000)
    
    let formatted = safeText
    
    // Bold text: **text** → <strong>text</strong>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    
    // Italic text: *text* → <em>text</em>
    formatted = formatted.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em class="italic">$1</em>')
    
    // Highlighted text: ==text== → <mark>text</mark>
    formatted = formatted.replace(/==(.*?)==/g, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded font-medium">$1</mark>')
    
    // Colored text: {{color:text}} → <span class="text-color-600">text</span>
    formatted = formatted.replace(/\{\{red:(.*?)\}\}/g, '<span class="text-primary font-semibold">$1</span>')
    formatted = formatted.replace(/\{\{blue:(.*?)\}\}/g, '<span class="text-secondary font-semibold">$1</span>')
    formatted = formatted.replace(/\{\{green:(.*?)\}\}/g, '<span class="text-green-600 font-semibold">$1</span>')
    formatted = formatted.replace(/\{\{orange:(.*?)\}\}/g, '<span class="text-orange-600 font-semibold">$1</span>')
    formatted = formatted.replace(/\{\{purple:(.*?)\}\}/g, '<span class="text-purple-600 font-semibold">$1</span>')
    formatted = formatted.replace(/\{\{yellow:(.*?)\}\}/g, '<span class="text-yellow-600 font-semibold">$1</span>')
    
    // Headers: ## text → <h2>text</h2>
    formatted = formatted.replace(/^## (.*$)/gim, '<h2 class="text-xl lg:text-2xl font-bold text-gray-900 mt-6 mb-4 border-b border-gray-200 pb-2">$1</h2>')
    formatted = formatted.replace(/^### (.*$)/gim, '<h3 class="text-lg lg:text-xl font-bold text-gray-900 mt-5 mb-3">$1</h3>')
    formatted = formatted.replace(/^#### (.*$)/gim, '<h4 class="text-base lg:text-lg font-bold text-gray-900 mt-4 mb-2">$1</h4>')
    
    // Lists: - item → <ul><li>item</li></ul>
    // First, handle numbered lists: 1. item → <ol><li>item</li></ol>
    formatted = formatted.replace(/^(\d+)\. (.*)$/gm, '<li class="mb-1">$2</li>')
    formatted = formatted.replace(/(<li class="mb-1">.*<\/li>(?:\s*<li class="mb-1">.*<\/li>)*)/g, '<ol class="list-decimal list-inside space-y-1 my-4 ml-4">$1</ol>')
    
    // Then handle bullet lists
    formatted = formatted.replace(/^- (.*)$/gm, '<li class="mb-1">$1</li>')
    formatted = formatted.replace(/(<li class="mb-1">.*<\/li>(?:\s*<li class="mb-1">.*<\/li>)*)/g, (match) => {
      // Only convert to ul if it's not already inside ol
      if (match.includes('list-decimal')) return match
      return `<ul class="list-disc list-inside space-y-1 my-4 ml-4">${match}</ul>`
    })
    
    // Convert line breaks to proper HTML, but preserve existing HTML structure
    formatted = formatted.replace(/\n/g, '<br>')
    
    // Clean up excessive breaks around block elements
    formatted = formatted.replace(/<br>\s*<(h[1-6]|ul|ol|div)/g, '<$1')
    formatted = formatted.replace(/<\/(h[1-6]|ul|ol|div)>\s*<br>/g, '</$1>')
    
    // Apply security sanitization before returning
    return sanitizeHTML(formatted)
  }

  return (
    <div
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: formatRichText(content) }}
    />
  )
}
