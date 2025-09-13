'use client'

import { TemplateLibrary } from '@/components/admin/TemplateLibrary'
import { TemplateEditor } from '@/components/admin/TemplateEditor'
import { useState } from 'react'
import type { QuestionTemplate } from '@/types/templates'

export default function TemplateTestPage() {
  const [showEditor, setShowEditor] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<QuestionTemplate | null>(null)

  const handleCreateNew = () => {
    setSelectedTemplate(null)
    setShowEditor(true)
  }

  const handleSelectTemplate = (template: QuestionTemplate) => {
    console.log('Template selected:', template)
    // Here we would integrate with question creation
  }

  const handleSaveTemplate = (template: QuestionTemplate) => {
    console.log('Template saved:', template)
    setShowEditor(false)
  }

  const handleCancelEditor = () => {
    setShowEditor(false)
    setSelectedTemplate(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Template System Test</h1>
        <p className="text-muted-foreground">
          This page demonstrates the complete question template system with library browsing and template creation.
        </p>
      </div>

      {!showEditor ? (
        <TemplateLibrary
          onSelectTemplate={handleSelectTemplate}
          onCreateNew={handleCreateNew}
          showCreateButton={true}
          compactView={false}
        />
      ) : (
        <TemplateEditor
          template={selectedTemplate}
          onSave={handleSaveTemplate}
          onCancel={handleCancelEditor}
          isOpen={true}
        />
      )}
    </div>
  )
}