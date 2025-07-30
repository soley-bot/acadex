'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Plus, Brain, Clock, Users, BarChart3, Edit, Trash2, Eye } from 'lucide-react'
import { supabase, Quiz } from '@/lib/supabase'
import { QuizForm } from '@/components/admin/QuizForm'
import { DeleteQuizModal } from '@/components/admin/DeleteQuizModal'
import { QuizViewModal } from '@/components/admin/QuizViewModal'

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  
  // Modal states
  const [showQuizForm, setShowQuizForm] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingQuiz, setDeletingQuiz] = useState<Quiz | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingQuiz, setViewingQuiz] = useState<Quiz | null>(null)

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
        console.error('Error fetching quiz attempts:', attemptsError)
      }

      setQuizzes(data || [])
    } catch (err) {
      console.error('Error fetching quizzes:', err)
      setError('Failed to load quizzes. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuizzes()
  }, [fetchQuizzes])

  // Filter quizzes based on search and filters
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || quiz.category === selectedCategory
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
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800'
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
    <div className="min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quiz Management</h1>
            <p className="text-gray-600 mt-1">Create and manage quizzes for the platform</p>
          </div>
          <button
            onClick={handleCreateQuiz}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-bold shadow-md hover:shadow-lg"
          >
            <Plus size={16} />
            Create Quiz
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Quizzes</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{quizStats.total}</p>
                <p className="text-xs text-gray-500">All quizzes</p>
              </div>
              <div className="bg-red-50 p-3 rounded-full ml-4 flex-shrink-0">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Published</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{quizStats.published}</p>
                <p className="text-xs text-gray-500">Live quizzes</p>
              </div>
              <div className="bg-green-50 p-3 rounded-full ml-4 flex-shrink-0">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Drafts</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{quizStats.draft}</p>
                <p className="text-xs text-gray-500">In development</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-full ml-4 flex-shrink-0">
                <Edit className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Questions</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{quizStats.totalQuestions}</p>
                <p className="text-xs text-gray-500">All questions</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-full ml-4 flex-shrink-0">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Avg Passing Score</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{quizStats.averagePassingScore}%</p>
                <p className="text-xs text-gray-500">Required to pass</p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-full ml-4 flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search quizzes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(quiz.is_published)}`}>
                      {quiz.is_published ? 'published' : 'draft'}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </span>
                  <span className="text-sm text-gray-500 capitalize">{quiz.category}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="h-4 w-4" />
                    {quiz.duration_minutes}min
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Brain className="h-4 w-4" />
                    {quiz.total_questions} questions
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Users className="h-4 w-4" />
                    {quiz.total_questions} questions
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <BarChart3 className="h-4 w-4" />
                    {quiz.passing_score}% to pass
                  </div>
                </div>

                <div className="text-xs text-gray-500 border-t pt-2">
                  Created: {formatDate(quiz.created_at)}
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => handleViewQuiz(quiz)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </button>
                  <button 
                    onClick={() => handleEditQuiz(quiz)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteQuiz(quiz)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredQuizzes.length === 0 && !loading && (
        <Card className="mt-8 border-2 border-dashed border-gray-300">
          <CardContent className="p-8">
            <div className="text-center">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start creating engaging quizzes for your students'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && selectedDifficulty === 'all' && (
                <button 
                  onClick={handleCreateQuiz}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
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
    </div>
  )
}