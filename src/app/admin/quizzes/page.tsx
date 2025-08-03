'use client'

import { logger } from '@/lib/logger'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Plus, Brain, Clock, Users, BarChart3, Edit, Trash2, Eye, ChevronDown, Settings, EyeOff, Check } from 'lucide-react'
import { supabase, Quiz } from '@/lib/supabase'
import { QuizForm } from '@/components/admin/QuizForm'
import { DeleteQuizModal } from '@/components/admin/DeleteQuizModal'
import { QuizViewModal } from '@/components/admin/QuizViewModal'
import { CategoryManagement } from '@/components/admin/CategoryManagement'

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  
  // Modal states
  const [showQuizForm, setShowQuizForm] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingQuiz, setDeletingQuiz] = useState<Quiz | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingQuiz, setViewingQuiz] = useState<Quiz | null>(null)
  const [showCategoryManagement, setShowCategoryManagement] = useState(false)

  // Refs for click outside
  const categoryDropdownRef = useRef<HTMLDivElement>(null)

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get attempt counts and average scores for each quiz
      const quizIds = data.map(quiz => quiz.id)
      
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('quiz_id, score, total_questions')
        .in('quiz_id', quizIds)

      if (attemptsError) {
        logger.error('Error fetching quiz attempts:', attemptsError)
      }

      setQuizzes(data || [])
    } catch (err) {
      logger.error('Error fetching quizzes:', err)
      setError('Failed to load quizzes. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuizzes()
  }, [fetchQuizzes])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter quizzes based on search and filters
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(quiz.category)
    const matchesDifficulty = selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  // Calculate statistics
  const quizStats = {
    total: quizzes.length,
    published: quizzes.filter(q => q.is_published).length,
    draft: quizzes.filter(q => !q.is_published).length,
    totalQuestions: quizzes.reduce((sum, q) => sum + (q.total_questions || 0), 0),
    averagePassingScore: quizzes.length > 0 
      ? Math.round(quizzes.reduce((sum, q) => sum + (q.passing_score || 70), 0) / quizzes.length)
      : 0
  }

  // Get unique categories and difficulties
  const categories = ['all', ...Array.from(new Set(quizzes.map(q => q.category)))]
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced']

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished 
      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
  }

  const handleCreateQuiz = () => {
    setEditingQuiz(null)
    setShowQuizForm(true)
  }

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz)
    setShowQuizForm(true)
  }

  const handleDeleteQuiz = (quiz: Quiz) => {
    setDeletingQuiz(quiz)
    setShowDeleteModal(true)
  }

  const handleViewQuiz = (quiz: Quiz) => {
    setViewingQuiz(quiz)
    setShowViewModal(true)
  }

  const handleTogglePublish = async (quiz: Quiz) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({ is_published: !quiz.is_published })
        .eq('id', quiz.id)

      if (error) throw error

      // Update local state
      setQuizzes(prevQuizzes => 
        prevQuizzes.map(q => 
          q.id === quiz.id 
            ? { ...q, is_published: !q.is_published }
            : q
        )
      )
    } catch (err: any) {
      logger.error('Error toggling quiz publish status:', err)
      setError('Failed to update quiz status. Please try again.')
    }
  }

  const handleFormSuccess = () => {
    fetchQuizzes()
    setShowQuizForm(false)
    setEditingQuiz(null)
  }

  const handleDeleteSuccess = () => {
    fetchQuizzes()
    setShowDeleteModal(false)
    setDeletingQuiz(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Loading quizzes...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-md mx-auto">
          <p className="text-red-600 mb-4 font-bold">{error}</p>
          <button 
            onClick={fetchQuizzes}
            className="text-red-600 hover:text-red-700 underline font-bold bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Enhanced Header Section */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-2">Quiz Management</h1>
              <p className="text-gray-600 text-lg">Create, edit, and manage interactive assessments for your students</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={handleCreateQuiz}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                <span>Create New Quiz</span>
              </button>
              <button
                onClick={() => setShowCategoryManagement(true)}
                className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 sm:px-6 sm:py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 font-semibold hover:shadow-md"
              >
                <Settings size={20} />
                <span>Categories</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-600 mb-2">Total Quizzes</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{quizStats.total}</p>
                <p className="text-sm text-blue-600 font-medium">All Assessments</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl ml-4 flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-600 mb-2">Published</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{quizStats.published}</p>
                <p className="text-sm text-emerald-600 font-medium">Active & Live</p>
              </div>
              <div className="bg-emerald-100 p-4 rounded-xl ml-4 flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                <Eye className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200 touch-target">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-600 mb-2">Drafts</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{quizStats.draft}</p>
                <p className="text-sm text-orange-600 font-medium">In Progress</p>
              </div>
              <div className="bg-orange-100 p-4 rounded-xl ml-4 flex-shrink-0 group-hover:bg-orange-200 transition-colors">
                <Edit className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group sm:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-600 mb-2">Total Questions</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{quizStats.totalQuestions}</p>
                <p className="text-sm text-purple-600 font-medium">Assessment Items</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-xl ml-4 flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group sm:col-span-2 xl:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-600 mb-2">Avg Passing Score</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{quizStats.averagePassingScore}%</p>
                <p className="text-sm text-indigo-600 font-medium">Success Rate</p>
              </div>
              <div className="bg-indigo-100 p-4 rounded-xl ml-4 flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search quizzes by title or category..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-base font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <div className="relative" ref={categoryDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-base font-medium min-w-48 flex items-center justify-between"
                >
                  <span>
                    {selectedCategories.length === 0 
                      ? 'All Categories' 
                      : selectedCategories.length === 1 && selectedCategories[0]
                      ? selectedCategories[0].charAt(0).toUpperCase() + selectedCategories[0].slice(1)
                      : `${selectedCategories.length} Categories`
                    }
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                      <button
                        onClick={() => setSelectedCategories([])}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => {
                          setShowCategoryDropdown(false)
                          setShowCategoryManagement(true)
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1"
                      >
                        <Settings size={14} />
                        Manage
                      </button>
                    </div>
                    {categories.filter(cat => cat !== 'all').map(category => (
                      <label key={category} className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category])
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== category))
                            }
                          }}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-3"
                        />
                        <span className="text-gray-900 font-medium capitalize">{category}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              <select
                className="px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-base font-medium min-w-0"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Categories Tags */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600 font-medium mr-2">Active filters:</span>
              {selectedCategories.map(category => (
                <span
                  key={category}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                  <button
                    onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== category))}
                    className="text-purple-600 hover:text-purple-800 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={() => setSelectedCategories([])}
                className="text-sm text-gray-500 hover:text-gray-700 underline font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>
  
      {/* Enhanced Quizzes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <Card key={quiz.id} className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
            
            {/* Quiz Image */}
            <div className="relative h-48 bg-gray-100">
              {quiz.image_url ? (
                <Image
                  src={quiz.image_url}
                  alt={quiz.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-200 flex items-center justify-center">
                  <div className="text-4xl font-black text-purple-500">
                    {quiz.title.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
            </div>

            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <CardTitle className="text-lg font-bold text-gray-900 leading-tight">{quiz.title}</CardTitle>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full flex-shrink-0 ${getStatusBadge(quiz.is_published)}`}>
                      {quiz.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2 text-base text-gray-600 leading-relaxed">{quiz.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-3 py-2 text-sm font-bold rounded-xl capitalize ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </span>
                  <span className="text-base text-gray-700 font-medium capitalize">{quiz.category}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-base">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="h-5 w-5 flex-shrink-0 text-blue-600" />
                    <span className="font-medium">{quiz.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Brain className="h-5 w-5 flex-shrink-0 text-purple-600" />
                    <span className="font-medium">{quiz.total_questions} questions</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-base">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span className="font-medium">{quiz.total_questions} items</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <BarChart3 className="h-5 w-5 flex-shrink-0 text-orange-600" />
                    <span className="font-medium">{quiz.passing_score}% pass</span>
                  </div>
                </div>

                <div className="text-sm text-gray-500 border-t border-gray-200 pt-3 font-medium">
                  Created: {formatDate(quiz.created_at)}
                </div>

                {/* Enhanced Action Buttons */}
                <div className="space-y-3 pt-2">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleViewQuiz(quiz)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md"
                    >
                      <Eye className="h-5 w-5" />
                      <span>View</span>
                    </button>
                    <button 
                      onClick={() => handleTogglePublish(quiz)}
                      className={`flex-1 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md ${
                        quiz.is_published
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {quiz.is_published ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Check className="h-5 w-5" />
                      )}
                      <span>
                        {quiz.is_published ? 'Unpublish' : 'Publish'}
                      </span>
                    </button>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleEditQuiz(quiz)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md"
                    >
                      <Edit className="h-5 w-5" />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteQuiz(quiz)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Empty State */}
      {filteredQuizzes.length === 0 && !loading && (
        <Card className="mt-8 border-2 border-dashed border-gray-300 bg-white">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No quizzes found</h3>
              <p className="text-gray-600 mb-6 text-base leading-relaxed max-w-md mx-auto">
                {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                  ? 'Try adjusting your search or filter criteria to find the quizzes you are looking for'
                  : 'Start creating engaging quizzes for your students to test their knowledge and understanding'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && selectedDifficulty === 'all' && (
                <button 
                  onClick={handleCreateQuiz}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Create Your First Quiz
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <QuizForm
        quiz={editingQuiz}
        isOpen={showQuizForm}
        onClose={() => setShowQuizForm(false)}
        onSuccess={handleFormSuccess}
      />

      <DeleteQuizModal
        quiz={deletingQuiz}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={handleDeleteSuccess}
      />

      <QuizViewModal
        quiz={viewingQuiz}
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        onEdit={() => {
          setShowViewModal(false)
          if (viewingQuiz) {
            handleEditQuiz(viewingQuiz)
          }
        }}
      />

      <CategoryManagement
        isOpen={showCategoryManagement}
        onClose={() => setShowCategoryManagement(false)}
        onCategoryCreated={() => {
          // Refresh categories when new ones are created
          fetchQuizzes()
        }}
      />
    </div>
  )
}