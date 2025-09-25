import * as React from "react"

interface RichTextRendererProps {
  content: string
  className?: string
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({ 
  content, 
  className = "" 
}) => {
  // Simple rich text renderer - in a real app, you'd use a proper markdown/rich text library
  const processedContent = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold**
    .replace(/\*(.*?)\*/g, '<em>$1</em>')              // *italic*
    .replace(/\n/g, '<br />')                          // line breaks

  return (
    <div 
      className={`prose prose-gray max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}

export { RichTextRenderer }