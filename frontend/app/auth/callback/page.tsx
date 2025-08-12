'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('Completing authentication...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth callback error:', error)
        setMessage('Authentication failed. Redirecting...')
        setTimeout(() => {
          router.push('/auth?error=auth_callback_failed')
        }, 2000)
        return
      }

      if (data.session) {
        // Check if this was an email verification
        const next = searchParams.get('next')
        const type = searchParams.get('type')
        
        if (type === 'recovery') {
          setMessage('Password reset successful! Redirecting...')
          setTimeout(() => {
            router.push('/auth/reset-password')
          }, 2000)
        } else if (type === 'signup') {
          setMessage('Email verified successfully! Redirecting...')
          setTimeout(() => {
            router.push(next || '/search')
          }, 2000)
        } else {
          setMessage('Authentication successful! Redirecting...')
          setTimeout(() => {
            router.push(next || '/search')
          }, 2000)
        }
      } else {
        // No session, redirect to auth page
        setMessage('No session found. Redirecting...')
        setTimeout(() => {
          router.push('/auth')
        }, 2000)
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  )
} 