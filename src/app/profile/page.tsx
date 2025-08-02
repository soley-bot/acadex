'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserProfile } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'

interface UserProfile {
  name: string
  email: string
  bio?: string
  avatar_url?: string
  learning_goals?: string
  preferred_subjects?: string[]
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    bio: '',
    avatar_url: '',
    learning_goals: '',
    preferred_subjects: []
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Initialize profile with user data
    setProfile({
      name: user.name || '',
      email: user.email || '',
      bio: '',
      avatar_url: user.avatar_url || '',
      learning_goals: '',
      preferred_subjects: []
    })
  }, [user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubjectToggle = (subject: string) => {
    setProfile(prev => ({
      ...prev,
      preferred_subjects: prev.preferred_subjects?.includes(subject)
        ? prev.preferred_subjects.filter(s => s !== subject)
        : [...(prev.preferred_subjects || []), subject]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error: updateError } = await updateUserProfile(user!.id, profile)
      
      if (updateError) {
        setError('Failed to update profile')
        logger.error('Error updating profile:', updateError)
      } else {
        setMessage('Profile updated successfully!')
        // Update the user context with new data
        if (updateUser) {
          updateUser({
            ...user!,
            ...profile
          })
        }
      }
    } catch (err) {
      logger.error('Error updating profile:', err)
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const availableSubjects = [
    'Grammar',
    'Vocabulary',
    'Pronunciation',
    'Speaking',
    'Writing',
    'Literature',
    'Business English',
    'Test Preparation',
    'Conversation',
    'Academic Writing'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative max-w-4xl mx-auto px-6 py-8 pt-28">
        {/* Header */}
        <div className="mb-12 text-center p-12 rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl">
          <div className="inline-block p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl mb-6">
            <span className="text-white text-4xl">👤</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">Profile Settings</h1>
          <p className="text-gray-700 text-xl font-medium">Manage your account information and preferences</p>
        </div>

        <div className="rounded-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl overflow-hidden">

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information */}
            <div className="p-8 rounded-2xl backdrop-blur-sm bg-gradient-to-r from-white/60 to-gray-50/60 border border-white/30 shadow-lg">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                <span className="text-3xl">📝</span>
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-800 mb-3">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 backdrop-blur-sm bg-white/80 text-gray-800 font-medium transition-all duration-300 hover:shadow-lg"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-800 mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl backdrop-blur-sm bg-gray-100/80 text-gray-600 font-medium cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-600 mt-2 font-medium">📧 Email cannot be changed</p>
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="bio" className="block text-sm font-bold text-gray-800 mb-3">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={profile.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us a bit about yourself..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 backdrop-blur-sm bg-white/80 text-gray-800 font-medium transition-all duration-300 hover:shadow-lg resize-none"
                />
              </div>
            </div>

            {/* Learning Preferences */}
            <div className="p-8 rounded-2xl backdrop-blur-sm bg-gradient-to-r from-white/60 to-gray-50/60 border border-white/30 shadow-lg">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                Learning Preferences
              </h2>
              
              <div className="mb-6">
                <label htmlFor="learning_goals" className="block text-sm font-bold text-gray-800 mb-3">
                  Learning Goals
                </label>
                <textarea
                  id="learning_goals"
                  name="learning_goals"
                  rows={3}
                  value={profile.learning_goals}
                  onChange={handleInputChange}
                  placeholder="What do you want to achieve with your learning?"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 backdrop-blur-sm bg-white/80 text-gray-800 font-medium transition-all duration-300 hover:shadow-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-4">
                  Preferred Subjects
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableSubjects.map((subject) => (
                    <label
                      key={subject}
                      className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl backdrop-blur-sm bg-white/60 border border-white/30 hover:bg-white/80 hover:border-red-300 transition-all duration-300 hover:shadow-lg"
                    >
                      <input
                        type="checkbox"
                        checked={profile.preferred_subjects?.includes(subject) || false}
                        onChange={() => handleSubjectToggle(subject)}
                        className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-800">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Picture */}
            <div className="p-8 rounded-2xl backdrop-blur-sm bg-gradient-to-r from-white/60 to-gray-50/60 border border-white/30 shadow-lg">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                <span className="text-3xl">🖼️</span>
                Profile Picture
              </h2>
              <div className="flex items-center space-x-8">
                <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-2xl border-4 border-white/50">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1">
                  <label htmlFor="avatar_url" className="block text-sm font-bold text-gray-800 mb-3">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    id="avatar_url"
                    name="avatar_url"
                    value={profile.avatar_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 backdrop-blur-sm bg-white/80 text-gray-800 font-medium transition-all duration-300 hover:shadow-lg"
                  />
                  <p className="text-xs text-gray-600 mt-2 font-medium flex items-center gap-1">
                    <span>🔗</span>
                    Enter a URL for your profile picture
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            {message && (
              <div className="p-6 rounded-2xl backdrop-blur-sm bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-2 border-green-300 shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <p className="text-green-800 font-bold text-lg">{message}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-6 rounded-2xl backdrop-blur-sm bg-gradient-to-r from-red-50/80 to-pink-50/80 border-2 border-red-300 shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">❌</span>
                  <p className="text-red-800 font-bold text-lg">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-6 pt-8 border-t border-white/30">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-8 py-4 border-2 border-gray-400 rounded-2xl text-gray-800 hover:bg-white hover:border-gray-500 transition-all duration-300 font-bold text-lg backdrop-blur-sm bg-white/60 shadow-lg hover:shadow-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </div>
                ) : (
                  '💾 Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
