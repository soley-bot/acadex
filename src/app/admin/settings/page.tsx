'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Settings, 
  Globe, 
  Shield, 
  Mail, 
  Bell, 
  Database, 
  Users, 
  Key,
  Save,
  Upload,
  Download
} from 'lucide-react'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    site: {
      name: 'Acadex Learning Platform',
      description: 'Modern platform for quiz practice and online course enrollment',
      logo: '',
      favicon: '',
      timezone: 'UTC',
      language: 'en'
    },
    email: {
      smtp_host: '',
      smtp_port: '587',
      smtp_username: '',
      smtp_password: '',
      from_email: 'noreply@acadex.com',
      from_name: 'Acadex'
    },
    notifications: {
      new_user_registration: true,
      course_enrollment: true,
      quiz_completion: true,
      system_updates: true,
      security_alerts: true
    },
    security: {
      require_email_verification: true,
      password_min_length: 8,
      session_timeout: 24,
      two_factor_auth: false,
      login_attempts: 5
    },
    database: {
      backup_frequency: 'daily',
      retention_days: 30,
      auto_backup: true
    }
  })

  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    // In real app, make API call to save settings
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'database', label: 'Database', icon: Database }
  ]

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage platform configuration and preferences</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-black px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-bold shadow-md hover:shadow-lg"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-bold text-yellow-800">Development Mode</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Settings changes are currently not persisted. This is a UI preview only. Backend integration required for production use.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card variant="elevated" size="sm" className="shadow-md">
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-bold text-left hover:bg-gray-50 ${
                      activeTab === tab.id
                        ? 'bg-primary/5 text-red-700 border-r-2 border-primary'
                        : 'text-black'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Site Information</CardTitle>
                  <CardDescription>Basic information about your platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.site.name}
                      onChange={(e) => setSettings({
                        ...settings,
                        site: { ...settings.site, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Description
                    </label>
                    <textarea
                      value={settings.site.description}
                      onChange={(e) => setSettings({
                        ...settings,
                        site: { ...settings.site, description: e.target.value }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-600"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.site.timezone}
                        onChange={(e) => setSettings({
                          ...settings,
                          site: { ...settings.site, timezone: e.target.value }
                        })}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Language
                      </label>
                      <select
                        value={settings.site.language}
                        onChange={(e) => setSettings({
                          ...settings,
                          site: { ...settings.site, language: e.target.value }
                        })}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Branding</CardTitle>
                  <CardDescription>Upload your logo and customize the appearance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Click to upload logo or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'email' && (
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>Configure SMTP settings for sending emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtp_host}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtp_host: e.target.value }
                      })}
                      placeholder="smtp.gmail.com"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtp_port}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtp_port: e.target.value }
                      })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtp_username}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtp_username: e.target.value }
                      })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={settings.email.smtp_password}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtp_password: e.target.value }
                      })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={settings.email.from_email}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, from_email: e.target.value }
                      })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={settings.email.from_name}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, from_name: e.target.value }
                      })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Choose which notifications to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <label htmlFor={key} className="text-sm font-medium text-gray-900">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, [key]: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted/60 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure security and authentication settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Require Email Verification
                    </label>
                    <p className="text-xs text-gray-500">Users must verify their email before accessing the platform</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.require_email_verification}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, require_email_verification: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted/60 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Minimum Password Length
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="50"
                    value={settings.security.password_min_length}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, password_min_length: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Session Timeout (hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={settings.security.session_timeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, session_timeout: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={settings.security.login_attempts}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, login_attempts: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-600"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'database' && (
            <Card>
              <CardHeader>
                <CardTitle>Database Settings</CardTitle>
                <CardDescription>Configure database backup and maintenance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    value={settings.database.backup_frequency}
                    onChange={(e) => setSettings({
                      ...settings,
                      database: { ...settings.database, backup_frequency: e.target.value }
                    })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Retention Period (days)
                  </label>
                  <input
                    type="number"
                    min="7"
                    max="365"
                    value={settings.database.retention_days}
                    onChange={(e) => setSettings({
                      ...settings,
                      database: { ...settings.database, retention_days: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Auto Backup
                    </label>
                    <p className="text-xs text-gray-500">Automatically backup database on schedule</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.database.auto_backup}
                      onChange={(e) => setSettings({
                        ...settings,
                        database: { ...settings.database, auto_backup: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted/60 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex gap-3">
                    <button className="bg-primary text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                      <Download className="h-4 w-4" />
                      Create Backup Now
                    </button>
                    <button className="bg-muted/40 hover:bg-muted/60 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                      <Upload className="h-4 w-4" />
                      Restore Backup
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}

