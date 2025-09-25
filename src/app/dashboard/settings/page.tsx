'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StudentSidebar } from '@/components/student/StudentSidebar'
import { supabase } from '@/lib/supabase'
import { 
  User, 
  Bell, 
  Shield, 
  Globe,
  Palette,
  Volume2,
  Moon,
  Sun,
  Check
} from 'lucide-react'

interface UserSettings {
  notifications: {
    courseReminders: boolean
    quizDeadlines: boolean
    progressUpdates: boolean
    emailDigest: boolean
  }
  preferences: {
    language: string
    timezone: string
    theme: 'light' | 'dark' | 'system'
    autoplay: boolean
    soundEffects: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private'
    progressSharing: boolean
    analyticsOptOut: boolean
  }
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      courseReminders: true,
      quizDeadlines: true,
      progressUpdates: false,
      emailDigest: true
    },
    preferences: {
      language: 'en',
      timezone: 'UTC',
      theme: 'light',
      autoplay: false,
      soundEffects: true
    },
    privacy: {
      profileVisibility: 'private',
      progressSharing: false,
      analyticsOptOut: false
    }
  })

  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        
        // Fetch user profile data from Supabase
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, full_name, bio, location, timezone, notification_preferences, privacy_settings, appearance_settings')
          .eq('id', user.id)
          .single()

        if (userError) {
          // Error fetching user data - using default settings
        } else if (userData) {
          // Update settings with real data, using defaults if data is missing
          setSettings(prev => ({
            notifications: {
              courseReminders: userData.notification_preferences?.courseReminders ?? prev.notifications.courseReminders,
              quizDeadlines: userData.notification_preferences?.quizDeadlines ?? prev.notifications.quizDeadlines,
              progressUpdates: userData.notification_preferences?.progressUpdates ?? prev.notifications.progressUpdates,
              emailDigest: userData.notification_preferences?.emailDigest ?? prev.notifications.emailDigest
            },
            preferences: {
              language: userData.appearance_settings?.language ?? prev.preferences.language,
              timezone: userData.timezone ?? prev.preferences.timezone,
              theme: userData.appearance_settings?.theme ?? prev.preferences.theme,
              autoplay: userData.appearance_settings?.autoplay ?? prev.preferences.autoplay,
              soundEffects: userData.appearance_settings?.soundEffects ?? prev.preferences.soundEffects
            },
            privacy: {
              profileVisibility: userData.privacy_settings?.profileVisibility ?? prev.privacy.profileVisibility,
              progressSharing: userData.privacy_settings?.progressSharing ?? prev.privacy.progressSharing,
              analyticsOptOut: userData.privacy_settings?.analyticsOptOut ?? prev.privacy.analyticsOptOut
            }
          }))
        }
      } catch (error) {
        // Error fetching user settings - using defaults
      } finally {
        setLoading(false)
      }
    }

    fetchUserSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const updateNotificationSetting = (key: keyof UserSettings['notifications']) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }))
  }

  const updatePreferenceSetting = (key: keyof UserSettings['preferences'], value: any) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }))
  }

  const updatePrivacySetting = (key: keyof UserSettings['privacy'], value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }))
  }

  const saveSettings = async () => {
    if (!user?.id) return

    try {
      // Update user settings in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          notification_preferences: settings.notifications,
          privacy_settings: settings.privacy,
          appearance_settings: {
            language: settings.preferences.language,
            theme: settings.preferences.theme,
            autoplay: settings.preferences.autoplay,
            soundEffects: settings.preferences.soundEffects
          },
          timezone: settings.preferences.timezone
        })
        .eq('id', user.id)

      if (error) {
        // Error saving settings - could add toast notification
      } else {
        // Settings saved successfully - could add toast notification
      }
    } catch (error) {
      // Error saving settings - could add toast notification
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <StudentSidebar />
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-64 bg-sidebar" onClick={e => e.stopPropagation()}>
              <StudentSidebar onMobileClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex-1 lg:ml-64">
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <StudentSidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-sidebar" onClick={e => e.stopPropagation()}>
            <StudentSidebar onMobileClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">Settings</h1>
          <div className="w-10"></div>
        </div>

        <div className="p-4 md:p-6 max-w-4xl">
          {/* Header */}
                    {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Customize your learning experience</p>
          </div>

          <div className="space-y-6 md:space-y-8">
            {/* Notifications */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Course Reminders</h4>
                    <p className="text-sm text-gray-600">Get reminded to continue your courses</p>
                  </div>
                  <button
                    onClick={() => updateNotificationSetting('courseReminders')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors self-start sm:self-auto ${
                      settings.notifications.courseReminders ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.courseReminders ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Quiz Deadlines</h4>
                    <p className="text-sm text-gray-600">Be notified about upcoming quiz deadlines</p>
                  </div>
                  <button
                    onClick={() => updateNotificationSetting('quizDeadlines')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors self-start sm:self-auto ${
                      settings.notifications.quizDeadlines ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.quizDeadlines ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Progress Updates</h4>
                    <p className="text-sm text-gray-600">Weekly progress summary emails</p>
                  </div>
                  <button
                    onClick={() => updateNotificationSetting('progressUpdates')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors self-start sm:self-auto ${
                      settings.notifications.progressUpdates ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.progressUpdates ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Digest</h4>
                    <p className="text-sm text-gray-600">Monthly learning digest and new course updates</p>
                  </div>
                  <button
                    onClick={() => updateNotificationSetting('emailDigest')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors self-start sm:self-auto ${
                      settings.notifications.emailDigest ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.emailDigest ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Language</h4>
                    <p className="text-sm text-gray-600">Choose your preferred language</p>
                  </div>
                  <select
                    value={settings.preferences.language}
                    onChange={(e) => updatePreferenceSetting('language', e.target.value)}
                    className="border-2 border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Theme</h4>
                    <p className="text-sm text-gray-600">Choose your display theme</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updatePreferenceSetting('theme', 'light')}
                      className={`p-2 rounded-md ${
                        settings.preferences.theme === 'light' 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Sun className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => updatePreferenceSetting('theme', 'dark')}
                      className={`p-2 rounded-md ${
                        settings.preferences.theme === 'dark' 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Moon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Video Autoplay</h4>
                    <p className="text-sm text-gray-600">Automatically play lesson videos</p>
                  </div>
                  <button
                    onClick={() => updatePreferenceSetting('autoplay', !settings.preferences.autoplay)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.preferences.autoplay ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.preferences.autoplay ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Sound Effects</h4>
                    <p className="text-sm text-gray-600">Play sounds for quiz answers and achievements</p>
                  </div>
                  <button
                    onClick={() => updatePreferenceSetting('soundEffects', !settings.preferences.soundEffects)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.preferences.soundEffects ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.preferences.soundEffects ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Profile Visibility</h4>
                    <p className="text-sm text-gray-600">Control who can see your profile</p>
                  </div>
                  <select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => updatePrivacySetting('profileVisibility', e.target.value as 'public' | 'private')}
                    className="border-2 border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Progress Sharing</h4>
                    <p className="text-sm text-gray-600">Allow sharing your progress with instructors</p>
                  </div>
                  <button
                    onClick={() => updatePrivacySetting('progressSharing', !settings.privacy.progressSharing)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.privacy.progressSharing ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.privacy.progressSharing ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Analytics Opt-out</h4>
                    <p className="text-sm text-gray-600">Disable anonymous usage analytics</p>
                  </div>
                  <button
                    onClick={() => updatePrivacySetting('analyticsOptOut', !settings.privacy.analyticsOptOut)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.privacy.analyticsOptOut ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.privacy.analyticsOptOut ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <Button onClick={saveSettings} variant="secondary" size="lg" className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

