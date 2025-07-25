'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { ApiService } from '../../services/api'

interface HotelDetails {
  id: string
  name: string
  is_bookable: boolean
  images: Array<{
    file_type: string
    public_id: string
    caption: string | null
  }>
  description: string
  labels: Array<{
    text: string
    slug: string
  }>
  contact_info: {
    phones: Array<{
      number: string
      description: string | null
      type: string | null
      id: string
      supplier_id: string
      archived_stamp: string | null
    }>
    emails: any[]
  }
  url_link: string
  url_name: string | null
  brand_id: number
  brand_name: string
  brand_group: string
  hotel_class: string
  location: string
  notes: string | null
  cruise_type: string | null
  ship_type: string | null
  tour_type: string | null
  how_to_book: string | null
  url_partner: string | null
  programs: Array<{
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
    payout_speed: string
    payout_tooltip: string
    risky_payer: boolean
    risky_payer_copy: string | null
    show_unavailable_state: boolean
    use_browse_header: boolean
    is_limited_payment_history: boolean
    is_onyx_payer: boolean
    signup_link?: string
  }>
  luxe_category: string
  property_name: string | null
  last_year_booking_count: number
  last_year_advisor_count: number
  all_time_booking_count: number
  all_time_advisor_count: number
  physical_address_1: string
  physical_address_2: string
  physical_city: string
  physical_postal_code: string
  physical_country: string
  physical_state: string
  physical_region: string | null
  all_inclusive: boolean
  gmaps_link: string
  restricted_booking_methods: boolean
  neighborhood: string | null
  loyalty_program: {
    name: string;
    signup_link?: string;
  } | null;
  awards: Array<{
    label: string
    value: number
    slug: string
    supplier_id: string
    id: string
  }>
  average_review_rating: number
  total_review_count: number
  total_advisor_supplier_review_count: number
  is_in_advisor_list: boolean
  commission_range: string
  coordinates: {
    latitude: number
    longitude: number
  }
  fora_travel_url: string
  supplier_type_route: string
}

export default function HotelDetailsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [hotel, setHotel] = useState<HotelDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedProgramIndex, setSelectedProgramIndex] = useState(0)

  const hotelId = params.id as string
  const currency = searchParams.get('currency') || 'USD'
  const dates = searchParams.get('dates') || ''
  const adults = searchParams.get('adults') || '2'
  const children_ages = searchParams.get('children_ages') || ''
  const rooms = searchParams.get('rooms') || '1'

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setLoading(true)
        const hotelDetailsParams = {
          currency,
          dates,
          adults: parseInt(adults),
          children_ages: children_ages ? children_ages.split(',').map(Number) : [],
          rooms: parseInt(rooms),
        }
        
        const details = await ApiService.fetchHotelDetails(hotelId, hotelDetailsParams)
        setHotel(details)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load hotel details')
      } finally {
        setLoading(false)
      }
    }

    if (hotelId) {
      fetchHotelDetails()
    }
  }, [hotelId, currency, dates, adults, children_ages, rooms])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-primary-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg font-semibold text-primary-700">Loading hotel details...</span>
        </div>
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Hotel</h2>
          <p className="text-gray-600">{error || 'Hotel details not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Hotel Details</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {dates ? `${dates} • ${adults} adults` : 'Select dates'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hotel Header */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Image Gallery */}
              <div className="relative h-96 bg-gray-200">
                {hotel.images && hotel.images.length > 0 ? (
                  <>
                    <img
                      src={`https://media.fora.travel/foratravelportal/image/upload/c_fill,w_800,h_400,g_auto/f_auto/q_auto/v1/${hotel.images[activeImageIndex].public_id}`}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Image Navigation */}
                    {hotel.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {hotel.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    {/* Previous/Next Buttons */}
                    {hotel.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImageIndex((prev) => (prev === 0 ? hotel.images.length - 1 : prev - 1))}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setActiveImageIndex((prev) => (prev === hotel.images.length - 1 ? 0 : prev + 1))}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Hotel Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                    {hotel.brand_name && (
                      <p className="text-lg text-gray-600 mb-2">{hotel.brand_name}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{hotel.location}</span>
                      </div>
                      {hotel.hotel_class && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span>{hotel.hotel_class} Star</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {hotel.labels && hotel.labels.length > 0 && (
                      <div className="flex gap-2">
                        {hotel.labels.map((label, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              label.slug === 'reserve' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {label.text}
                          </span>
                        ))}
                      </div>
                    )}
                    {hotel.average_review_rating && (
                      <div className="flex items-center gap-1">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.round(hotel.average_review_rating!) ? 'fill-current' : 'fill-gray-300'}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {hotel.average_review_rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({hotel.total_review_count} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {hotel.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                    <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
                  </div>
                )}

                {/* Awards */}
                {hotel.awards && hotel.awards.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Awards & Recognition</h3>
                    <div className="flex flex-wrap gap-2">
                      {hotel.awards.map((award, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                        >
                          {award.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                    <div className="space-y-2">
                      {hotel.contact_info.phones.map((phone, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-700">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{phone.number}</span>
                        </div>
                      ))}
                      {hotel.url_link && (
                        <a
                          href={hotel.url_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span>Visit Website</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Address</h3>
                    <div className="space-y-1 text-gray-700">
                      <p>{hotel.physical_address_1}</p>
                      {hotel.physical_address_2 && <p>{hotel.physical_address_2}</p>}
                      <p>{hotel.physical_city}, {hotel.physical_state} {hotel.physical_postal_code}</p>
                      <p>{hotel.physical_country}</p>
                      {hotel.gmaps_link && (
                        <a
                          href={hotel.gmaps_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                          </svg>
                          <span>View on Google Maps</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rates Section */}
            {hotel.programs && hotel.programs.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Rates Header */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Rates</h2>
                  
                  {/* Date and Guest Selector */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{dates ? `${dates.split('-')[0]} - ${dates.split('-')[1]} (8 nights)` : 'Select dates'}</span>
                      <span>{adults} adults, {rooms} room</span>
                    </div>
                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Find rates
                    </button>
                  </div>

                  {/* Rate Program Tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {hotel.programs.map((program, index) => (
                      <div
                        key={program.id}
                        onClick={() => setSelectedProgramIndex(index)}
                        className={`flex-shrink-0 flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          index === selectedProgramIndex 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {program.logo_url && (
                            <img
                              src={program.logo_url}
                              alt={program.name}
                              className="h-6 w-auto object-contain"
                            />
                          )}
                          <span className={`text-sm font-semibold ${
                            index === selectedProgramIndex ? 'text-primary-700' : 'text-gray-700'
                          }`}>
                            {program.name}
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">Rates from</div>
                          <div className={`text-sm font-bold ${
                            index === selectedProgramIndex ? 'text-primary-700' : 'text-gray-900'
                          }`}>
                            ${(() => {
                              // Use different base rates for each program type based on commission
                              const baseRate = 1200 // Base rate
                              const commissionPercent = parseInt(program.commission.replace('%', ''))
                              // Higher commission programs typically have higher rates
                              const rateMultiplier = commissionPercent / 10
                              const calculatedRate = Math.round(baseRate * rateMultiplier)
                              return calculatedRate.toLocaleString()
                            })()}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-gray-600">Perks</span>
                            <span className="text-xs font-semibold text-green-600">{program.commission}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Selected Program Details */}
                  {hotel.programs[selectedProgramIndex] && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <a href="#" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            See {hotel.programs[selectedProgramIndex].name} perks
                          </a>
                          <span className="text-sm text-gray-600">
                            {hotel.programs[selectedProgramIndex].commission} (payout {hotel.programs[selectedProgramIndex].payout_speed.replace('payout ', '')})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <span>Onyx payer</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-0">
                  {/* Book In Portal */}
                  <div className="p-6 border-r border-gray-200 xl:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Book In Portal (3 results)</h3>
                      <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                        <option>Show rates in USD ($)</option>
                      </select>
                    </div>

                    {/* Important Notice */}
                    {hotel.programs[selectedProgramIndex] && hotel.programs[selectedProgramIndex].notice_text && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div 
                            className="text-sm text-yellow-800 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: hotel.programs[selectedProgramIndex].notice_text }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Room Options */}
                    <div className="space-y-4">
                      {(() => {
                        const selectedProgram = hotel.programs[selectedProgramIndex]
                        const baseRate = 1200
                        const commissionPercent = parseInt(selectedProgram?.commission.replace('%', '') || '10')
                        const rateMultiplier = commissionPercent / 10
                        
                        // Generate dynamic room options based on selected program
                        const roomTypes = [
                          {
                            name: "Deluxe King - floor-to-ceiling windows, antique artwork, oversized bath, double marble vanity",
                            avgRate: Math.round(baseRate * rateMultiplier * 1.2),
                            totalRate: Math.round(baseRate * rateMultiplier * 1.2 * 8 * 1.15), // 8 nights + 15% taxes
                            commission: selectedProgram?.commission || "10%"
                          },
                          {
                            name: "Junior Suite Double - mountain views, floor-to-ceiling windows, idyllic decor, oversized tub, double vanity",
                            avgRate: Math.round(baseRate * rateMultiplier * 1.6),
                            totalRate: Math.round(baseRate * rateMultiplier * 1.6 * 8 * 1.15),
                            commission: selectedProgram?.commission || "10%"
                          },
                          {
                            name: "Executive Suite - living room, elegant decor, dining table, wet bar, oversized tub, double vanity",
                            avgRate: Math.round(baseRate * rateMultiplier * 2.1),
                            totalRate: Math.round(baseRate * rateMultiplier * 2.1 * 8 * 1.15),
                            commission: selectedProgram?.commission || "10%"
                          }
                        ]
                        
                                                 return roomTypes.map((room, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3 text-sm">{room.name}</h4>
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="text-sm text-gray-600">Average per night</div>
                                <div className="text-lg font-bold text-gray-900">${room.avgRate.toLocaleString()}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-600">Total including taxes & fees</div>
                                <div className="text-lg font-bold text-gray-900">${room.totalRate.toLocaleString()}</div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                  {hotel.programs[selectedProgramIndex]?.name || 'Fora Reserve'}
                                </span>
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                                  Deposit Required
                                </span>
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                                  Non-refundable
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-green-600">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-semibold">{room.commission} commission</span>
                              </div>
                            </div>
                          </div>
                        ))
                      })()}
                    </div>
                  </div>

                  {/* Book Outside Portal */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Book Outside Portal</h3>
                      <a href="#" className="text-primary-600 hover:text-primary-700 text-sm">
                        When should I book outside Portal?
                      </a>
                    </div>

                    {/* IATA Information */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Use Fora's IATA to earn commission</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Input this number into the IATA field to earn commission (all other fields will not be accepted).
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-bold text-gray-900">33520476</span>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Booking Instructions */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Booking Instructions</h4>
                                                 <div className="text-sm text-gray-700 space-y-2">
                           <p>All {hotel.programs[selectedProgramIndex]?.name || 'Fora Reserve'} rates should be booked within Portal.</p>
                          <p>Please contact the property's reservations team directly and mention you are a Fora advisor wishing to book Reserve rates should you wish to make a booking off Portal.</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">What to do after booking outside Portal</h4>
                        <div className="text-sm text-gray-700">
                          <p>Email your booking confirmation to <span className="font-mono text-primary-600">submit@fora.travel</span>, then complete your submission on the Bookings page in Portal.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Year Bookings</span>
                  <span className="font-semibold text-gray-900">{hotel.last_year_booking_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Year Advisors</span>
                  <span className="font-semibold text-gray-900">{hotel.last_year_advisor_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">All Time Bookings</span>
                  <span className="font-semibold text-gray-900">{hotel.all_time_booking_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">All Time Advisors</span>
                  <span className="font-semibold text-gray-900">{hotel.all_time_advisor_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Commission Range</span>
                  <span className="font-semibold text-green-600">{hotel.commission_range}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {hotel.is_bookable && (
                  <button className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:transform active:scale-95">
                    Book Now
                  </button>
                )}
                {hotel.gmaps_link && (
                  <a
                    href={hotel.gmaps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    View on Map
                  </a>
                )}
                {hotel.fora_travel_url && (
                  <a
                    href={hotel.fora_travel_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-3 rounded-xl font-medium transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View on Fora
                  </a>
                )}
              </div>
            </div>

            {/* Hotel Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-gray-900">{hotel.luxe_category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Brand Group</span>
                  <span className="font-medium text-gray-900">{hotel.brand_group}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">All Inclusive</span>
                  <span className="font-medium text-gray-900">{hotel.all_inclusive ? 'Yes' : 'No'}</span>
                </div>
                {hotel.neighborhood && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Neighborhood</span>
                    <span className="font-medium text-gray-900">{hotel.neighborhood}</span>
                  </div>
                )}
                {hotel.loyalty_program && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loyalty Program</span>
                    <span className="font-medium text-gray-900">
                      {hotel.loyalty_program.name}
                      {hotel.loyalty_program.signup_link && (
                        <>
                          {" "}
                          <a href={hotel.loyalty_program.signup_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-1">Sign up</a>
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 