'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { ApiService } from '../../services/api'
import { HotelRatesResponse, HotelRate, HotelRateProgram } from '../../types/hotel'
import BookingDetailsSidebar from '../../components/BookingDetailsSidebar'
import PerksPopup from '../../components/PerksPopup'

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
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)
  const [selectedProgramIndex, setSelectedProgramIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [showFullGallery, setShowFullGallery] = useState(false)
  const [visibleImages, setVisibleImages] = useState<Set<number>>(new Set())
  
  // New state for rates
  const [hotelRates, setHotelRates] = useState<HotelRatesResponse | null>(null)
  const [loadingRates, setLoadingRates] = useState(false)
  const [ratesError, setRatesError] = useState<string | null>(null)
  const [selectedRate, setSelectedRate] = useState<HotelRate | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<HotelRateProgram | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isPerksPopupOpen, setIsPerksPopupOpen] = useState(false)

  const hotelId = params.id as string
  const currency = searchParams.get('currency') || 'USD'
  const startDate = searchParams.get('start_date') || ''
  const endDate = searchParams.get('end_date') || ''
  const adults = searchParams.get('adults') || '2'
  const children_ages = searchParams.get('children_ages') || ''
  const rooms = searchParams.get('rooms') || '1'

  // Debug: Log the date parsing

  
  // Ensure we have valid dates for the API
  const hasValidDates = startDate && endDate && startDate.length === 10 && endDate.length === 10

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set(prev).add(index))
  }

  const getImageSize = (index: number, totalImages: number) => {
    if (totalImages <= 4) {
      return index === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'
    }
    
    if (index === 0) return 'col-span-2 row-span-2'
    if (index === 1) return 'col-span-1 row-span-1'
    if (index === 2) return 'col-span-1 row-span-1'
    if (index === 3) return 'col-span-2 row-span-1'
    return 'col-span-1 row-span-1'
  }

  // Intersection Observer for lazy loading individual images
  useEffect(() => {
    if (!hotel?.images) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0')
            setVisibleImages(prev => new Set(prev).add(index))
            observer.unobserve(entry.target)
          }
        })
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Start loading 50px before image comes into view
      }
    )

    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      const imageContainers = document.querySelectorAll('[data-image-container]')
      imageContainers.forEach(container => {
        observer.observe(container)
      })
    }, 100)

    return () => observer.disconnect()
  }, [hotel?.images, showFullGallery])

  // Alternative approach: Load images when they become visible in the viewport
  useEffect(() => {
    if (!hotel?.images) return

    const handleScroll = () => {
      const imageContainers = document.querySelectorAll('[data-image-container]')
      imageContainers.forEach((container, index) => {
        if (visibleImages.has(index)) return // Skip already visible images
        
        const rect = container.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight + 100 && rect.bottom > 0
        
        if (isVisible) {
          setVisibleImages(prev => new Set(prev).add(index))
        }
      })
    }

    // Initial check
    handleScroll()
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hotel?.images, visibleImages])

  // Load first few images immediately
  useEffect(() => {
    if (hotel?.images) {
      const initialImages = hotel.images.slice(0, 4)
      initialImages.forEach((_, index) => {
        setTimeout(() => {
          setVisibleImages(prev => new Set(prev).add(index))
        }, index * 100) // Stagger loading
      })
    }
  }, [hotel?.images])

  // Keyboard support for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeImageIndex !== null && hotel?.images) {
        if (e.key === 'Escape') {
          setActiveImageIndex(null)
        } else if (e.key === 'ArrowLeft') {
          setActiveImageIndex(activeImageIndex === 0 ? hotel.images.length - 1 : activeImageIndex - 1)
        } else if (e.key === 'ArrowRight') {
          setActiveImageIndex(activeImageIndex === hotel.images.length - 1 ? 0 : activeImageIndex + 1)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeImageIndex, hotel?.images])

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setLoading(true)
        const hotelDetailsParams = {
          currency,
          start_date: startDate,
          end_date: endDate,
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

    const fetchHotelRates = async () => {
      if (!hasValidDates) return
      
      try {
        setLoadingRates(true)
        setRatesError(null)
        
        const ratesParams = {
          number_of_adults: parseInt(adults),
          rooms: parseInt(rooms),
          currency,
          start_date: startDate,
          end_date: endDate
        }
        
        const rates = await ApiService.fetchHotelRates(hotelId, ratesParams)
        setHotelRates(rates)
      } catch (err) {
        setRatesError(err instanceof Error ? err.message : 'Failed to load hotel rates')
      } finally {
        setLoadingRates(false)
      }
    }

    if (hotelId) {
      fetchHotelDetails()
      fetchHotelRates()
    }
  }, [hotelId, currency, adults, children_ages, rooms, startDate, endDate])

  const handleRateClick = (rate: HotelRate, program: HotelRateProgram) => {
    setSelectedRate(rate)
    setSelectedProgram(program)
    setIsSidebarOpen(true)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
    setSelectedRate(null)
    setSelectedProgram(null)
  }

  const openPerksPopup = () => {
    setIsPerksPopupOpen(true)
  }

  const closePerksPopup = () => {
    setIsPerksPopupOpen(false)
  }

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
                {hasValidDates ? `${startDate} - ${endDate} • ${adults} adults` : 'Select dates'}
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
              <div className="relative">
                {hotel.images && hotel.images.length > 0 ? (
                  <>
                    {/* Main Gallery Grid */}
                    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-2 p-4 ${showFullGallery ? 'h-auto' : 'h-96 overflow-hidden'}`}>
                      {hotel.images.slice(0, showFullGallery ? hotel.images.length : 8).map((image, index) => (
                        <div
                          key={index}
                          data-image-container
                          data-index={index}
                          className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 ${
                            index === 0 ? 'col-span-2 row-span-2' : 
                            index === 1 ? 'col-span-1 row-span-1' :
                            index === 2 ? 'col-span-1 row-span-1' :
                            index === 3 ? 'col-span-2 row-span-1' :
                            'col-span-1 row-span-1'
                          }`}
                          onClick={() => setActiveImageIndex(index)}
                        >
                          <div className="relative w-full h-full min-h-[200px] bg-gray-200 rounded-lg overflow-hidden">
                            {visibleImages.has(index) ? (
                              <img
                                src={`https://media.fora.travel/foratravelportal/image/upload/c_fill,w_800,h_600,g_auto/f_auto/q_auto/v1/${image.public_id}`}
                                alt={image.caption || hotel.name}
                                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                                onLoad={() => handleImageLoad(index)}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  handleImageLoad(index)
                                }}
                              />
                            ) : (
                              <div className="w-full h-full animate-pulse bg-gray-300 rounded-lg"></div>
                            )}
                            
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg">
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                                  View
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* View All Button */}
                    {hotel.images.length > 8 && (
                      <div className="p-4 border-t border-gray-100">
                        <button
                          onClick={() => setShowFullGallery(!showFullGallery)}
                          className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {showFullGallery ? `Show Less (${hotel.images.length} photos)` : `View All ${hotel.images.length} Photos`}
                        </button>
                      </div>
                    )}

                    {/* Full Screen Modal */}
                    {activeImageIndex !== null && (
                      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                        <div className="relative max-w-7xl max-h-full">
                          <img
                            src={`https://media.fora.travel/foratravelportal/image/upload/c_fill,w_1200,h_800,g_auto/f_auto/q_auto/v1/${hotel.images[activeImageIndex].public_id}`}
                            alt={hotel.images[activeImageIndex].caption || hotel.name}
                            className="max-w-full max-h-full object-contain rounded-lg"
                          />
                          
                          {/* Close Button */}
                          <button
                            onClick={() => setActiveImageIndex(null)}
                            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition-colors"
                          >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>

                          {/* Navigation Buttons */}
                          {hotel.images.length > 1 && (
                            <>
                              <button
                                onClick={() => setActiveImageIndex(activeImageIndex === 0 ? hotel.images.length - 1 : activeImageIndex - 1)}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-colors"
                              >
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setActiveImageIndex(activeImageIndex === hotel.images.length - 1 ? 0 : activeImageIndex + 1)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-colors"
                              >
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </>
                          )}

                          {/* Image Counter */}
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
                            {activeImageIndex + 1} of {hotel.images.length}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-400">
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
                      <span>{hasValidDates ? `${startDate} - ${endDate}` : 'Select dates'}</span>
                      <span>{adults} adults, {rooms} room</span>
                    </div>
                    {loadingRates && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading rates...
                      </div>
                    )}
                  </div>

                  {/* Rate Program Tabs */}
                  {(() => {
                    // Use real rates data if available, otherwise fall back to hotel programs
                    const programsToShow = hotelRates?.programs || hotel.programs;
                    
                    if (!programsToShow || programsToShow.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-500">
                          {ratesError ? `Error loading rates: ${ratesError}` : 'No rates available'}
                        </div>
                      );
                    }

                    // Find the index of Virtuoso in the programs array
                    const virtuosoIndex = programsToShow.findIndex(
                      (program) => program.name === 'Virtuoso'
                    );
                    // If Virtuoso is present, show all programs up to and including Virtuoso
                    // If not, show only the first program
                    const displayPrograms =
                      virtuosoIndex !== -1
                        ? programsToShow.slice(0, virtuosoIndex + 1)
                        : programsToShow.slice(0, 1);

                    return (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {displayPrograms.map((program, index) => {
                          // The index here is relative to displayPrograms, so we need to map it to the original index for selection
                          const originalIndex =
                            virtuosoIndex !== -1 ? index : 0;
                          
                          // Get the lowest rate for this program
                          const lowestRate = hotelRates?.programs?.[originalIndex]?.rates?.[0]?.price?.avg_per_night?.total;
                          
                          return (
                            <div
                              key={program.id}
                              onClick={() => setSelectedProgramIndex(originalIndex)}
                              className={`flex-shrink-0 flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                originalIndex === selectedProgramIndex
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {program.name === 'Fora Reserve' ? (
                                  <svg className="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
                                  </svg>
                                ) : program.logo_url && (
                                  <img
                                    src={program.logo_url}
                                    alt={program.name}
                                    className="h-6 w-auto object-contain"
                                  />
                                )}
                                <span className={`text-sm font-semibold ${
                                  originalIndex === selectedProgramIndex ? 'text-primary-700' : 'text-gray-700'
                                }`}>
                                  {program.name === 'Fora Reserve' ? 'Reserve' : program.name}
                                </span>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-gray-500 mb-1">Rates from</div>
                                <div className={`text-sm font-bold ${
                                  originalIndex === selectedProgramIndex ? 'text-primary-700' : 'text-gray-900'
                                }`}>
                                  {lowestRate ? `$${lowestRate.toLocaleString()}` : 'N/A'}
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
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* Selected Program Details */}
                  {(() => {
                    const programsToShow = hotelRates?.programs || hotel.programs;
                    const selectedProgram = programsToShow?.[selectedProgramIndex];
                    
                    if (!selectedProgram) return null;
                    
                    // Check if this is a HotelRateProgram (has rates) or regular program
                    const ratesCount = 'rates' in selectedProgram ? selectedProgram.rates?.length || 0 : 0;
                    
                    return (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {selectedProgram.typical_perks && (
                              <button 
                                onClick={openPerksPopup}
                                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                              >
                                See {(selectedProgram.name === 'Fora Reserve' ? 'Reserve' : selectedProgram.name)} perks
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                    );
                  })()}
                </div>

                {/* Main Content Area */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {(() => {
                        const programsToShow = hotelRates?.programs || hotel.programs;
                        const selectedProgram = programsToShow?.[selectedProgramIndex];
                        const ratesCount = 'rates' in selectedProgram ? selectedProgram.rates?.length || 0 : 0;
                        return `Available Rates (${ratesCount} results)`;
                      })()}
                    </h3>
                    <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                      <option>Show rates in {currency} ({currency})</option>
                    </select>
                  </div>

                  {/* Room Options */}
                  <div className="space-y-4">
                    {(() => {
                      const programsToShow = hotelRates?.programs || hotel.programs;
                      const selectedProgram = programsToShow?.[selectedProgramIndex];
                      
                      if (!selectedProgram || !('rates' in selectedProgram) || !selectedProgram.rates) {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            {loadingRates ? 'Loading rates...' : 'No rates available for this program'}
                          </div>
                        );
                      }
                      
                      return selectedProgram.rates.map((rate, index) => {
                        const formatCurrency = (amount: number, currency: string) => {
                          return new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: currency,
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(amount)
                        }
                        
                        const totalPrice = rate.price.grand_total_items.find(item => item.category === 'grand_total')?.total || 0;
                        const isRefundable = rate.policies.cancellations.some(policy => policy.refundable);
                        
                        return (
                          <div 
                            key={rate.id} 
                            className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => handleRateClick(rate, selectedProgram)}
                          >
                            <h4 className="font-semibold text-gray-900 mb-3 text-sm">{rate.room.description}</h4>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="text-sm text-gray-600">Average per night</div>
                                <div className="text-lg font-bold text-gray-900">
                                  {formatCurrency(rate.price.avg_per_night.total, rate.price.avg_per_night.currency)}
                                </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Total including taxes & fees</div>
                                <div className="text-lg font-bold text-gray-900">
                                  {formatCurrency(totalPrice, rate.price.avg_per_night.currency)}
                                </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                  {(selectedProgram.name === 'Fora Reserve' || !selectedProgram.name)
                                  ? 'Reserve'
                                    : selectedProgram.name}
                              </span>
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                                  {rate.price.payment_type_slug}
                              </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                  isRefundable 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {isRefundable ? 'Refundable' : 'Non-refundable'}
                              </span>
                            </div>
                              <div className="text-sm text-gray-600">
                                Commission: {rate.commission.expected_commission_percent}%
                          </div>
                        </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

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

      {/* Booking Details Sidebar */}
      <BookingDetailsSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        selectedRate={selectedRate}
        program={selectedProgram}
        hotelName={hotel?.name || ''}
        hotelId={hotelId}
        startDate={startDate}
        endDate={endDate}
        adults={adults}
        rooms={rooms}
        cartId={hotelRates?.cart_id}
      />

      {/* Perks Popup */}
      <PerksPopup
        isOpen={isPerksPopupOpen}
        onClose={closePerksPopup}
        program={(() => {
          const programsToShow = hotelRates?.programs || hotel.programs;
          const selectedProgram = programsToShow?.[selectedProgramIndex];
          // Only pass if it's a HotelRateProgram (has rates property)
          return 'rates' in selectedProgram ? selectedProgram : null;
        })()}
      />
    </div>
  )
} 