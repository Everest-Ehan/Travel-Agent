'use client'

import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Alert from '../ui/Alert'
import LoadingSpinner from '../ui/LoadingSpinner'

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
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-indigo-100 mb-4">
            <svg
              className="h-8 w-8 text-indigo-600"
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
            Check your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a verification link to
          </p>
          <p className="text-center text-sm font-medium text-gray-900 bg-white px-3 py-2 rounded-lg border mt-2">
            {email}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Almost there!
              </h3>
              <p className="text-sm text-gray-600">
                Click the verification link in your email to complete your registration.
              </p>
            </div>

            {error && <Alert type="error" message={error} />}
            {message && <Alert type="success" message={message} />}

            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="-ml-1 mr-3" />
                    Sending...
                  </div>
                ) : (
                  'Resend verification email'
                )}
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                I've verified my email
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Alert 
            type="info" 
            message="Tip: Check your spam folder if you don't see the email in your inbox."
            className="text-left"
          />
        </div>
      </div>
    </div>
  )
} 