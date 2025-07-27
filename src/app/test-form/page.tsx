'use client'

import { useState } from 'react'

export default function TestFormPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [clickCount, setClickCount] = useState(0)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 TEST FORM SUBMITTED')
    console.log('Title:', title)
    console.log('Description:', description)
    alert('Form submitted! Check console.')
  }

  const handleButtonClick = () => {
    console.log('🎯 BUTTON CLICKED')
    console.log('Current values:', { title, description })
    setClickCount(prev => prev + 1)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Form Test Page</h1>
      
      {/* Simple click test */}
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Click Test</h2>
        <button
          onClick={() => {
            console.log('✨ Simple button clicked!')
            alert('Simple button works!')
          }}
          className="bg-green-600 text-white px-4 py-2 rounded mr-4"
        >
          Test Simple Click
        </button>
        <span>Clicks: {clickCount}</span>
        <button
          onClick={handleButtonClick}
          className="bg-purple-600 text-white px-4 py-2 rounded ml-4"
        >
          Test State Update
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              console.log('📝 Title changing:', e.target.value)
              setTitle(e.target.value)
            }}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              console.log('📝 Description changing:', e.target.value)
              setDescription(e.target.value)
            }}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter description"
          />
        </div>
        
        <button
          type="submit"
          onClick={handleButtonClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Submit Test
        </button>
      </form>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Current title: &ldquo;{title}&rdquo;</p>
        <p>Current description: &ldquo;{description}&rdquo;</p>
        <p>Button clicks: {clickCount}</p>
      </div>
    </div>
  )
}
