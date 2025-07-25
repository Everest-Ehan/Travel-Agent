'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { auth } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  emailVerified: boolean
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>
  signInWithGoogle: () => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  resendVerificationEmail: (email: string) => Promise<{ data: any; error: any }>
  updatePassword: (password: string) => Promise<{ data: any; error: any }>
  resetPassword: (email: string) => Promise<{ data: any; error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailVerified, setEmailVerified] = useState(false)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { session } = await auth.getCurrentSession()
      setSession(session)
      setUser(session?.user ?? null)
      setEmailVerified(session?.user?.email_confirmed_at ? true : false)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setEmailVerified(session?.user?.email_confirmed_at ? true : false)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    session,
    loading,
    emailVerified,
    signIn: auth.signIn,
    signUp: auth.signUp,
    signInWithGoogle: auth.signInWithGoogle,
    signOut: auth.signOut,
    resendVerificationEmail: auth.resendVerificationEmail,
    updatePassword: auth.updatePassword,
    resetPassword: auth.resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 