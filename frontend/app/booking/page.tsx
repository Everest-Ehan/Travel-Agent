'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ApiService } from '../services/api'
import { HotelRate, HotelRateProgram } from '../types/hotel'
import { ClientCard } from '../types/auth'
import { useAuth } from '../contexts/AuthContext'
import SeleniumCardForm from '../components/SeleniumCardForm'
import CardRevealModal from '../components/CardRevealModal'

interface Client {
  id: string
  first_name: string
  last_name: string
  emails: Array<{
    email: string
    email_type: string
  }>
  phone_numbers: Array<{
    phone_number: string
    number_type: string
  }>
  addresses: Array<{
    label: string
    country_id: string | null
    country_name: string
    state: string
    city: string
    address: string
  }>
}

interface BookingRequest {
  booking_code: string
  cart_id: string
  children_ages: number[]
  client_card_id: string
  client_id: string
  client_loyalty_program_id: string | null
  currency: string
  deposits: any[]
  end_date: string
  expected_amount: number
  expected_currency: string
  number_of_adults: number
  program_id: string
  rate_code: string
  rate_id: string
  room_description: string
  start_date: string
  supplier_id: string
  supplier_program_id: string
  trip_id: string | null
  trip_name: string
  use_advisor_contact_info: boolean
  billing_address?: {
    address_1: string
    address_2?: string
    postal_code: string
    city: string
    state: string
    country_id: number
  }
}

export default function BookingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, userClient, clientLoading } = useAuth()
  
  // State for client cards
  const [clientCards, setClientCards] = useState<ClientCard[]>([])
  const [loadingCards, setLoadingCards] = useState(false)
  const [selectedCard, setSelectedCard] = useState<ClientCard | null>(null)
  const [showAddCardForm, setShowAddCardForm] = useState(false)
  
  // State for card reveal functionality
  const [revealedCards, setRevealedCards] = useState<{ [cardId: string]: any }>({})
  const [revealingCard, setRevealingCard] = useState<string | null>(null)
  
  // State for modal
  const [showRevealModal, setShowRevealModal] = useState(false)
  const [selectedRevealedCard, setSelectedRevealedCard] = useState<{ cardData: any; cardInfo: any } | null>(null)
  
  // State for booking
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  
  // State for trips
  const [trips, setTrips] = useState<any[]>([])
  const [loadingTrips, setLoadingTrips] = useState(false)
  const [selectedTripType, setSelectedTripType] = useState<'new' | 'existing'>('new')
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [newTripName, setNewTripName] = useState('')
  const [showTripModal, setShowTripModal] = useState(false)
  const [tripSearchQuery, setTripSearchQuery] = useState('')
  const [showPastTrips, setShowPastTrips] = useState(false)

  // Get booking data from URL params (minimal, as Fora does)
  const hotelId = searchParams.get('hotel_id') || ''
  const hotelName = searchParams.get('hotel_name') || ''
  const startDate = searchParams.get('start_date') || ''
  const endDate = searchParams.get('end_date') || ''
  const adults = searchParams.get('adults') || '2'
  const bookingCode = searchParams.get('booking_code') || ''
  const rateCode = searchParams.get('rate_code') || ''
  const rateId = searchParams.get('rate_id') || ''
  const expectedAmount = searchParams.get('expected_amount') || ''
  const expectedCurrency = searchParams.get('expected_currency') || ''
  const displayAmount = searchParams.get('display_amount') || ''
  const currency = searchParams.get('currency') || ''
  const cartId = searchParams.get('cart_id') || ''
  const supplierProgramId = searchParams.get('supplier_program_id') || ''
  const description = searchParams.get('description') || ''
  const supplierId = searchParams.get('supplier_id') || hotelId

  // Validate required fields - make cart_id and supplier_id optional since they might not be in all API responses
  const requiredFields = [hotelId, hotelName, startDate, endDate, rateCode, rateId, expectedAmount, expectedCurrency, currency, supplierProgramId]
  const missingRequiredFields = requiredFields.some(f => !f)
  
  // Check if we have either cart_id or can use hotel_id as supplier_id
  const hasCartId = !!cartId
  const hasSupplierId = !!supplierId

  // Fetch client cards and trips when user is available
  useEffect(() => {
    if (user) {
      // Use user's email to search for existing client or create a simple client object
      const userEmail = user.email
      if (userEmail) {
        // The client name format is: userEmail + " client" (as per backend logic)
        const clientName = `${userEmail} client`
        
        // Try to fetch cards and trips for this user
        fetchClientCards(userClient?.id || user.id)
        fetchTrips(userClient?.id || user.id)
      }
    } else {
      setClientCards([])
      setSelectedCard(null)
      setTrips([])
    }
  }, [user])
  
  const fetchTrips = async (clientId: string) => {
    try {
      setLoadingTrips(true)
      const data = await ApiService.fetchTrips(clientId)
      const tripsData = data.results || []
      setTrips(tripsData)
      
      // If there are existing trips, select the first active one by default
      const activeTrip = tripsData.find((trip: any) => trip.status !== 'cancelled' && trip.status !== 'completed')
      if (activeTrip) {
        setSelectedTripType('existing')
        setSelectedTripId(activeTrip.id)
      } else if (tripsData.length > 0) {
        // If no active trips, default to new trip
        setSelectedTripType('new')
        setSelectedTripId(null)
      }
    } catch (error) {
      console.error('Error fetching trips:', error)
      setTrips([])
    } finally {
      setLoadingTrips(false)
    }
  }

  const fetchClientCards = async (clientId: string) => {
    try {
      setLoadingCards(true)
    
      const response = await ApiService.getClientCards(clientId)
      setClientCards(response.results || [])
      setSelectedCard(null) // Reset selected card when client changes
    } catch (error) {
      console.error('Failed to fetch client cards:', error)
      setClientCards([])
    } finally {
      setLoadingCards(false)
    }
  }

  const handleAddCard = () => {
  
    setShowAddCardForm(true)
  }

  const handleCardCreated = () => {
  
    setShowAddCardForm(false)
    if (user) {
      fetchClientCards(userClient?.id || user.id)
    }
  }

  const handleCancelCardForm = () => {
    setShowAddCardForm(false)
  }

  const handleRevealCard = async (cardId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent card selection when clicking reveal button
    
    if (!user) {
      console.error('No user selected')
      return
    }

    // If already revealed, show the modal with existing data
    if (revealedCards[cardId]) {
      const card = clientCards.find(c => c.id === cardId)
      if (card) {
      
        setSelectedRevealedCard({
          cardData: revealedCards[cardId],
          cardInfo: card
        })
        setShowRevealModal(true)
      }
      return
    }

    try {
      setRevealingCard(cardId)
    
      
      const revealedData = await ApiService.revealClientCard(userClient?.id || user.id, cardId)
    
      
      setRevealedCards(prev => ({
        ...prev,
        [cardId]: revealedData
      }))
      
      // Show the modal with the revealed data
      const card = clientCards.find(c => c.id === cardId)
      if (card) {
      
        setSelectedRevealedCard({
          cardData: revealedData,
          cardInfo: card
        })
        setShowRevealModal(true)
      }
      
      // Show success message (you could integrate with a toast library)
    
    } catch (error) {
      console.error('❌ Error revealing card:', error)
      // Show error message to user
      const errorMessage = error instanceof Error ? error.message : 'Failed to reveal card information'
      console.error('Error:', errorMessage)
      // You could add a toast notification here or show an alert
      alert(`Error: ${errorMessage}`)
    } finally {
      setRevealingCard(null)
    }
  }



  const getCardLogo = (cardLogo: string) => {
    switch (cardLogo.toLowerCase()) {
      case 'visa':
        return '💳'
      case 'mastercard':
        return '💳'
      case 'amex':
        return '💳'
      default:
        return '💳'
    }
  }

  // Helper function to extract billing address from revealed card data
  const extractBillingAddress = (cardData: any) => {
    if (!cardData?.card_data) return undefined
    
    const card = cardData.card_data
    return {
      address_1: card.address || '',
      address_2: card.address_additional || '',
      postal_code: card.zip_code || '',
      city: card.city || '',
      state: card.state || '',
      country_id: 23 // Default to US (23) - you might want to map country names to IDs
    }
  }

  const handleCreateBooking = async () => {
    if (!user) {
      setBookingError('User information not available. Please refresh the page.')
      return
    }
    if (!selectedCard) {
      setBookingError('Please select a payment card.')
      return
    }
    
    if (!cartId) {
      setBookingError('Missing cart ID. Please go back and select a rate again.')
      return
    }
    if (missingRequiredFields) {
      setBookingError('Missing booking details. Please go back and try again.')
      return
    }
    try {
      setBookingLoading(true)
      setBookingError(null)
      
      // Get billing address from revealed card data
      let billingAddress: any = undefined
      if (revealedCards[selectedCard.id]) {
        // Use existing revealed data
        billingAddress = extractBillingAddress(revealedCards[selectedCard.id])
      } else {
        // Reveal card to get billing address
      
        const revealedData = await ApiService.revealClientCard(userClient?.id || user!.id, selectedCard.id)
        setRevealedCards(prev => ({
          ...prev,
          [selectedCard.id]: revealedData
        }))
        billingAddress = extractBillingAddress(revealedData)
      }
      
      const bookingRequest: BookingRequest = {
        booking_code: bookingCode,
        cart_id: cartId,
        children_ages: [],
        client_card_id: selectedCard.id,
        client_id: userClient?.id || user!.id,
        client_loyalty_program_id: null,
        currency: currency,
        deposits: [],
        end_date: endDate,
        expected_amount: parseFloat(expectedAmount),
        expected_currency: expectedCurrency,
        number_of_adults: parseInt(adults),
        program_id: supplierProgramId,
        rate_code: rateCode,
        rate_id: rateId,
        room_description: description || 'Standard Room',
        start_date: startDate,
        supplier_id: supplierId,
        supplier_program_id: supplierProgramId,
        trip_id: selectedTripType === 'existing' ? selectedTripId : null,
        trip_name: selectedTripType === 'existing' ? 
          (trips.find(t => t.id === selectedTripId)?.name || `${user!.email} client's ${hotelName} Trip`) :
          (newTripName || `${user!.email} client's ${hotelName} Trip`),
        use_advisor_contact_info: false,
        billing_address: billingAddress
      }
      
    
      
      
      const result = await ApiService.createBooking(bookingRequest)
      router.push(`/booking/success?booking_id=${result.id}`)
    } catch (error:any) {
      console.error('Booking error:', error)
      let errorMessage = 'Failed to create booking. Please try again.'
      
      errorMessage = error.detail
      
      
      // Handle specific price mismatch error
      if (error.detail && error.detail.includes('Price change')) {
        setBookingError('Price has changed. Please go back and refresh the rates, then try booking again.')
      } else {
        // Show the actual error detail from the API response
        setBookingError(errorMessage)
      }
    } finally {
      setBookingLoading(false)
    }
  }

  const formatCurrency = (amount: string, currency: string) => {
    const num = parseFloat(amount)
    if (isNaN(num)) return amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const calculateNights = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const nights = calculateNights()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to complete your booking.</p>
          <button
            onClick={() => router.push('/auth')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (missingRequiredFields) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Invalid Booking Data</h1>
          <p className="text-gray-600 mb-6">Some booking information is missing or invalid.</p>
          <button
            onClick={() => router.back()}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">Review your booking details and select a payment method</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Card Selection and Trip Selection */}
          <div className="space-y-6">


            {/* Trip Selection */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    Trip
                    <svg className="w-4 h-4 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </h2>
                  <button 
                    onClick={() => fetchTrips(userClient?.id || user!.id)}
                    disabled={loadingTrips}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Refresh trips"
                  >
                    <svg className={`w-5 h-5 ${loadingTrips ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Create a new trip */}
                <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTripType === 'new' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setSelectedTripType('new')}>
                  <div className="flex items-center space-x-4">
                    <input
                      type="radio"
                      checked={selectedTripType === 'new'}
                      onChange={() => setSelectedTripType('new')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {user?.email ? `${user.email} client` : 'User'}
                      </h3>
                      {selectedTripType === 'new' && (
                        <input
                          type="text"
                          value={newTripName}
                          onChange={(e) => setNewTripName(e.target.value)}
                          placeholder="Enter trip name..."
                          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        New
                      </span>
                    </div>
                  </div>
                </div>

                {/* Existing trip */}
                <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTripType === 'existing' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setSelectedTripType('existing')}>
                  <div className="flex items-center space-x-4">
                    <input
                      type="radio"
                      checked={selectedTripType === 'existing'}
                      onChange={() => setSelectedTripType('existing')}
                      className="w-4 h-4 text-blue-600"
                    />
                    {loadingTrips ? (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : trips.length > 0 ? (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        {trips[0]?.image && trips[0].image.length > 0 ? (
                          <img 
                            src={`https://media.fora.travel/foratravelportal/image/upload/c_fill,w_64,h_64,g_auto/f_auto/q_auto/v1/${trips[0].image[0].public_id}?_a=BAVAZGDW0`}
                            alt="Trip"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-trip.jpg'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {user?.email ? `${user.email} client` : 'User'}
                      </h3>
                      {trips.length > 0 && (
                        <>
                          <p className="text-sm text-gray-600">{trips[0]?.name || 'Trip'}</p>
                          <p className="text-sm text-gray-600">{trips[0]?.start_date && trips[0]?.end_date ? 
                            `${new Date(trips[0].start_date).toLocaleDateString()} - ${new Date(trips[0].end_date).toLocaleDateString()}` : 
                            'Dates not available'}</p>
                        </>
                      )}
                      {(() => {
                        const selectedTrip = selectedTripId ? trips.find(t => t.id === selectedTripId) : null
                        const activeTrips = trips.filter(trip => trip.status !== 'cancelled' && trip.status !== 'completed')
                        
                        if (selectedTrip) {
                          // Show the selected trip's status
                          let statusText = 'Upcoming'
                          let statusClass = 'bg-blue-100 text-blue-800'
                          
                          if (selectedTrip.status === 'cancelled') {
                            statusText = 'Cancelled'
                            statusClass = 'bg-red-100 text-red-800'
                          } else if (selectedTrip.status === 'completed') {
                            statusText = 'Completed'
                            statusClass = 'bg-gray-100 text-gray-800'
                          }
                          
                          return (
                            <>
                              <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${statusClass}`}>
                                {statusText}
                              </span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowTripModal(true)
                                }}
                                className="block mt-2 text-sm text-blue-600 hover:text-blue-800"
                              >
                                Select a different trip
                              </button>
                            </>
                          )
                        } else if (activeTrips.length > 0) {
                          return (
                            <>
                              <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                Upcoming
                              </span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowTripModal(true)
                                }}
                                className="block mt-2 text-sm text-blue-600 hover:text-blue-800"
                              >
                                Select a different trip
                              </button>
                            </>
                          )
                        } else if (trips.length > 0) {
                          return (
                            <>
                              <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                No upcoming trips
                              </span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowTripModal(true)
                                }}
                                className="block mt-2 text-sm text-blue-600 hover:text-blue-800"
                              >
                                Show all trips
                              </button>
                            </>
                          )
                        } else {
                          return (
                            <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              No trips
                            </span>
                          )
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Selection */}
            {user && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Select Payment Card</h2>
                    <button 
                      onClick={() => fetchClientCards(userClient?.id || user.id)}
                      disabled={loadingCards}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Refresh cards"
                    >
                      <svg className={`w-5 h-5 ${loadingCards ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                <button 
                  onClick={handleAddCard}
                  className="w-full mb-4 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Card (Selenium)
                </button>
              </div>
              <div className="p-6">
                {loadingCards ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading cards...</p>
                  </div>
                ) : clientCards.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <p className="text-gray-600 mb-4">No cards found for this client</p>
                    <button
                      onClick={handleAddCard}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add First Card
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {clientCards.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => setSelectedCard(card)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedCard?.id === card.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}

                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getCardLogo(card.card_logo)}</span>
                              <div className="flex-1">
                              <h3 className="font-medium text-gray-900">
                                {card.holder_name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                **** **** **** {card.last_4}
                              </p>
                              <p className="text-xs text-gray-500">
                                Expires {card.expire_month}/{card.expire_year}
                              </p>
                            </div>
                          </div>
                            <div className="flex items-center space-x-2">
                              {/* View Card Details button */}
                              <button
                                onClick={(e) => handleRevealCard(card.id, e)}
                                disabled={revealingCard === card.id}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                                  revealedCards[card.id]
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                    : revealingCard === card.id
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-600 hover:bg-gray-700 text-white shadow-sm hover:shadow-md'
                                }`}
                              >
                                {revealingCard === card.id ? (
                                  <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Loading...</span>
                                  </>
                                ) : revealedCards[card.id] ? (
                                  <>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span>View Details</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span>View Details</span>
                                  </>
                                )}
                              </button>
                              
                              {/* Selection indicator */}
                          {selectedCard?.id === card.id && (
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            )}
          </div>

          {/* Right Side - Rate Details */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Hotel Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{hotelName}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
              {/* Stay Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Stay Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Check in</span>
                    <p className="font-medium">{formatDate(startDate)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Check out</span>
                    <p className="font-medium">{formatDate(endDate)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Guests</span>
                    <p className="font-medium">{adults} Adults</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration</span>
                    <p className="font-medium">{nights} Nights</p>
                  </div>
                </div>
              </div>
              {/* Rate Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Rate Details</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-700">
                    <p><strong>Rate Code:</strong> {rateCode}</p>
                    <p><strong>Rate ID:</strong> {rateId}</p>
                  </div>
                </div>
              </div>
              {/* Price Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Price Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total USD</span>
                    <span className="font-bold text-lg text-gray-900">
                      ${displayAmount}
                    </span>
                  </div>
                </div>
              </div>
              {/* Error Message */}
              {bookingError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-red-800 mb-1">Booking Error</h3>
                      <p className="text-sm text-red-700 whitespace-pre-wrap">{bookingError}</p>
                      <div className="mt-3 space-y-2">
                        {bookingError.includes('Price has changed') ? (
                          <button
                            onClick={() => router.back()}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Go Back & Refresh Rates
                          </button>
                        ) : (
                          <button
                            onClick={handleCreateBooking}
                            disabled={bookingLoading}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            {bookingLoading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Retrying...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Try Again
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => router.back()}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateBooking}
                  disabled={!user || !selectedCard || bookingLoading}
                  className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {revealedCards[selectedCard?.id || ''] ? 'Creating Booking...' : 'Revealing Card...'}
                    </div>
                  ) : (
                    'Create Booking'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Form Modal */}
      {showAddCardForm && user && (
        <SeleniumCardForm
          checkoutUrl={`https://advisor.fora.travel/partners/2ad941ab-6704-47f7-8601-a7241ea4202e/checkout/S1QAP7?start_date=${startDate}&end_date=${endDate}&adults=${adults}&rate_code=${rateCode}&rate_id=${rateId}&expected_amount=${expectedAmount}&expected_currency=${expectedCurrency}&supplier_type=hotels%2C${supplierId}&description=${encodeURIComponent(description)}&detailsCategory=Virtuoso&method=ae9ce586-c659-4f07-992e-314fb091ab2c&currency=${currency}&cart_id=${cartId}`}
          clientName={user?.email ? `${user?.email} client` : 'User'}
          onCardCreated={handleCardCreated}
          onCancel={handleCancelCardForm}
        />
      )}

      {/* Card Reveal Modal */}
      {showRevealModal && selectedRevealedCard && (
        <CardRevealModal
          isOpen={showRevealModal}
          cardData={selectedRevealedCard!.cardData}
          cardInfo={selectedRevealedCard!.cardInfo}
          onClose={() => setShowRevealModal(false)}
        />
      )}

      {/* Trip Selection Modal */}
      {showTripModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <button
                onClick={() => setShowTripModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-xl font-semibold text-gray-900">Select trip</h3>
              <div className="w-6"></div> {/* Spacer for centering */}
            </div>
            
            {/* Search and Controls */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-1 relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search"
                    value={tripSearchQuery}
                    onChange={(e) => setTripSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => {
                    setSelectedTripType('new')
                    setSelectedTripId(null)
                    setShowTripModal(false)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  + New trip
                </button>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showPastTrips"
                  checked={showPastTrips}
                  onChange={(e) => setShowPastTrips(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="showPastTrips" className="ml-2 text-sm text-gray-700">
                  Show past and canceled trips
                </label>
              </div>
            </div>
            
            {/* Trip List */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingTrips ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading trips...</p>
                </div>
              ) : trips.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-gray-600 mb-4">No trips found</p>
                  <button
                    onClick={() => {
                      setSelectedTripType('new')
                      setShowTripModal(false)
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create New Trip
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {trips
                    .filter(trip => {
                      const matchesSearch = trip.name?.toLowerCase().includes(tripSearchQuery.toLowerCase()) ||
                                           trip.client_name?.toLowerCase().includes(tripSearchQuery.toLowerCase())
                      
                      // Filter by status - show cancelled/past trips only if checkbox is checked
                      if (!showPastTrips && (trip.status === 'cancelled' || trip.status === 'completed')) {
                        return false
                      }
                      
                      return matchesSearch
                    })
                    .map((trip) => {
                      
                      const startDate = trip.start_date ? new Date(trip.start_date) : null
                      const endDate = trip.end_date ? new Date(trip.end_date) : null
                      const nights = trip.num_nights || (startDate && endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0)
                      
                      return (
                        <div
                          key={trip.id}
                          onClick={() => {
                            setSelectedTripId(trip.id)
                            setSelectedTripType('existing')
                            setShowTripModal(false)
                          }}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedTripId === trip.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {trip.image && trip.image.length > 0 ? (
                                <img 
                                  src={`https://media.fora.travel/foratravelportal/image/upload/c_fill,w_80,h_80,g_auto/f_auto/q_auto/v1/${trip.image[0].public_id}?_a=BAVAZGDW0`}
                                  alt="Trip"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                  
                                    e.currentTarget.src = '/placeholder-trip.jpg'
                                  }}
                                  onLoad={() => {
                                  
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-lg mb-1">{trip.name || 'Trip'}</h4>
                              <p className="text-sm text-gray-600 mb-2">{user?.email ? `${user.email} client` : 'User'}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                <span>
                                  {startDate && endDate ? 
                                    `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 
                                    'Dates not available'}
                                </span>
                                <span>•</span>
                                <span>{nights} nights</span>
                              </div>
                                                             <div className="flex items-center space-x-2 text-sm text-gray-600">
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                                 </svg>
                                 <span>{trip.booking_summary?.total || 0} bookings</span>
                               </div>
                            </div>
                                                         <div className="flex flex-col items-end space-y-2">
                               <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                 trip.status === 'cancelled' 
                                   ? 'bg-red-100 text-red-800' 
                                   : trip.status === 'completed'
                                   ? 'bg-gray-100 text-gray-800'
                                   : 'bg-blue-100 text-blue-800'
                               }`}>
                                 {trip.status === 'cancelled' ? 'Cancelled' : 
                                  trip.status === 'completed' ? 'Completed' : 
                                  'Upcoming'}
                               </span>
                              {selectedTripId === trip.id && (
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowTripModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedTripId) {
                    setSelectedTripType('existing')
                    setShowTripModal(false)
                  }
                }}
                disabled={!selectedTripId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
