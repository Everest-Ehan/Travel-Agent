'use client'

import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface PasswordResetProps {
  onBackToLogin: () => void
}

export default function PasswordReset({ onBackToLogin }: PasswordResetProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await resetPassword(email)
      if (error) {
        setError(error.message)
      } else {
        setMessage('Password reset email sent! Please check your inbox.')
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
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          {message && (
            <div className="text-green-600 text-sm text-center">{message}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onBackToLogin}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Back to sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 