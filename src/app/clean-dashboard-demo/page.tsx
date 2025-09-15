'use client'

import React from 'react'
import { 
  BookOpen, 
  Trophy, 
  Target, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle,
  Bell,
  Calendar,
  Star,
  ArrowUpRight
} from 'lucide-react'

// Clean Dashboard following the reference design patterns
export default function CleanDashboardDemo() {
  const statsData = [
    {
      title: 'Active Courses',
      value: '5',
      description: 'Currently enrolled',
      icon: BookOpen,
      color: 'sky'
    },
    {
      title: 'Completed Courses',
      value: '12',
      description: 'Successfully finished',
      icon: Trophy,
      color: 'green'
    },
    {
      title: 'Average Score',
      value: '85%',
      description: 'Quiz performance',
      icon: TrendingUp,
      color: 'sky',
      trend: { value: 8.3, isPositive: true, label: 'vs last month' }
    },
    {
      title: 'Study Streak',
      value: '15 days',
      description: 'Current learning streak',
      icon: Calendar,
      color: 'amber'
    }
  ]

  const courses = [
    {
      id: 1,
      title: 'Advanced English Grammar',
      subject: 'Grammar',
      progress: 75,
      icon: BookOpen
    },
    {
      id: 2,
      title: 'IELTS Speaking Prep',
      subject: 'IELTS',
      progress: 45,
      icon: Target
    },
    {
      id: 3,
      title: 'Business English',
      subject: 'Professional',
      progress: 90,
      icon: Users
    },
    {
      id: 4,
      title: 'Academic Writing',
      subject: 'Writing',
      progress: 60,
      icon: BookOpen
    }
  ]

  const upcomingAssignments = [
    {
      id: 1,
      title: 'Grammar Quiz Chapter 5',
      course: 'Advanced Grammar',
      dueDate: 'Tomorrow',
      urgent: true
    },
    {
      id: 2,
      title: 'Speaking Practice Session',
      course: 'IELTS Prep',
      dueDate: 'Dec 22',
      urgent: false
    },
    {
      id: 3,
      title: 'Essay Submission',
      course: 'Academic Writing',
      dueDate: 'Dec 25',
      urgent: false
    }
  ]

  const recentGrades = [
    { assignment: 'Vocabulary Test', grade: 92, total: 100, course: 'Grammar' },
    { assignment: 'Speaking Mock', grade: 85, total: 100, course: 'IELTS' },
    { assignment: 'Writing Practice', grade: 78, total: 100, course: 'Academic' },
    { assignment: 'Listening Comprehension', grade: 94, total: 100, course: 'IELTS' }
  ]

  const announcements = [
    {
      id: 1,
      title: 'Holiday Schedule Update',
      content: 'Classes will be suspended from Dec 24-26. Make-up sessions available.',
      date: '2 hours ago'
    },
    {
      id: 2,
      title: 'New IELTS Resources Available',
      content: 'Check out the updated speaking practice materials in your course.',
      date: '1 day ago'
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'sky':
        return 'text-sky-500 bg-sky-100'
      case 'green':
        return 'text-green-500 bg-green-100'
      case 'amber':
        return 'text-amber-500 bg-amber-100'
      case 'red':
        return 'text-red-500 bg-red-100'
      default:
        return 'text-sky-500 bg-sky-100'
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b-2 border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-700">Welcome back, Alex!</h1>
              <p className="text-sm text-slate-500">Let&apos;s have a great day of learning.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-slate-600 hover:text-slate-800">
                <Bell className="w-6 h-6" />
              </button>
              <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          
          {/* Main Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Stats Overview */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-slate-700 mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-3 text-sky-500" />
                Your Progress
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsData.map((stat, index) => (
                  <div key={index} className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-slate-600">{stat.title}</h4>
                      <div className={`p-2 rounded-full ${getColorClasses(stat.color)}`}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                    </div>
                    {/* MODIFIED SECTION */}
                    <div className="flex items-baseline space-x-2 mb-2">
                      <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                      {stat.trend && (
                        <div className="flex items-center text-sm text-green-600 font-semibold">
                          <ArrowUpRight className="w-4 h-4" /> 
                          <span>{stat.trend.value}%</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{stat.description}</p>
                    {/* The old trend indicator block is now gone from here */}
                  </div>
                ))}
              </div>
            </div>

            {/* My Courses */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
                <BookOpen className="w-6 h-6 mr-3 text-sky-500" />
                My Courses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="bg-slate-50 hover:bg-slate-100 p-4 rounded-lg transition-all duration-300 cursor-pointer border border-slate-200 hover:shadow-lg">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-sky-100 rounded-full mr-4 text-sky-600">
                        <course.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{course.title}</h4>
                        <p className="text-sm text-slate-500">{course.subject}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-slate-500">Progress</span>
                        <span className="text-xs font-semibold text-sky-600">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignments and Announcements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Upcoming Assignments */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-3 text-green-500" />
                  Upcoming Assignments
                </h3>
                <div className="space-y-3">
                  {upcomingAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">{assignment.title}</h4>
                        <p className="text-xs text-slate-500">{assignment.course}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-medium ${assignment.urgent ? 'text-red-600' : 'text-slate-600'}`}>
                          {assignment.dueDate}
                        </p>
                        {assignment.urgent && (
                          <p className="text-xs text-red-500">Urgent</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Announcements */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
                  <Bell className="w-6 h-6 mr-3 text-amber-500" />
                  Announcements
                </h3>
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="p-3 bg-slate-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-slate-800 mb-1">{announcement.title}</h4>
                      <p className="text-xs text-slate-600 mb-2">{announcement.content}</p>
                      <p className="text-xs text-slate-500">{announcement.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Grades */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
                <Star className="w-6 h-6 mr-3 text-amber-500" />
                Recent Grades
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left text-sm font-semibold text-slate-700 pb-3">Assignment</th>
                      <th className="text-left text-sm font-semibold text-slate-700 pb-3">Course</th>
                      <th className="text-right text-sm font-semibold text-slate-700 pb-3">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentGrades.map((grade, index) => (
                      <tr key={index} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 text-sm text-slate-800">{grade.assignment}</td>
                        <td className="py-3 text-sm text-slate-500">{grade.course}</td>
                        <td className="py-3 text-right">
                          <span className={`text-sm font-semibold ${
                            grade.grade >= 90 ? 'text-green-600' : 
                            grade.grade >= 80 ? 'text-blue-600' : 
                            grade.grade >= 70 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {grade.grade}/{grade.total}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Side Column */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-md sticky top-8">
              <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
                <Users className="w-6 h-6 mr-3 text-sky-500" />
                Study Assistant
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">Today&apos;s Goal</h4>
                  <p className="text-xs text-slate-600 mb-3">Complete 2 lessons and 1 quiz</p>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                    <div className="bg-sky-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <p className="text-xs text-slate-500">60% Complete</p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">This Week</h4>
                  <p className="text-xs text-slate-600 mb-1">Study time: 12 hours</p>
                  <p className="text-xs text-slate-600 mb-1">Quizzes completed: 5</p>
                  <p className="text-xs text-slate-600">Average score: 87%</p>
                </div>

                <button className="w-full bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                  Continue Learning
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}