'use client'

import { useState } from 'react'
import SvgIconPreview from '@/components/ui/SvgIconPreview'
import SvgIcon from '@/components/ui/SvgIcon'

export default function IconPreviewPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">SVG Icon Library</h1>
          <p className="text-gray-300">Professional SVG icons for Acadex platform</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <SvgIcon 
              icon="search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2" 
            />
            <input
              type="text"
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Context Examples */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Usage Examples</h2>
          
          {/* Navigation Example */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Navigation Menu</h3>
            <div className="flex space-x-4 bg-white p-4 rounded border">
              <button className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 transition-colors">
                <SvgIcon icon="home" size={20} />
                <span>Dashboard</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 transition-colors">
                <SvgIcon icon="book" size={20} />
                <span>Courses</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 transition-colors">
                <SvgIcon icon="user" size={20} />
                <span>Profile</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 transition-colors">
                <SvgIcon icon="settings" size={20} />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Action Buttons</h3>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors">
                <SvgIcon icon="plus" size={16} variant="white" />
                <span>Create Course</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                <SvgIcon icon="ban" size={16} variant="white" />
                <span>Delete</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                <SvgIcon icon="eye" size={16} />
                <span>Preview</span>
              </button>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Status & Info</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-green-600">
                <SvgIcon icon="check" size={16} variant="default" />
                <span className="text-sm">Course completed successfully</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-600">
                <SvgIcon icon="info" size={16} variant="default" />
                <span className="text-sm">Additional information available</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <SvgIcon icon="clock" size={16} variant="default" />
                <span className="text-sm">Duration: 2 hours 30 minutes</span>
              </div>
            </div>
          </div>

          {/* Different Sizes */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Icon Sizes</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <SvgIcon icon="home" size={12} />
                <span className="text-xs">12px</span>
              </div>
              <div className="flex items-center space-x-2">
                <SvgIcon icon="home" size={16} />
                <span className="text-sm">16px</span>
              </div>
              <div className="flex items-center space-x-2">
                <SvgIcon icon="home" size={20} />
                <span>20px</span>
              </div>
              <div className="flex items-center space-x-2">
                <SvgIcon icon="home" size={24} />
                <span className="text-lg">24px</span>
              </div>
              <div className="flex items-center space-x-2">
                <SvgIcon icon="home" size={32} />
                <span className="text-xl">32px</span>
              </div>
            </div>
          </div>
        </div>

        {/* Icon Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Available Icons</h2>
          <SvgIconPreview searchTerm={searchTerm} />
        </div>

        {/* Implementation Guide */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Implementation Guide</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">Using the SvgIcon Component:</h3>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`<SvgIcon icon="home" size={20} variant="default" />
<SvgIcon icon="user" size={24} variant="red" />
<SvgIcon icon="settings" size={16} variant="white" />`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">Available Props:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li><code>icon</code>: Icon key from the SVG library</li>
                <li><code>size</code>: Icon size in pixels (default: 20)</li>
                <li><code>variant</code>: &lsquo;default&rsquo; | &lsquo;white&rsquo; | &lsquo;red&rsquo; (default: &lsquo;default&rsquo;)</li>
                <li><code>className</code>: Additional CSS classes</li>
                <li><code>alt</code>: Alternative text for accessibility</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
