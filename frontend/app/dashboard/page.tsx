'use client'

import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import UserProfile from '../components/auth/UserProfile'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold text-gray-900 hover:text-indigo-600 transition-colors">
                Fora Travel
              </a>
            </div>
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
          
          <div className="space-y-6">
            <div className="bg-indigo-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-indigo-900 mb-2">
                Welcome back, {user?.email}!
              </h2>
              <p className="text-indigo-700">
                This is your personal dashboard. Here you can manage your bookings, preferences, and more.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">My Bookings</h3>
                <p className="text-gray-600">View and manage your hotel bookings</p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Saved Hotels</h3>
                <p className="text-gray-600">Access your favorite hotels</p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Preferences</h3>
                <p className="text-gray-600">Manage your travel preferences</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 