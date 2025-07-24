'use client'

import React, { useState, useEffect } from 'react'
import { Hotel } from './types/hotel'
import { ApiService } from './services/api'
import { useRouter } from 'next/navigation'
import HotelCard from './components/HotelCard'

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('')
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Search filters state
  const [filters, setFilters] = useState({
    adults: 2,
    children_ages: [] as number[],
    currency: 'USD',
    start_date: '2025-08-14',
    end_date: '2025-08-22',
    rooms: 1,
    view_mode: 'list',
    supplierType: 'hotels'
  })

  // Restore hotels from localStorage on mount
  useEffect(() => {
    const savedHotels = localStorage.getItem('hotels');
    const savedQuery = localStorage.getItem('searchQuery');
    if (savedHotels) setHotels(JSON.parse(savedHotels));
    if (savedQuery) setSearchQuery(savedQuery);
  }, []);

  // Save hotels to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('hotels', JSON.stringify(hotels));
    localStorage.setItem('searchQuery', searchQuery);
  }, [hotels, searchQuery]);

  const searchHotels = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError('')

    try {
      // Search for hotels
      const hotels = await ApiService.searchHotels(searchQuery)
      console.log('Hotels fetched from API:', hotels)
      // Get rates for the hotels (in batches of 10 due to API limit)
      if (hotels.length > 0) {
        const hotelIds = hotels.map(hotel => hotel.id)
        const batchSize = 10
        const rateBatches = []
        
        for (let i = 0; i < hotelIds.length; i += batchSize) {
          const batch = hotelIds.slice(i, i + batchSize)
          rateBatches.push(batch)
        }
        
        let allRates: any[] = []
        
        for (const batch of rateBatches) {
          const rateRequest = {
            currency: filters.currency,
            number_of_adults: filters.adults,
            children_ages: filters.children_ages,
            start_date: filters.start_date,
            end_date: filters.end_date,
            supplier_ids: batch,
            filters: {}
          }

          try {
            const rateResponse = await ApiService.getRateSummary(rateRequest)
            console.log('Rate response for batch', batch, ':', rateResponse)
            if (rateResponse.data) {
              allRates.push(...rateResponse.data)
            }
          } catch (rateError) {
            console.warn('Failed to fetch rates for batch:', rateError)
          }
        }
        
        // Merge rates with hotels
        const hotelsWithRates = hotels.map(hotel => {
          const rate = allRates.find(r => r.id === hotel.id)
          return {
            ...hotel,
            rate: rate || undefined
          }
        })
        console.log('Hotels with merged rates:', hotelsWithRates)
        setHotels(hotelsWithRates)
      } else {
        setHotels([])
      }
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

  const handleCardClick = async (hotel: Hotel) => {
    const hotelDetailsParams = {
      currency: filters.currency,
      dates: `${filters.start_date}-${filters.end_date}`,
      adults: filters.adults,
      children_ages: filters.children_ages?.join(',') || '',
      rooms: filters.rooms,
    };
    try {
      const details = await ApiService.fetchHotelDetails(hotel.id, hotelDetailsParams);
      console.log('Hotel details received:', details);
      // Navigate to details page with hotel id and params
      router.push(`/hotel/${hotel.id}?${new URLSearchParams(hotelDetailsParams as any).toString()}`);
    } catch (err) {
      console.error('Error in hotel details request:', err);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Search Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Hotel
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Discover amazing hotels and destinations around the world
          </p>
          
                {/* Enhanced Search Interface */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Main Search Bar */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Where */}
              <div className="lg:col-span-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Where
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Destination, hotel, or landmark"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all duration-200 text-lg"
                />
              </div>
              
              {/* When */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  When
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all duration-200"
                  />
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all duration-200"
                  />
                </div>
              </div>
              
              {/* Who */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Who
                </label>
                <div className="space-y-2">
                  <select
                    value={filters.adults}
                    onChange={(e) => setFilters({...filters, adults: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all duration-200"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'adult' : 'adults'}</option>
                    ))}
                  </select>
                  <select
                    value={filters.rooms}
                    onChange={(e) => setFilters({...filters, rooms: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all duration-200"
                  >
                    {[1,2,3,4,5].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'room' : 'rooms'}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Search Button */}
              <div className="lg:col-span-2 flex items-end">
                <button
                  onClick={searchHotels}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Enhanced Options Bar */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Currency
                  <select
                    value={filters.currency}
                    onChange={(e) => setFilters({...filters, currency: e.target.value})}
                    className="ml-2 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">View:</span>
                <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                  <button
                    onClick={() => setFilters({...filters, view_mode: 'list'})}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      filters.view_mode === 'list' 
                        ? 'bg-primary-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    List
                  </button>
                  <button
                    onClick={() => setFilters({...filters, view_mode: 'map'})}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      filters.view_mode === 'map' 
                        ? 'bg-primary-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                    </svg>
                    Map
                  </button>
                </div>
              </div>
            </div>
          </div>
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
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">
                  Search Results
                </h3>
                <p className="text-gray-600 mt-1">
                  {hotels.length} {hotels.length === 1 ? 'hotel' : 'hotels'} found
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Rates updated just now</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} filters={filters} onClick={() => handleCardClick(hotel)} />
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

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-primary-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg font-semibold text-primary-700">Loading hotels...</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16 w-full mt-auto">
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