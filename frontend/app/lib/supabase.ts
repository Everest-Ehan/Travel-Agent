import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('🔧 Supabase config:', { 
  url: supabaseUrl ? 'configured' : 'missing', 
  key: supabaseAnonKey ? 'configured' : 'missing' 
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign in with Google OAuth
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    console.log('🔐 Calling supabase.auth.signOut()...')
    try {
      const { error } = await supabase.auth.signOut()
      console.log('🔐 Supabase signOut response:', { error })
      
      // Force clear local session if there's an error
      if (error) {
        console.warn('🔐 Sign out error, clearing local storage:', error)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sb-' + supabaseUrl.split('//')[1].split('.')[0] + '-auth-token')
          sessionStorage.clear()
        }
      }
      
      return { error }
    } catch (err) {
      console.error('🔐 Sign out exception:', err)
      // Force clear local storage on exception
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-' + supabaseUrl.split('//')[1].split('.')[0] + '-auth-token')
        sessionStorage.clear()
      }
      return { error: err }
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get current session
  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Resend email verification
  resendVerificationEmail: async (email: string) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  },

  // Update user password
  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    return { data, error }
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    return { data, error }
  },

  // Get user's client ID from user_clients table
  getUserClientId: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_clients')
      .select('client_id')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  // Store user's client ID in user_clients table
  storeUserClientId: async (userId: string, clientId: string) => {
    const { data, error } = await supabase
      .from('user_clients')
      .upsert({ 
        user_id: userId, 
        client_id: clientId 
      })
    return { data, error }
  }
} 