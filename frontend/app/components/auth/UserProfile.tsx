'use client'

import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function UserProfile() {
  const { user, signOut } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md p-2"
      >
        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {user.email?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <span className="hidden md:block text-sm font-medium">
          {user.email}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 text-sm text-gray-700 border-b">
            <p className="font-medium">{user.email}</p>
            <p className="text-gray-500 text-xs">
              {user.user_metadata?.full_name || 'User'}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {loading ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  )
} 