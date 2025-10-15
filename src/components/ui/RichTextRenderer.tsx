import * as React from "react"

interface RichTextRendererProps {
  content: string
  className?: string
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({ 
  content, 
  className = "" 
}) => {
  // Basic sanitization while preserving safe HTML tags
  const sanitizeHtml = (input: string): string => {
    // Allow specific safe HTML tags
    const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'a', 'span', 'div', 'code', 'pre']
    
    // If content contains allowed HTML tags, preserve them
    const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(input)
    
    if (hasHtmlTags) {
      // Simple tag validation - remove script and dangerous tags
      let cleaned = input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove inline event handlers
        .replace(/javascript:/gi, '')
      
      return cleaned
    }
    
    // Otherwise, treat as plain text and process markdown-like syntax
    return input
  }

  // Process content
  let processedContent = sanitizeHtml(content)
  
  // If no HTML tags, convert markdown-like syntax
  if (!/<\/?[a-z][\s\S]*>/i.test(content)) {
    processedContent = processedContent
      .replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>')    // ### heading
      .replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>')     // ## heading
      .replace(/# (.*?)(\n|$)/g, '<h1>$1</h1>')      // # heading
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
      .replace(/\*(.*?)\*/g, '<em>$1</em>')          // *italic*
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>') // `code`
      .replace(/\n\n/g, '</p><p>')                   // paragraphs
      .replace(/\n/g, '<br />')                      // line breaks
    
    // Wrap in paragraph if not already wrapped
    if (!processedContent.startsWith('<')) {
      processedContent = `<p>${processedContent}</p>`
    }
  }

  return (
    <div 
      className={`prose prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-foreground prose-p:leading-relaxed prose-li:text-foreground prose-strong:text-foreground prose-strong:font-semibold ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}

export { RichTextRenderer }
