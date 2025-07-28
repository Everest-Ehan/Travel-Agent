'use client'

import React, { useState, useEffect } from 'react'
import { Hotel } from './types/hotel'
import { ApiService } from './services/api'
import { useRouter } from 'next/navigation'
import HotelCard from './components/HotelCard'
import { useAuth } from './contexts/AuthContext'
import UserProfile from './components/auth/UserProfile'
import EmailVerificationBanner from './components/auth/EmailVerificationBanner'
import SignUpPopup from './components/auth/SignUpPopup'

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Debug authentication state
  console.log('Auth state:', { user: !!user, authLoading, userDetails: user });
  const [searchQuery, setSearchQuery] = useState('')
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingRates, setLoadingRates] = useState<{ [key: string]: boolean }>({})
  const [loadingCard, setLoadingCard] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [showSignUpPopup, setShowSignUpPopup] = useState(false)
  
          // Search filters state
        const [filters, setFilters] = useState({
          adults: 2,
          children_ages: [] as number[],
          currency: 'USD',
          start_date: '2025-08-14',
          end_date: '2025-08-22',
          rooms: 1,
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
    setLoadingRates({})

    try {
      // First, search for hotels and display them immediately
      const hotels = await ApiService.searchHotels(searchQuery)
      
      // Set hotels immediately without rates
      const hotelsWithoutRates = hotels.map(hotel => ({
        ...hotel,
        rate: undefined
      }))
      setHotels(hotelsWithoutRates)
      
      // Now fetch rates progressively
      if (hotels.length > 0) {
        const hotelIds = hotels.map(hotel => hotel.id)
        const batchSize = 10
        const rateBatches = []
        
        for (let i = 0; i < hotelIds.length; i += batchSize) {
          const batch = hotelIds.slice(i, i + batchSize)
          rateBatches.push(batch)
        }
        
        // Set loading state for all hotels
        const initialLoadingState: { [key: string]: boolean } = {}
        hotelIds.forEach(id => {
          initialLoadingState[id] = true
        })
        setLoadingRates(initialLoadingState)
        
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
              
              // Update hotels with rates as they come in
              const updatedHotels = hotelsWithoutRates.map(hotel => {
                const rate = allRates.find(r => r.id === hotel.id)
                return {
                  ...hotel,
                  rate: rate || undefined
                }
              })
              setHotels(updatedHotels)
              
              // Update loading states for this batch
              const updatedLoadingState = { ...loadingRates }
              batch.forEach(id => {
                updatedLoadingState[id] = false
              })
              setLoadingRates(updatedLoadingState)
            }
          } catch (rateError) {
            console.warn('Failed to fetch rates for batch:', rateError)
            // Mark this batch as not loading even if it failed
            const updatedLoadingState = { ...loadingRates }
            batch.forEach(id => {
              updatedLoadingState[id] = false
            })
            setLoadingRates(updatedLoadingState)
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
    console.log('Card clicked for hotel:', hotel.id, 'User authenticated:', !!user);
    
    // Check if user is authenticated
    if (!user) {
      console.log('User not authenticated, showing signup popup');
      // Show signup popup instead of redirecting
      setShowSignUpPopup(true);
      return;
    }
    
    console.log('User authenticated, proceeding to fetch hotel details');
    setLoadingCard(hotel.id)
    
    const hotelDetailsParams = {
      currency: filters.currency,
      start_date: filters.start_date,
      end_date: filters.end_date,
      adults: filters.adults,
      children_ages: filters.children_ages?.join(',') || '',
      rooms: filters.rooms,
    };
    
    console.log('Hotel details params:', hotelDetailsParams);
    
    try {
      const details = await ApiService.fetchHotelDetails(hotel.id, hotelDetailsParams);
      console.log('Hotel details received:', details);
      
      const url = `/hotel/${hotel.id}?${new URLSearchParams(hotelDetailsParams as any).toString()}`;
      console.log('Navigating to:', url);
      
      // Navigate to details page with hotel id and params
      // Try using window.location.href as a fallback if router.push doesn't work
      try {
        router.push(url);
      } catch (routerError) {
        console.error('Router push failed, using window.location:', routerError);
        window.location.href = url;
      }
    } catch (err) {
      console.error('Error in hotel details request:', err);
      setLoadingCard(null) // Clear loading on error
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Email Verification Banner */}
      <EmailVerificationBanner />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Travel Agent</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-500 hover:text-gray-900">Hotels</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">Destinations</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">About</a>
              {user && (
                <a href="/dashboard" className="text-gray-500 hover:text-gray-900">Dashboard</a>
              )}
            </nav>
            <div className="flex items-center space-x-4">
              {authLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              ) : user ? (
                <UserProfile />
              ) : (
                <a
                  href="/auth"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Sign In
                </a>
              )}
            </div>
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
                      className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg active:transform active:scale-95 disabled:transform-none"
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
        {loading && hotels.length === 0 ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">
                  Searching Hotels...
                </h3>
                <p className="text-gray-600 mt-1">
                  Finding the best hotels for your search
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-primary-600">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading hotels...</span>
                </div>
              </div>
            </div>
            
            {/* Skeleton Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                  {/* Skeleton Image */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse">
                    <div className="absolute top-3 left-3">
                      <div className="h-6 w-12 bg-gray-300 rounded-full animate-pulse"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-300 to-transparent">
                      <div className="h-6 bg-gray-300 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-2/3"></div>
                    </div>
                  </div>
                  
                  {/* Skeleton Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-4 w-4 bg-gray-300 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-32"></div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div key={star} className="h-3 w-3 bg-gray-300 rounded animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
                    </div>
                    
                    {/* Skeleton Rate Section */}
                    <div className="mb-4 p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="h-8 bg-gray-300 rounded animate-pulse mb-2"></div>
                          <div className="h-4 bg-gray-300 rounded animate-pulse w-2/3"></div>
                        </div>
                        <div className="text-right">
                          <div className="h-4 bg-gray-300 rounded animate-pulse w-20 mb-2"></div>
                          <div className="h-6 bg-gray-300 rounded animate-pulse w-16"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-white/70 rounded-lg p-2">
                            <div className="h-3 bg-gray-300 rounded animate-pulse mb-1"></div>
                            <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="flex-1 h-10 bg-gray-300 rounded-xl animate-pulse"></div>
                      <div className="w-12 h-10 bg-gray-300 rounded-xl animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : hotels.length > 0 && (
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
                <HotelCard 
                  key={hotel.id} 
                  hotel={hotel} 
                  filters={filters} 
                  onClick={() => handleCardClick(hotel)} 
                  loadingRate={loadingRates[hotel.id] || false}
                  loadingCard={loadingCard === hotel.id}
                  />
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
      <footer className="bg-gray-900 text-white py-12 mt-16 w-full mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 Fora Travel. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Sign Up Popup */}
      <SignUpPopup 
        isOpen={showSignUpPopup} 
        onClose={() => setShowSignUpPopup(false)} 
      />
    </div>
  )
} 