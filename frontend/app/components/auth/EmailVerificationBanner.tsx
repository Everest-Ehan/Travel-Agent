'use client'

import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

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
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            Please verify your email address ({user.email}) to access all features.
          </p>
          <div className="mt-2 flex space-x-3">
            <button
              onClick={handleResendEmail}
              disabled={loading}
              className="text-sm font-medium text-yellow-800 hover:text-yellow-900 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Resend verification email'}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
            >
              I've verified my email
            </button>
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
          {message && (
            <p className="mt-1 text-sm text-green-600">{message}</p>
          )}
        </div>
      </div>
    </div>
  )
} 