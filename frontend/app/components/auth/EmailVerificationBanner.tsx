'use client'

import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function EmailVerificationBanner() {
  const { user, emailVerified, resendVerificationEmail } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Don't show banner if user is not logged in or email is verified
  if (!user || emailVerified) {
    return null
  }

  const handleResendEmail = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await resendVerificationEmail(user.email!)
      if (error) {
        setError(error.message)
      } else {
        setMessage('Verification email sent! Please check your inbox.')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">
                  Please verify your email address ({user.email}) to access all features.
                </p>
                {(error || message) && (
                  <p className="text-xs mt-1">
                    {error && <span className="text-red-600">{error}</span>}
                    {message && <span className="text-green-600">{message}</span>}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleResendEmail}
                disabled={loading}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" color="yellow" className="-ml-1 mr-2" />
                    Sending...
                  </div>
                ) : (
                  'Resend email'
                )}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-3 py-1.5 border border-yellow-300 text-xs font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200"
              >
                I've verified
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 