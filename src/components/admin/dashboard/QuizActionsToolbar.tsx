/**
 * Quiz Actions Toolbar Component
 * Extracted from admin quizzes page to reduce complexity
 * Handles header, breadcrumb, and action buttons section
 * Converted to ShadCN UI components
 */

import React from 'react'
import Link from 'next/link'
import { 
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Home, 
  ChevronRight, 
  Plus, 
  Edit, 
  Settings, 
  BarChart3, 
  ChevronDown, 
  Download, 
  Upload,
  Loader2
} from 'lucide-react'

interface QuizStats {
  total: number
  published: number
}

interface QuizActionsToolbarProps {
  quizStats: QuizStats
  onShowCategoryManagement: () => void
  onShowAnalytics: () => void
  isLoading?: boolean
}

export const QuizActionsToolbar: React.FC<QuizActionsToolbarProps> = ({
  quizStats,
  onShowCategoryManagement,
  onShowAnalytics,
  isLoading = false
}) => {
  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="container mx-auto max-w-7xl">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Refreshing quizzes...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Breadcrumb Navigation */}
      <Card className="border-b rounded-none">
        <CardContent className="py-4">
          <div className="container mx-auto max-w-7xl">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/admin" className="hover:text-gray-900 transition-colors">
                Admin
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900 font-medium">Quiz Management</span>
            </nav>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Header Section */}
      <div className="container mx-auto max-w-7xl py-8">
        <Card className="shadow-lg border relative overflow-hidden hover:shadow-xl transition-all duration-300">
          {/* Subtle background decoration */}
          <div 
            className="absolute -top-24 -right-24 w-48 h-48 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.05) 0%, transparent 70%)',
            }}
          />
          
          <CardContent className="p-8 relative z-10">
            <div className="space-y-8">
              {/* Header Content */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg">
                    <Brain className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Quiz Management</h1>
                    <p className="text-lg text-gray-600">Create, edit, and manage interactive assessments for your students</p>
                  </div>
                </div>
                
                {/* Enhanced Quick Stats */}
                <div className="flex gap-4">
                  <Card className="bg-gray-50 hover:shadow-sm transition-shadow duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-medium">Total Quizzes:</span>
                        <span className="text-lg font-bold text-blue-600">{quizStats.total}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200 hover:shadow-sm transition-shadow duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-medium">Published:</span>
                        <span className="text-lg font-bold text-green-600">{quizStats.published}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Enhanced Action Buttons Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-gray-200">
                {/* Primary Actions */}
                <div className="flex flex-wrap gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        size="lg"
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Create New Quiz
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-72 shadow-xl">
                      <DropdownMenuItem asChild className="p-3 cursor-pointer">
                        <Link href="/admin/quizzes/create" className="flex items-start gap-3">
                          <Edit className="h-4 w-4 mt-1" />
                          <div>
                            <div className="font-medium">Create Manually</div>
                            <div className="text-xs text-gray-500">Build from scratch</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled className="p-3">
                        <Brain className="h-4 w-4 mr-3" />
                        <div>
                          <div className="font-medium">Create with AI</div>
                          <div className="text-xs text-gray-500">Coming soon</div>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button 
                    variant="outline"
                    size="lg"
                    onClick={onShowCategoryManagement}
                    className="border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600 hover:scale-105 transition-all duration-200 font-medium"
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    Manage Categories
                  </Button>
                </div>

                {/* Secondary Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="ghost"
                    size="lg"
                    onClick={onShowAnalytics}
                    className="text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Analytics
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost"
                        size="lg"
                        className="text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        More Actions
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 shadow-xl">
                      <DropdownMenuItem className="cursor-pointer">
                        <Download className="h-4 w-4 mr-2" />
                        Export Quizzes
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Quizzes
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        Quiz Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
