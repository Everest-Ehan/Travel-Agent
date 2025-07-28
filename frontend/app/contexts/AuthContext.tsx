'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { auth } from '../lib/supabase'
import { ApiService } from '../services/api'

interface Client {
  id: string
  first_name: string
  last_name: string
  emails: Array<{ email: string; email_type: string }>
  phone_numbers: Array<{ phone_number: string; number_type: string }>
  addresses: Array<{
    label: string
    country_id: string | null
    country_name: string
    state: string
    city: string
    address: string
  }>
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  emailVerified: boolean
  userClient: Client | null
  clientLoading: boolean
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
  const [userClient, setUserClient] = useState<Client | null>(null)
  const [clientLoading, setClientLoading] = useState(false)

  // Function to fetch or create a client for the authenticated user
  const fetchOrCreateUserClient = async (user: User) => {
    if (!user.email) return
    
    setClientLoading(true)
    try {
      console.log('🔍 Fetching/creating client for user:', user.email)
      
      // First, check if user already has a client_id in the database
      const { data: userData, error: userError } = await auth.getUserClientId(user.id)
      
      if (!userError && userData?.client_id) {
        // User has a client_id, fetch the client details
        console.log('✅ User has existing client_id:', userData.client_id)
        try {
          const clientsResponse = await ApiService.fetchClients('') // Fetch all clients to find by ID
          const clients = clientsResponse.results || clientsResponse
          const existingClient = clients.find((client: Client) => client.id === userData.client_id)
          
          if (existingClient) {
            console.log('✅ Found existing client:', existingClient.id)
            setUserClient(existingClient)
            return
          }
        } catch (error) {
          console.warn('⚠️ Failed to fetch client with stored ID, will create new one')
        }
      }
      
      // No client_id or client not found, search by email
      console.log('🔍 Searching for client by email:', user.email)
      const clientsResponse = await ApiService.fetchClients(user.email)
      const clients = clientsResponse.results || clientsResponse
      
      const existingClient = clients.find((client: Client) => 
        client.emails.some(emailObj => emailObj.email.toLowerCase() === user.email!.toLowerCase())
      )
      
      if (existingClient) {
        console.log('✅ Found existing client by email:', existingClient.id)
        setUserClient(existingClient)
        // Update the user's client_id in the database
        await auth.storeUserClientId(user.id, existingClient.id)
      } else {
        // Create new client with email as name
        console.log('🆕 Creating new client for email:', user.email)
        const clientData = {
          first_name: user.email, // Using email as the name
          last_name: '', // Will be converted to null in backend
          addresses: [],
          emails: [{
            email: user.email,
            email_type: 'primary'
          }],
          phone_numbers: []
        }
        
        const newClient = await ApiService.createClient(clientData)
        console.log('✅ Created new client:', newClient.id)
        setUserClient(newClient)
        // Store the client_id in the user's record
        await auth.storeUserClientId(user.id, newClient.id)
      }
    } catch (error) {
      console.error('❌ Error fetching/creating user client:', error)
    } finally {
      setClientLoading(false)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { session } = await auth.getCurrentSession()
      setSession(session)
      setUser(session?.user ?? null)
      setEmailVerified(session?.user?.email_confirmed_at ? true : false)
      setLoading(false)
      
      // Fetch user client if user is already authenticated
      if (session?.user) {
        await fetchOrCreateUserClient(session.user)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email || 'no user')
        setSession(session)
        setUser(session?.user ?? null)
        setEmailVerified(session?.user?.email_confirmed_at ? true : false)
        setLoading(false)
        
        // Handle client creation/fetching when user signs in or signs up
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          await fetchOrCreateUserClient(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUserClient(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    session,
    loading,
    emailVerified,
    userClient,
    clientLoading,
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