'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ApiService } from '../services/api'
import { HotelRate, HotelRateProgram } from '../types/hotel'
import { ClientCard } from '../types/auth'
import ClientForm from '../components/ClientForm'
import CardForm from '../components/CardForm'

interface Client {
  id: string
  first_name: string
  last_name: string
  emails: Array<{ email: string; email_type: string }>
  phone_numbers: Array<{ phone_number: string; number_type: string }>
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
  currency: string
  end_date: string
  expected_amount: number
  expected_currency: string
  number_of_adults: number
  rate_code: string
  rate_id: string
  start_date: string
  supplier_id: string
  supplier_program_id: string
}

export default function BookingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // State for clients
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [clientsError, setClientsError] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // State for client cards
  const [clientCards, setClientCards] = useState<ClientCard[]>([])
  const [loadingCards, setLoadingCards] = useState(false)
  const [selectedCard, setSelectedCard] = useState<ClientCard | null>(null)
  const [showAddCardForm, setShowAddCardForm] = useState(false)
  
  // State for booking
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  
  // State for client form
  const [showClientForm, setShowClientForm] = useState(false)
  const [clientSuccessMessage, setClientSuccessMessage] = useState('')

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

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients()
  }, [])

  // Fetch client cards when client is selected
  useEffect(() => {
    if (selectedClient) {
      fetchClientCards(selectedClient.id)
    } else {
      setClientCards([])
      setSelectedCard(null)
    }
  }, [selectedClient])

  const fetchClients = async () => {
    try {
      setLoadingClients(true)
      setClientsError(null)
      const response = await ApiService.fetchClients(searchQuery)
      setClients(response.results || response)
    } catch (error) {
      setClientsError('Failed to load clients. Please try again.')
    } finally {
      setLoadingClients(false)
    }
  }

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

  const handleClientSearch = (query: string) => {
    setSearchQuery(query)
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchClients()
    }, 300)
    return () => clearTimeout(timeoutId)
  }

  const handleAddNewClient = () => {
    setShowClientForm(true)
  }

  const handleClientCreated = (newClient: Client) => {
    console.log('🆕 New client created:', newClient.id, newClient.first_name, newClient.last_name)
    setClients(prev => [newClient, ...prev])
    setSelectedClient(newClient)
    setShowClientForm(false)
    setClientSuccessMessage('Client created successfully!')
    // Clear success message after 3 seconds
    setTimeout(() => setClientSuccessMessage(''), 3000)
  }

  const handleCancelClientForm = () => {
    setShowClientForm(false)
  }

  const handleAddCard = () => {
    console.log('💳 Adding card for client ID:', selectedClient?.id)
    setShowAddCardForm(true)
  }

  const handleCardCreated = () => {
    console.log('✅ Card created, refreshing cards for client ID:', selectedClient?.id)
    setShowAddCardForm(false)
    if (selectedClient) {
      fetchClientCards(selectedClient.id)
    }
  }

  const handleCancelCardForm = () => {
    setShowAddCardForm(false)
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
    if (!selectedClient) {
      setBookingError('Please select a client.')
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
        booking_code: rateCode, // Fora uses rate_code as booking_code
        cart_id: cartId || '', // Use empty string as fallback if cart_id is not available
        children_ages: [],
        currency: currency,
        end_date: endDate,
        expected_amount: parseFloat(expectedAmount),
        expected_currency: expectedCurrency,
        number_of_adults: parseInt(adults),
        rate_code: rateCode,
        rate_id: rateId,
        start_date: startDate,
        supplier_id: supplierId,
        supplier_program_id: supplierProgramId
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
          <p className="text-gray-600">Select a client and payment method, then review your booking details</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Client and Card Selection */}
          <div className="space-y-6">
            {/* Client Selection */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Client</h2>
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search clients..."
                      value={searchQuery}
                      onChange={(e) => handleClientSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                {/* Add New Client Button */}
                <button 
                  onClick={handleAddNewClient}
                  className="w-full mb-6 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Client
                </button>
                
                {/* Success Message */}
                {clientSuccessMessage && (
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm">{clientSuccessMessage}</p>
                  </div>
                )}
              </div>
              {/* Client List */}
              <div className="p-6">
                {loadingClients ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading clients...</p>
                  </div>
                ) : clientsError ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-4">{clientsError}</p>
                    <button
                      onClick={fetchClients}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : clients.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-600">No clients found</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {clients.map((client) => (
                      <div
                        key={client.id}
                        onClick={() => {
                          console.log('👤 Client selected:', client.id, client.first_name, client.last_name)
                          setSelectedClient(client)
                        }}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedClient?.id === client.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {client.first_name} {client.last_name}
                            </h3>
                            {client.emails.length > 0 && (
                              <p className="text-sm text-gray-600">
                                {client.emails[0].email}
                              </p>
                            )}
                            {client.phone_numbers.length > 0 && (
                              <p className="text-sm text-gray-600">
                                {client.phone_numbers[0].phone_number}
                              </p>
                            )}
                          </div>
                          {selectedClient?.id === client.id && (
                            <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Card Selection */}
            {selectedClient && (
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
                    Add New Card
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
                              <div>
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
                            {selectedCard?.id === card.id && (
                              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{bookingError}</p>
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
                  disabled={!selectedClient || !selectedCard || bookingLoading}
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
      
      {/* Client Form Modal */}
      {showClientForm && (
        <ClientForm
          onClientCreated={handleClientCreated}
          onCancel={handleCancelClientForm}
        />
      )}

      {/* Card Form Modal */}
      {showAddCardForm && selectedClient && (
        <CardForm
          clientId={selectedClient.id}
          onCardCreated={handleCardCreated}
          onCancel={handleCancelCardForm}
        />
      )}
    </div>
  )
} 