'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BlobBackground } from '@/components/ui/BlobBackground'
import { userAPI } from '@/lib/api'
const { updateProfile: updateUserProfile } = userAPI
import { useAuth } from '@/contexts/AuthContext'
import { H1, H2, H3, H4, BodyLG, BodyMD } from '@/components/ui/Typography'
import { Container, Section } from '@/components/ui/Layout'
import Icon from '@/components/ui/Icon'
import { logger } from '@/lib/logger'
import { ContextualBackButton } from '@/components/navigation/ContextualBackButton'

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
    if (!user) {
      router.push('/auth?tab=signin&redirect=/profile')
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
        // Profile is updated automatically by the updateProfile function
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
    <Section className="min-h-screen relative overflow-hidden" background="accent">
      <Container className="py-8 pt-28">
        
        {/* Contextual Back Navigation */}
        <div className="mb-6">
          <ContextualBackButton
            href="/dashboard"
            label="Back to Dashboard"
          />
        </div>

        {/* Header */}
        <Card variant="elevated" className="mb-12 text-center">
          <CardContent className="p-12">
            <div className="inline-block p-4 bg-primary rounded-2xl mb-6 text-white">
              <Icon name="user" size={32} color="current" />
            </div>
            <H1 className="text-foreground mb-4">Profile Settings</H1>
            <BodyLG className="text-muted-foreground">Manage your account information and preferences</BodyLG>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <form onSubmit={handleSubmit}>
            <CardContent className="p-8 space-y-8">
            {/* Basic Information */}
            <Card variant="default" className="bg-background/60 border-border">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <Icon name="edit" size={24} color="primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-foreground mb-3">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary backdrop-blur-sm bg-background/80 text-foreground font-medium transition-all duration-300 hover:shadow-lg"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-foreground mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-input rounded-xl backdrop-blur-sm bg-muted/40 text-muted-foreground font-medium cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-1">
                    <Icon name="mail" size={12} color="current" />
                    Email cannot be changed
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="bio" className="block text-sm font-bold text-foreground mb-3">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={profile.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us a bit about yourself..."
                  className="w-full px-4 py-3 border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary backdrop-blur-sm bg-background/80 text-foreground font-medium transition-all duration-300 hover:shadow-lg resize-none"
                />
              </div>
              </CardContent>
            </Card>

            {/* Learning Preferences */}
            <Card variant="default" className="bg-background/60 border-border">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <Icon name="target" size={24} color="primary" />
                  Learning Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
              
              <div className="mb-6">
                <label htmlFor="learning_goals" className="block text-sm font-bold text-foreground mb-3">
                  Learning Goals
                </label>
                <textarea
                  id="learning_goals"
                  name="learning_goals"
                  rows={3}
                  value={profile.learning_goals}
                  onChange={handleInputChange}
                  placeholder="What do you want to achieve with your learning?"
                  className="w-full px-4 py-3 border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary backdrop-blur-sm bg-background/80 text-foreground font-medium transition-all duration-300 hover:shadow-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-4">
                  Preferred Subjects
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableSubjects.map((subject) => (
                    <label
                      key={subject}
                      className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl backdrop-blur-sm bg-background/60 border border-border hover:bg-muted/80 hover:border-primary transition-all duration-300 hover:shadow-lg"
                    >
                      <input
                        type="checkbox"
                        checked={profile.preferred_subjects?.includes(subject) || false}
                        onChange={() => handleSubjectToggle(subject)}
                        className="w-5 h-5 rounded border-input text-primary focus:ring-primary focus:ring-2"
                      />
                      <span className="text-sm font-medium text-foreground">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
              </CardContent>
            </Card>

            {/* Profile Picture */}
            <Card variant="default" className="bg-background/60 border-border">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <Icon name="camera" size={24} color="primary" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent>
              <div className="flex items-center space-x-8">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-2xl border-4 border-white/50">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1">
                  <label htmlFor="avatar_url" className="block text-sm font-bold text-foreground mb-3">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    id="avatar_url"
                    name="avatar_url"
                    value={profile.avatar_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-3 border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary backdrop-blur-sm bg-background/80 text-foreground font-medium transition-all duration-300 hover:shadow-lg"
                  />
                  <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-1">
                    <Icon name="share" size={12} color="current" />
                    Enter a URL for your profile picture
                  </p>
                </div>
              </div>
              </CardContent>
            </Card>

            {/* Messages */}
            {message && (
              <Card variant="default" className="bg-success/10 border-success border-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Icon name="check-circle" size={24} color="success" />
                    <p className="text-success-foreground font-bold text-lg">{message}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <Card variant="default" className="bg-destructive/10 border-destructive border-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Icon name="x-circle" size={24} color="error" />
                    <p className="text-destructive-foreground font-bold text-lg">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-6 pt-8 border-t border-border">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-8 py-4 border-2 border-input rounded-2xl text-foreground hover:bg-muted hover:border-border transition-all duration-300 font-bold text-lg backdrop-blur-sm bg-background/60 shadow-lg hover:shadow-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-primary hover:bg-secondary text-white hover:text-black rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Icon name="save" size={20} color="current" />
                    Save Changes
                  </div>
                )}
              </button>
            </div>
            </CardContent>
          </form>
        </Card>
      </Container>
    </Section>
  )
}

