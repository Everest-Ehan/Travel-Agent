'use client'

import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import UserProfile from '../components/auth/UserProfile'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="/"
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </a>
                <UserProfile />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Welcome back, {user?.email}!
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Recent Searches
                </h3>
                <p className="text-blue-700">No recent searches yet</p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-green-900 mb-2">
                  Saved Hotels
                </h3>
                <p className="text-green-700">No saved hotels yet</p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-purple-900 mb-2">
                  Travel History
                </h3>
                <p className="text-purple-700">No travel history yet</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 