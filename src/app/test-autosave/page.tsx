'use client'

import { useState } from 'react'
import { useAutoSave } from '@/hooks/useAutoSave'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AutoSaveTestPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: ''
  })

  const [saveStatus, setSaveStatus] = useState<string>('')

  const { saveNow } = useAutoSave({
    data: formData,
    onSave: async (data) => {
      // Simulate API call
      setSaveStatus('Saving...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaveStatus(`Auto-saved at ${new Date().toLocaleTimeString()}`)
      console.log('Auto-saved data:', data)
    },
    delay: 2000,
    enabled: true
  })

  return (
    <div className="p-8">
      <Card variant="glass" className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Auto-Save Test</CardTitle>
          <p className="text-muted-foreground">Test the auto-save functionality - changes will auto-save after 2 seconds</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-muted rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Enter title..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-muted rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Enter description..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full p-3 border border-muted rounded-lg focus:ring-2 focus:ring-primary h-32"
              placeholder="Enter content..."
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {saveStatus && (
                <span className="text-success">{saveStatus}</span>
              )}
            </div>
            <button
              onClick={saveNow}
              className="bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 rounded-lg transition-colors"
            >
              Save Now
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
