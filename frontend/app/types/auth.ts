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

export interface User {
  id: string
  email: string
  name?: string
}

export interface Client {
  id: string
  first_name: string
  last_name: string
  emails: Array<{
    email: string
    email_type: string
  }>
  phone_numbers: Array<{
    phone_number: string
    number_type: string
  }>
  addresses: Array<{
    label: string
    country_id: string | null
    country_name: string
    state: string
    city: string
    address: string
  }>
  created_at: string
  updated_at: string
}

export interface ClientCard {
  id: string
  address: string
  address_additional: string | null
  card_logo: string
  city: string
  country_id: number
  cvv_token: string
  expire_month: string
  expire_year: string
  first_6: string
  holder_name: string
  last_4: string
  nickname: string | null
  number_token: string
  state: string
  zip_code: string
}

export interface CreateCardRequest {
  address: string
  address_additional?: string
  card_logo: string
  city: string
  country_id: number
  cvv: string
  expire_month: string
  expire_year: string
  holder_name: string
  number: string
  nickname?: string
  state: string
  zip_code: string
}

export interface UpdateCardRequest {
  address?: string
  address_additional?: string
  card_logo?: string
  city?: string
  country_id?: number
  cvv?: string
  expire_month?: string
  expire_year?: string
  holder_name?: string
  nickname?: string
  state?: string
  zip_code?: string
} 