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
    country: string
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

  // Get booking data from URL params (minimal, as Fora does)
  const hotelId = searchParams.get('hotel_id') || ''
  const hotelName = searchParams.get('hotel_name') || ''
  const startDate = searchParams.get('start_date') || ''
  const endDate = searchParams.get('end_date') || ''
  const adults = searchParams.get('adults') || '2'
  const rateCode = searchParams.get('rate_code') || ''
  const rateId = searchParams.get('rate_id') || ''
  const expectedAmount = searchParams.get('expected_amount') || ''
  const expectedCurrency = searchParams.get('expected_currency') || ''
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

  // Fetch client cards when user is available
  useEffect(() => {
    if (user) {
      // Use user's email to search for existing client or create a simple client object
      const userEmail = user.email
      if (userEmail) {
        // The client name format is: userEmail + " -" (as per backend logic)
        const clientName = `${userEmail} -`
        
        // Try to fetch cards for this user
        fetchClientCards(userClient?.id || user.id)
      }
    } else {
      setClientCards([])
      setSelectedCard(null)
    }
  }, [user])

  const fetchClientCards = async (clientId: string) => {
    try {
      setLoadingCards(true)
      console.log('🔍 Fetching cards for client ID:', clientId)
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
    console.log('💳 Adding card for user ID:', user?.id)
    setShowAddCardForm(true)
  }

  const handleCardCreated = () => {
    console.log('✅ Card created, refreshing cards for user ID:', user?.id)
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
        console.log('Opening modal with existing data:', { cardData: revealedCards[cardId], cardInfo: card })
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
      console.log('🔍 Revealing card:', cardId, 'for user:', user.id)
      
      const revealedData = await ApiService.revealClientCard(userClient?.id || user.id, cardId)
      console.log('✅ Card revealed:', revealedData)
      
      setRevealedCards(prev => ({
        ...prev,
        [cardId]: revealedData
      }))
      
      // Show the modal with the revealed data
      const card = clientCards.find(c => c.id === cardId)
      if (card) {
        console.log('Opening modal with new data:', { cardData: revealedData, cardInfo: card })
        setSelectedRevealedCard({
          cardData: revealedData,
          cardInfo: card
        })
        setShowRevealModal(true)
      }
      
      // Show success message (you could integrate with a toast library)
      console.log('Card information revealed successfully!')
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

  const handleTestModal = () => {
    console.log('Testing modal...')
    setSelectedRevealedCard({
      cardData: {
        card_data: {
          first_6: '555671',
          last_4: '4892',
          expire_month: 12,
          expire_year: 2029,
          card_logo: 'masterCard',
          address: '16075 Surprise Ln',
          address_additional: 'Apt 1',
          city: 'Huntington Beach',
          state: 'CA',
          zip_code: '92649',
          country_name: 'United States of America'
        }
      },
      cardInfo: {
        holder_name: 'Sathvik Nori',
        last_4: '4892',
        expire_month: '12',
        expire_year: '2029',
        card_logo: 'masterCard'
      }
    })
    setShowRevealModal(true)
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

  const handleCreateBooking = async () => {
    if (!user) {
      setBookingError('User information not available. Please refresh the page.')
      return
    }
    if (!selectedCard) {
      setBookingError('Please select a payment card.')
      return
    }
    if (missingRequiredFields) {
      setBookingError('Missing booking details. Please go back and try again.')
      return
    }
    try {
      setBookingLoading(true)
      setBookingError(null)
      const bookingRequest: BookingRequest = {
        booking_code: rateCode,
        cart_id: cartId || '',
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
        trip_id: null,
        trip_name: `${user!.email} -'s ${hotelName} Trip`,
        use_advisor_contact_info: false
      }
      const result = await ApiService.createBooking(bookingRequest)
      router.push(`/booking/success?booking_id=${result.id}`)
    } catch (error) {
      setBookingError('Failed to create booking. Please try again.')
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
          {/* Left Side - Client Info and Card Selection */}
          <div className="space-y-6">
            {/* Client Information (Read-only) */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking For</h2>
              </div>
              <div className="p-6">
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {user.email ? `${user.email} -` : 'User'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {user.email}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Selection */}
            {user && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Payment Card</h2>
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
                              {/* Reveal button */}
                              <button
                                onClick={(e) => handleRevealCard(card.id, e)}
                                disabled={revealingCard === card.id}
                                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                  revealedCards[card.id]
                                    ? 'bg-green-100 hover:bg-green-200 text-green-700'
                                    : revealingCard === card.id
                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                                }`}
                              >
                                {revealingCard === card.id ? (
                                  <div className="flex items-center space-x-1">
                                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Revealing...</span>
                                  </div>
                                ) : revealedCards[card.id] ? (
                                  <span>👁️ View</span>
                                ) : (
                                  <span>🔓 Reveal</span>
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
                    <span className="text-gray-600">Total ({expectedCurrency})</span>
                    <span className="font-bold text-lg text-gray-900">
                      {formatCurrency(expectedAmount, expectedCurrency)}
                    </span>
                  </div>
                </div>
              </div>
              {/* Error Message */}
              {bookingError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{bookingError}</p>
                </div>
              )}

              {/* Test Modal Button */}
              <button
                onClick={handleTestModal}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Test Modal
              </button>
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
                      Creating Booking...
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
          clientName={user.email ? `${user.email} -` : 'User'}
          onCardCreated={handleCardCreated}
          onCancel={handleCancelCardForm}
        />
      )}

      {/* Card Reveal Modal */}
      {showRevealModal && selectedRevealedCard && (
        <CardRevealModal
          isOpen={showRevealModal}
          cardData={selectedRevealedCard.cardData}
          cardInfo={selectedRevealedCard.cardInfo}
          onClose={() => setShowRevealModal(false)}
        />
      )}
    </div>
  )
}