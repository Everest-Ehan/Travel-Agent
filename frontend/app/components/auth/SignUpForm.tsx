'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import EmailVerification from './EmailVerification'
import Alert from '../ui/Alert'
import LoadingSpinner from '../ui/LoadingSpinner'

interface SignUpFormProps {
  onSwitchToLogin: () => void
}

export default function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const { signUp, signInWithGoogle } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
        setLoading(false) // Reset loading state on error
      } else {
        setShowEmailVerification(true)
        setLoading(false)
        // Note: For signup, we show email verification first
        // The redirect will happen after email verification
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false) // Reset loading state on error
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await signInWithGoogle()
      if (error) {
        setError(error.message)
        setLoading(false) // Reset loading state on error
      } else {
        // Redirect to search page after successful Google signup
        router.push('/search')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false) // Reset loading state on error
    }
  }

  if (showEmailVerification) {
    return <EmailVerification email={email} />
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 h-full flex flex-col">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Create Account
        </h2>
        <p className="text-gray-600">
          Join Travel Agent and start your journey
        </p>
      </div>
      <form className="space-y-6 flex-1 flex flex-col" onSubmit={handleSubmit}>
        <div className="space-y-4 flex-1">
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {error && <Alert type="error" message={error} />}
        {message && <Alert type="success" message={message} />}

        <div className="mt-auto">
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            {loading ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" className="-ml-1 mr-3" />
                Creating account...
              </div>
            ) : (
              'Create account'
            )}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.54 12.07c0-.79-.07-1.54-.19-2.27H12v4.51h6.59c-.31 1.57-1.24 2.89-2.66 3.77v2.92h3.76c2.21-2.03 3.49-5.01 3.49-8.23z"
              />
              <path
                fill="currentColor"
                d="M12 23c3.24 0 5.95-1.08 7.93-2.92l-3.76-2.92c-1.04.7-2.38 1.11-4.17 1.11-3.21 0-5.94-2.16-6.92-5.08H1.34v2.99C3.35 21.02 7.3 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M4.92 14.09c-.2-.59-.31-1.23-.31-1.9s.11-1.31.31-1.9V8.2H1.34a11.99 11.99 0 000 7.6z"
              />
              <path
                fill="currentColor"
                d="M12 4.73c1.77 0 3.35.61 4.6 1.79l3.34-3.34C17.95 1.08 15.24 0 12 0 7.3 0 3.35 1.98 1.34 4.91l3.58 2.79C6.06 5.89 8.79 4.73 12 4.73z"
              />
            </svg>
            Sign up with Google
          </button>
        </div>
      </form>
    </div>
  )
} 