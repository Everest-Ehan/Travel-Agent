export interface TripClient {
  id: string
  first_name: string
  last_name: string
  preferred_name: string | null
  type: string
}

export interface CommissionSummary {
  total_value: string
  advisor_value: string
  draft_commission: string
  draft_commissionable_value: string
}

export interface BookingSummary {
  total: number
  draft_total: number
  supplier_types: Array<{
    total: number
    type: string
  }>
}

export interface TripImage {
  id: string
  public_id: string
  url?: string // Optional since API might not provide actual image URLs
}

export interface Trip {
  id: string
  name: string
  start_date: string
  end_date: string
  reason: string | null
  clients: TripClient[]
  commission_summary: CommissionSummary
  booking_summary: BookingSummary
  status: 'cancelled' | 'upcoming' | 'past'
  image: TripImage[]
  num_nights: number
  dates_estimated: boolean
  itineraries: any[]
  quote_count: number
}

export interface TripsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Trip[]
} 