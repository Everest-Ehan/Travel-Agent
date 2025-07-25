'use client'

import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface EmailVerificationProps {
  email: string
  onVerified?: () => void
}

export default function EmailVerification({ email, onVerified }: EmailVerificationProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { resendVerificationEmail } = useAuth()

  const handleResendEmail = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await resendVerificationEmail(email)
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-yellow-100">
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
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a verification email to
          </p>
          <p className="text-center text-sm font-medium text-gray-900">
            {email}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Please check your email and click the verification link to complete your registration.
            </p>

            {error && (
              <div className="mb-4 text-red-600 text-sm">{error}</div>
            )}

            {message && (
              <div className="mb-4 text-green-600 text-sm">{message}</div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Resend verification email'}
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                I've verified my email
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              onClick={handleResendEmail}
              disabled={loading}
              className="text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
            >
              try again
            </button>
          </p>
        </div>
      </div>
    </div>
  )
} 