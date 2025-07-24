export interface Hotel {
  id: string
  name: string
  location: string
  hotel_class?: string
  is_bookable?: boolean
  labels?: Array<{text: string, slug: string}>
  images?: Array<{public_id: string, caption?: string}>
  programs?: Array<{name: string, id: string, logo_url: string}>
  brand_name?: string
  brand_group?: string
  average_review_rating?: number
  total_review_count?: number
  awards?: Array<{label: string, value: number, slug: string}>
  commission_range?: string
  payout_speed?: string
  last_year_booking_count?: number
  all_time_booking_count?: number
  gmaps_link?: string
  coordinates?: {latitude: number, longitude: number}
  rate?: RateInfo
}

export interface RateInfo {
  id: string
  nightly_rate: number
  total: number
  currency: string
  lowest_commission: number
  highest_commission: number
  is_commissionable: boolean
  payout_speed: string
  children_support: string
}

export interface RateSummaryRequest {
  currency: string
  number_of_adults: number
  children_ages: number[]
  start_date: string
  end_date: string
  supplier_ids: string[]
  filters?: Record<string, any>
}

export interface SearchFilters {
  adults?: number
  children_ages?: number[]
  currency?: string
  start_date?: string
  end_date?: string
  rooms?: number
  view_mode?: string
  supplierType?: string
}

export interface RateSummaryResponse {
  data: RateInfo[]
} 