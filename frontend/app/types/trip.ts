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

// Detailed Trip Types
export interface TripReason {
  slug: string
  name: string
  icon: string
}

export interface LineItem {
  label: string
  category: string
  currency_code: string
  total: number
  sequence: number
  displayed_total: number
  displayed_currency_code: string
}

export interface Cancellation {
  valid_from: string
  valid_to: string | null
  penalty_amt: number | null
  currency_code: string | null
  refundable: boolean
}

export interface AdditionalInformation {
  title: string
  content: string
}

export interface ClientCard {
  last_4: string
  holder_name: string
  expire_year: number
  expire_month: number
  card_logo: string
}

export interface SupplierImage {
  id: string
}

export interface Brand {
  id: number
  name: string
  group: string
  group_ref_name: string
}

export interface Label {
  text: string
  slug: string
}

export interface SupplierRef {
  id: string
  name: string
  physical_address_1: string
  reserve: boolean
  preferred: boolean
  supplier_images: SupplierImage[]
  physical_address_2: string | null
  location: string
  brand: Brand
  labels: Label[]
  physical_city: string
  physical_state: string
  physical_region: string | null
  physical_country: string
  physical_postal_code: string
  brand_name: string
  brand_group: string
  allow_in_list: boolean
}

export interface Taxes {
  vat_percent: number
  vat_amount: number
  taxes: number
  total_taxes: number
}

export interface PayDateDescription {
  pay_date_copy: string
  pay_date_explanation: string
  pay_date_severity: string
  pay_date_category: string
}

export interface Phone {
  number: string
  description: string | null
  type: string | null
  id: string
  supplier_id: string
  archived_stamp: string | null
}

export interface ContactInfo {
  phones: Phone[]
  emails: any[]
}

export interface TravelportDetails {
  pnr_id: string
  booking_code: string
  used_rate_code: string
  client_payment_type: string
}

export interface Booking {
  resource_link: string | null
  application_status: string | null
  logging_contact: string | null
  email_captured: string
  number_of_adults: number
  booking_id: string
  advisor_name: string
  advisor: string
  date_booked: string
  arrival: string
  departure: string
  category: string
  supplier: string
  hotel_group: string | null
  booking_source: string
  primary_guest_name: string
  primary_guest_email: string | null
  hotel_currency: string
  avg_gross_nightly_rate: string
  vat: string
  avg_net_nightly_rate: string
  fx_rate: string
  avg_net_nightly_rate_usd: string
  rooms: number
  room_nights: number
  room_nights_units: string
  total_commissionable_booking: string
  total_commissionable_booking_usd: string
  confirmation_num: string
  status: string
  source: string
  cancellation_date: string | null
  cancellation_num: string | null
  total_commission_usd: string
  advisor_ytd_bookings_total: string
  advisor_plan: string
  commissions_payable: string
  payment_status: string | null
  payment_date: string | null
  payment_link: string | null
  supplier_payment_received: string | null
  supplier_payment_date_received: string | null
  supplier_payment_type: string | null
  full_address: string | null
  country: string
  state: string
  city: string | null
  zip_code: string | null
  hotel: string | null
  invoice_notes: string | null
  notes_for_client: string
  notes: string | null
  formulas: string
  booked_month: number
  booked_year: number
  booked_week: number
  completed: string
  stay_year: number
  month: number
  h1_h2: string
  week: number
  cohort_date: string | null
  booking_status: string
  portal_booking_status: string
  paid_status: string
  paid_status_detail: string
  collection_status: string | null
  unique_id: string
  is_fully_cancellable: boolean
  est_commission: string
  advisor_split: string
  created_at: string
  non_compliant: boolean
  pay_by: string
  line_items: LineItem[]
  travelport_details: TravelportDetails
  cancellations: Cancellation[]
  additional_information: AdditionalInformation[]
  client: {
    first_name: string
    last_name: string
    middle_name: string | null
    prefix: string | null
    suffix: string | null
    preferred_name: string | null
    pronouns: string | null
  }
  trip: {
    id: string
    name: string
  }
  client_card: ClientCard
  supplier_ref: SupplierRef
  supplier_type: string
  travel_review_status: string | null
  client_id: string
  travel_review: string | null
  travel_review_created_at: string | null
  travel_review_completed_at: string | null
  loyalty_program: string | null
  booking_channel: string
  taxes: Taxes
  pay_date_description: PayDateDescription
  contact_info: ContactInfo
  deposits: any[]
  is_portal_booking: boolean
  grand_total_usd: number
  commissions_payable_after_fees: number
  fees: any[]
  review_url: string
  draft_review_status: string | null
  rate_id: string
}

export interface DetailedTrip {
  id: string
  name: string
  start_date: string
  end_date: string
  reason: TripReason | null
  clients: TripClient[]
  commission_summary: CommissionSummary
  booking_summary: BookingSummary
  status: 'cancelled' | 'upcoming' | 'past'
  image: TripImage[]
  num_nights: number
  dates_estimated: boolean
  itineraries: any[]
  quote_count: number
  bookings: Booking[]
  notes: string | null
  should_show_faye: boolean
  quotes: any[]
} 