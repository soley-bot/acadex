'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Shield, ArrowLeft, Home } from 'lucide-react'

export default function UnauthorizedPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Access Denied
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          You don&apos;t have permission to access this page
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-700">
                This page requires admin privileges.
              </p>
              {user && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    Currently signed in as: <strong>{user.email}</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    Role: <span className="capitalize font-medium">{user.role}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Link
                href="/"
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Link>

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Link>
                  
                  <button
                    onClick={() => signOut()}
                    className="w-full flex justify-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="w-full flex justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                If you believe this is an error, please contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

