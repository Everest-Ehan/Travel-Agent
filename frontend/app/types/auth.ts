export interface AuthUser {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
  created_at: string
  updated_at: string
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_at: number
  user: AuthUser
}

export interface AuthError {
  message: string
  status?: number
}

export interface AuthResponse {
  data?: {
    user?: AuthUser
    session?: AuthSession
  }
  error?: AuthError
} 