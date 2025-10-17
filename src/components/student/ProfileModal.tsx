'use client'

import { useState, useEffect } from 'react'
import { X, User, Mail, Camera, Target, Save } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { userAPI } from '@/lib/api'
import { logger } from '@/lib/logger'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const { updateProfile: updateUserProfile } = userAPI

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

interface UserProfile {
  name: string
  email: string
  bio?: string
  avatar_url?: string
  learning_goals?: string
  preferred_subjects?: string[]
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

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateProfile } = useAuth()
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
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        bio: '',
        avatar_url: user.avatar_url || '',
        learning_goals: '',
        preferred_subjects: []
      })
    }
  }, [user])

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
        setTimeout(() => {
          setMessage('')
          onClose()
        }, 1500)
      }
    } catch (err: any) {
      logger.error('Error updating profile', { error: err?.message || 'Unknown error' })
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary/10 to-secondary/10 px-8 py-6 border-b border-gray-200 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Profile Picture Section */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Camera className="w-5 h-5 text-primary" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {profile.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt={profile.name}
                          width={96}
                          height={96}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        profile.name ? profile.name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 mb-2">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      id="avatar_url"
                      name="avatar_url"
                      value={profile.avatar_url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profile.email}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        disabled
                      />
                      <Mail className="absolute right-4 top-3.5 w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={profile.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us a bit about yourself..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Learning Preferences */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-primary" />
                  Learning Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-6">
                <div>
                  <label htmlFor="learning_goals" className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Goals
                  </label>
                  <textarea
                    id="learning_goals"
                    name="learning_goals"
                    rows={3}
                    value={profile.learning_goals}
                    onChange={handleInputChange}
                    placeholder="What do you want to achieve with your learning?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred Subjects
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableSubjects.map((subject) => (
                      <label
                        key={subject}
                        className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 hover:border-primary transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={profile.preferred_subjects?.includes(subject) || false}
                          onChange={() => handleSubjectToggle(subject)}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-4 flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <p className="text-green-800 font-medium">{message}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-6 py-4 flex items-center gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-6 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
