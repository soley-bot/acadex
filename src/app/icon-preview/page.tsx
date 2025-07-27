'use client'

import React from 'react'
import Image from 'next/image'
import IconPreview from '@/components/ui/IconPreview'

const RECOMMENDED_ICONS = {
  // Core Navigation
  home: {
    src: '/Icons8/icons8-home-100.png',
    name: 'Home/Dashboard',
    recommended: 'EXCELLENT - Simple house outline'
  },
  user: {
    src: '/Icons8/icons8-user-100.png', 
    name: 'User Profile',
    recommended: 'EXCELLENT - Clean person silhouette'
  },
  courses: {
    src: '/Icons8/icons8-bookmark-100.png',
    name: 'Courses/Learning',
    recommended: 'GOOD - Using bookmark as course indicator'
  },
  
  // Essential Actions
  search: {
    src: '/Icons8/icons8-search-100.png',
    name: 'Search',
    recommended: 'EXCELLENT - Simple magnifying glass'
  },
  settings: {
    src: '/Icons8/icons8-settings-100.png',
    name: 'Settings/Admin',
    recommended: 'EXCELLENT - Clean gear design'
  },
  
  // Content & Media
  clock: {
    src: '/Icons8/icons8-clock-100.png',
    name: 'Time/Duration',
    recommended: 'GOOD - Clean circular design'
  },
  
  // Additional Available Icons
  document: {
    src: '/Icons8/icons8-document-100.png',
    name: 'Documents/Files',
    recommended: 'GOOD - Clean document icon'
  },
  briefcase: {
    src: '/Icons8/icons8-briefcase-100.png',
    name: 'Business/Work',
    recommended: 'GOOD - Professional briefcase'
  }
} as const

export default function IconPreviewPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Icons8 PNG Collection Preview
          </h1>
          <p className="text-gray-600">
            Recommended icons for your clean, minimal black and white design
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {Object.entries(RECOMMENDED_ICONS).map(([key, icon]) => (
            <div key={key} className="relative">
              <IconPreview
                src={icon.src}
                name={icon.name}
                size={32}
                className="hover:opacity-100 transition-opacity"
              />
              <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                <span className="text-green-700 font-medium">RECOMMENDED</span>
                <p className="text-green-600 mt-1">{icon.recommended}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Size Variations Test
          </h2>
          <div className="flex items-center space-x-8 p-6 bg-white rounded-lg border">
            <IconPreview src="/Icons8/icons8-home-100.png" name="16px" size={16} />
            <IconPreview src="/Icons8/icons8-home-100.png" name="20px" size={20} />
            <IconPreview src="/Icons8/icons8-home-100.png" name="24px" size={24} />
            <IconPreview src="/Icons8/icons8-home-100.png" name="32px" size={32} />
            <IconPreview src="/Icons8/icons8-home-100.png" name="48px" size={48} />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Context Examples
          </h2>
          
          <div className="space-y-6">
            {/* Navigation Example */}
            <div className="p-6 bg-white rounded-lg border">
              <h3 className="font-semibold mb-4">Navigation Bar Context</h3>
              <nav className="flex space-x-6">
                <button className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 transition-colors">
                  <Image src="/Icons8/icons8-home-100.png" alt="Home" width={20} height={20} style={{ filter: 'brightness(0) saturate(100%)', opacity: 0.8 }} />
                  <span>Dashboard</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 transition-colors">
                  <Image src="/Icons8/icons8-bookmark-100.png" alt="Courses" width={20} height={20} style={{ filter: 'brightness(0) saturate(100%)', opacity: 0.8 }} />
                  <span>Courses</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 transition-colors">
                  <Image src="/Icons8/icons8-user-100.png" alt="Profile" width={20} height={20} style={{ filter: 'brightness(0) saturate(100%)', opacity: 0.8 }} />
                  <span>Profile</span>
                </button>
              </nav>
            </div>

            {/* Search Example */}
            <div className="p-6 bg-white rounded-lg border">
              <h3 className="font-semibold mb-4">Search Input Context</h3>
              <div className="relative max-w-md">
                <Image 
                  src="/Icons8/icons8-search-100.png" 
                  alt="Search" 
                  width={20} 
                  height={20} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  style={{ filter: 'brightness(0) saturate(100%)', opacity: 0.4 }}
                />
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Action Buttons Example */}
            <div className="p-6 bg-white rounded-lg border">
              <h3 className="font-semibold mb-4">Action Buttons Context</h3>
              <div className="flex space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                  <Image src="/Icons8/icons8-play-100.png" alt="Play" width={18} height={18} style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
                  <span>Start Course</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Image src="/Icons8/icons8-settings-100.png" alt="Settings" width={18} height={18} style={{ filter: 'brightness(0) saturate(100%)', opacity: 0.8 }} />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
