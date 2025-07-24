'use client'

import React, { useState } from 'react'

interface Hotel {
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
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const searchHotels = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`http://localhost:8000/api/search?query=${encodeURIComponent(searchQuery)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to search hotels')
      }

      const data = await response.json()
      
      // Transform the API response to match our Hotel interface
      const transformedHotels = data.results?.map((hotel: any) => ({
        id: hotel.id,
        name: hotel.name,
        location: hotel.location,
        hotel_class: hotel.hotel_class,
        is_bookable: hotel.is_bookable,
        labels: hotel.labels,
        images: hotel.images,
        programs: hotel.programs,
        brand_name: hotel.brand_name,
        brand_group: hotel.brand_group,
        average_review_rating: hotel.average_review_rating,
        total_review_count: hotel.total_review_count,
        awards: hotel.awards,
        commission_range: hotel.commission_range,
        payout_speed: hotel.payout_speed,
        last_year_booking_count: hotel.last_year_booking_count,
        all_time_booking_count: hotel.all_time_booking_count,
        gmaps_link: hotel.gmaps_link,
        coordinates: hotel.coordinates
      })) || []

      setHotels(transformedHotels)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setHotels([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchHotels()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Fora Travel</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-500 hover:text-gray-900">Hotels</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">Destinations</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">About</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Hotel
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Discover amazing hotels and destinations around the world
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex shadow-lg rounded-lg overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search for hotels, destinations, or cities..."
                className="flex-1 px-6 py-4 text-lg border-0 focus:outline-none focus:ring-0"
              />
              <button
                onClick={searchHotels}
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-8 py-4 font-semibold transition-colors duration-200"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {hotels.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-900">
              Search Results ({hotels.length} hotels found)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <div key={hotel.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  {/* Hotel Image */}
                  {hotel.images && hotel.images.length > 0 && (
                    <div className="relative h-48 bg-gray-200">
                      <img
                        src={`https://media.fora.travel/foratravelportal/image/upload/c_fill,w_400,h_300,g_auto/f_auto/q_auto/v1/${hotel.images[0].public_id}`}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      {/* Hotel Class Badge */}
                      {hotel.hotel_class && (
                        <div className="absolute top-3 left-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-semibold">
                          {hotel.hotel_class}★
                        </div>
                      )}
                      {/* Labels */}
                      {hotel.labels && hotel.labels.length > 0 && (
                        <div className="absolute top-3 right-3 flex flex-col gap-1">
                          {hotel.labels.slice(0, 2).map((label, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                label.slug === 'reserve' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-green-600 text-white'
                              }`}
                            >
                              {label.text}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Hotel Name and Brand */}
                    <div className="mb-3">
                      <h4 className="text-xl font-bold text-gray-900 mb-1">
                        {hotel.name}
                      </h4>
                      {hotel.brand_name && (
                        <p className="text-sm text-gray-500 font-medium">
                          {hotel.brand_name}
                        </p>
                      )}
                    </div>
                    
                    {/* Location */}
                    <p className="text-gray-600 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {hotel.location}
                    </p>
                    
                    {/* Rating */}
                    {hotel.average_review_rating && (
                      <div className="flex items-center mb-3">
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
                        <span className="ml-2 text-sm text-gray-600">
                          {hotel.average_review_rating.toFixed(1)} ({hotel.total_review_count} reviews)
                        </span>
                      </div>
                    )}
                    
                    {/* Awards */}
                    {hotel.awards && hotel.awards.length > 0 && (
                      <div className="mb-3">
                        {hotel.awards.map((award, index) => (
                          <span
                            key={index}
                            className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-2 mb-1"
                          >
                            {award.label}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Programs */}
                    {hotel.programs && hotel.programs.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {hotel.programs.slice(0, 3).map((program, index) => (
                            <img
                              key={index}
                              src={program.logo_url}
                              alt={program.name}
                              className="h-6 w-auto object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      {hotel.commission_range && (
                        <div className="text-gray-600">
                          <span className="font-medium">Commission:</span> {hotel.commission_range}
                        </div>
                      )}
                      {hotel.payout_speed && (
                        <div className="text-gray-600">
                          <span className="font-medium">Payout:</span> {hotel.payout_speed}
                        </div>
                      )}
                    </div>
                    
                    {/* Booking Stats */}
                    {hotel.last_year_booking_count && (
                      <div className="text-xs text-gray-500 mb-4">
                        {hotel.last_year_booking_count} bookings last year
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {hotel.is_bookable && (
                        <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                          Book Now
                        </button>
                      )}
                      {hotel.gmaps_link && (
                        <a
                          href={hotel.gmaps_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && hotels.length === 0 && searchQuery && !error && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hotels found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search terms or browse our popular destinations
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 Fora Travel. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 