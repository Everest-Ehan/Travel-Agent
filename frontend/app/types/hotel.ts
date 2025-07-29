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
  description?: string
  contact_info?: {
    phones?: Array<{ number: string }>
    emails?: Array<any>
  }
  physical_address_1?: string
  physical_city?: string
  physical_state?: string
  physical_country?: string
  physical_postal_code?: string
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

export interface HotelRatesResponse {
  summary: {
    nightly_rate: number
    total: number
    currency: string
    lowest_commission: number
    highest_commission: number
    is_commissionable: boolean
    payout_speed: string
  }
  programs: HotelRateProgram[]
  cart_id?: string
}

export interface HotelRateProgram {
  id: string
  logo_url: string
  name: string
  commission: string
  how_to_book: string
  typical_perks: string
  url_partner: string
  has_perks: boolean
  special_perks: boolean
  booking_method: boolean
  list_rates: boolean
  notice_text: string
  show_book_outside_portal: boolean
  show_iata: boolean
  show_submission_instructions: boolean
  submission_instructions: string
  member_rate_allowed: boolean
  member_rate_required: boolean
  sequence: number
  rates: HotelRate[]
}

export interface HotelRate {
  id: string
  offer_id: string
  booking_code: string
  cart_id?: string
  cartId?: string // Alternative camelCase version
  supplier_id?: string
  supplierId?: string // Alternative camelCase version
  commission: {
    expected_commission_percent: number
    is_commissionable: boolean
  }
  room: {
    description: string
    included_meals: {
      breakfast: boolean
    }
    amenities: any[]
    characteristics: Record<string, any>
  }
  policies: {
    cancellations: CancellationPolicy[]
  }
  price: {
    exchange_rate: any[]
    rate_id: string
    rate_code: string
    rate_description: string
    payment_type: string
    payment_type_slug: string
    avg_per_night: PriceItem
    line_items: PriceItem[]
    grand_total_items: PriceItem[]
    strikethrough_price: any
  }
  tags: any[]
  rate_identifier: string
  commission_overwrite_id: string
}

export interface CancellationPolicy {
  valid_from: string
  valid_until: string | null
  penalty_amount: number | null
  penalty_percentage: number | null
  refundable: boolean
  penalty_currency: string
}

export interface PriceItem {
  category: string
  label: string
  currency: string
  date: string | null
  total: number
  original_currency: string
  original_total: number
} 