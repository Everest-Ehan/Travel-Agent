'use client'

import React, { useState } from 'react'
import { Hotel } from './types/hotel'
import { ApiService } from './services/api'
import HotelCard from './components/HotelCard'

export default function Home() {
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

  const searchHotels = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError('')

    try {
      // Search for hotels
      const hotels = await ApiService.searchHotels(searchQuery)
      
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
          
          {/* Search Interface */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Where */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Where</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Destination or hotel name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                {/* When */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">When</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={filters.start_date}
                      onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="date"
                      value={filters.end_date}
                      onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                
                {/* Who */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Who</label>
                  <div className="flex gap-2">
                    <select
                      value={filters.adults}
                      onChange={(e) => setFilters({...filters, adults: parseInt(e.target.value)})}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'adult' : 'adults'}</option>
                      ))}
                    </select>
                    <select
                      value={filters.rooms}
                      onChange={(e) => setFilters({...filters, rooms: parseInt(e.target.value)})}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {[1,2,3,4,5].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'room' : 'rooms'}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Search Button */}
                <div className="flex items-end">
                  <button
                    onClick={searchHotels}
                    disabled={loading}
                    className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
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
              
              {/* Currency and View Options */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Currency:</span>
                    <select
                      value={filters.currency}
                      onChange={(e) => setFilters({...filters, currency: e.target.value})}
                      className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">View:</span>
                  <button
                    onClick={() => setFilters({...filters, view_mode: 'list'})}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      filters.view_mode === 'list' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setFilters({...filters, view_mode: 'map'})}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      filters.view_mode === 'map' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Map
                  </button>
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
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-900">
              Search Results ({hotels.length} hotels found)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
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