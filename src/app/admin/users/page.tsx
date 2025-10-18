'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAdminUsers } from '@/hooks/api'
import type { User } from '@/lib/supabase'
import AddUserModal from '@/components/admin/AddUserModal'
import EditUserModal from '@/components/admin/EditUserModal'
import DeleteUserModal from '@/components/admin/DeleteUserModal'
import Icon from '@/components/ui/Icon'
import { formatDate } from '@/lib/date-utils'
import { useAdminModals } from '@/hooks/admin/useAdminModals'

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  
  // 🔄 CONSOLIDATED: All modal states managed by single hook (was 3 separate useState calls)
  const { modalStates, modalData, actions } = useAdminModals<User>()

  // Destructure for easier access
  const {
    showAddModal,
    showForm: showEditUser,
    showDeleteModal
  } = modalStates

  const {
    editingItem: editingUser,
    deletingItem: deletingUser
  } = modalData

  // React Query hook for users
  const { 
    data: usersData, 
    isLoading: loading, 
    error: usersError,
    refetch: refetchUsers
  } = useAdminUsers(1, 50, searchTerm, roleFilter)

  const users = usersData?.data || []
  const error = usersError ? 'Failed to fetch users' : null

  const handleEditUser = (user: User) => {
    actions.openModal('showForm', user)
  }

  const handleDeleteUser = async (user: User) => {
    actions.openModal('showDeleteModal', user)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const userStats = {
    total: users.length,
    active: users.length, // For now, assume all users are active
    students: users.filter(u => u.role === 'student').length,
    instructors: users.filter(u => u.role === 'instructor').length,
    admins: users.filter(u => u.role === 'admin').length
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'badge-destructive',
      instructor: 'badge-warning', 
      student: 'badge-primary'
    }
    return colors[role as keyof typeof colors] || colors.student
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-base flex items-center gap-2 p-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-foreground font-medium">Loading users...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="alert-error">
          <p className="font-bold">Error loading users: {error}</p>
          <button 
            onClick={() => refetchUsers()}
            className="btn btn-outline mt-3"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Add proper container padding */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">User Management</h1>
              <p className="text-muted-foreground mt-1">Manage and monitor all platform users</p>
            </div>
            <button 
              onClick={() => actions.openModal('showAddModal')}
              className="btn btn-default flex items-center gap-2"
            >
              <Icon name="add" size={16} color="white" />
              Add User
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="elevated" className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">Total Users</p>
                <p className="text-2xl font-bold text-foreground mb-1">{userStats.total}</p>
                <p className="text-xs text-muted-foreground">All registered users</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl ml-4 flex-shrink-0">
                <Icon name="users" size={20} color="primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card variant="elevated" className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">Students</p>
                <p className="text-2xl font-bold text-foreground mb-1">{userStats.students}</p>
                <p className="text-xs text-muted-foreground">Student accounts</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl ml-4 flex-shrink-0">
                <Icon name="users" size={20} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">Instructors</p>
                <p className="text-2xl font-bold text-foreground mb-1">{userStats.instructors}</p>
                <p className="text-xs text-muted-foreground">Instructor accounts</p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-xl ml-4 flex-shrink-0">
                <Icon name="briefcase" size={20} color="secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card variant="elevated" className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">Admins</p>
                <p className="text-2xl font-bold text-foreground mb-1">{userStats.admins}</p>
                <p className="text-xs text-muted-foreground">Admin accounts</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl ml-4 flex-shrink-0">
                <Icon name="shield" size={20} className="text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <label htmlFor="user-search" className="sr-only">Search users</label>
          <Icon
            name="search"
            size={16}
            color="muted"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="user-search"
            type="search"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-primary"
            aria-label="Search users by name or email"
          />
        </div>
        <div>
          <label htmlFor="role-filter" className="sr-only">Filter by role</label>
          <Select
            value={roleFilter}
            onValueChange={setRoleFilter}
          >
            <SelectTrigger className="w-[180px]" id="role-filter" aria-label="Filter users by role">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="instructor">Instructor</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <Card variant="elevated" size="lg">
        <CardHeader>
          <CardTitle className="font-bold">All Users</CardTitle>
          <CardDescription>A list of all users on the platform</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Icon name="users" size={48} color="muted" className="mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-black mb-2">No users found</h3>
                        <p className="text-sm">
                          {searchTerm || roleFilter !== 'all'
                            ? 'Try adjusting your search or filter criteria'
                            : 'No users have been added yet'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-white">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4 min-w-0">
                            <div className="text-sm font-bold text-black truncate">{user.name}</div>
                            <div className="text-sm text-gray-500 truncate">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full capitalize ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">
                          <Icon name="check-circle" size={12} className="mr-1" />
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Icon name="calendar" size={14} className="mr-2 text-gray-400" />
                          <span className="font-medium">{formatDate(user.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-secondary hover:text-primary font-semibold transition-colors inline-flex items-center"
                            aria-label={`Edit ${user.name}`}
                          >
                            <Icon name="edit" size={14} className="mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-800 font-semibold transition-colors inline-flex items-center"
                            aria-label={`Delete ${user.name}`}
                          >
                            <Icon name="delete" size={14} className="mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <AddUserModal 
        isOpen={showAddModal}
        onClose={() => {
          actions.closeModal('showAddModal')
        }}
        onUserAdded={() => {
          refetchUsers()
        }}
      />

      {/* Edit User Modal */}
      <EditUserModal 
        isOpen={showEditUser}
        onClose={() => {
          actions.closeModal('showForm')
        }}
        onUserUpdated={() => {
          refetchUsers()
        }}
        user={editingUser}
      />

      {/* Delete User Modal */}
      <DeleteUserModal 
        isOpen={showDeleteModal}
        onClose={() => {
          actions.closeModal('showDeleteModal')
        }}
        onUserDeleted={() => {
          refetchUsers()
        }}
        user={deletingUser}
      />
      </div>
    </div>
  )
}

