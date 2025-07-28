'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'

interface AuthGuardProps {
  children: React.ReactNode
}

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/auth', '/auth/callback', '/auth/reset-password', '/']

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return

    // Check if current route is public
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

    // If not authenticated and not on a public route, redirect to auth
    if (!user && !isPublicRoute) {
      router.push('/auth')
    }

    // If authenticated and on auth page, redirect to home
    if (user && pathname.startsWith('/auth')) {
      router.push('/')
    }
  }, [user, loading, pathname, router])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" color="indigo" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render protected content if not authenticated
  if (!user && !PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return null
  }

  return <>{children}</>
} 