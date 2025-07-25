'use client'

import React, { useState, useEffect } from 'react'
import { ApiService } from '../services/api'
import { Client, ClientCard, CreateCardRequest } from '../types/auth'

interface ClientManagementProps {
  onClientSelect?: (client: Client) => void
}

export default function ClientManagement({ onClientSelect }: ClientManagementProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientCards, setClientCards] = useState<ClientCard[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCards, setLoadingCards] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddCardForm, setShowAddCardForm] = useState(false)
  const [newCard, setNewCard] = useState<CreateCardRequest>({
    address: '',
    address_additional: '',
    card_logo: 'visa',
    city: '',
    country_id: 23, // Default to US
    cvv: '',
    expire_month: '',
    expire_year: '',
    holder_name: '',
    number: '',
    nickname: '',
    state: '',
    zip_code: ''
  })

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    if (selectedClient) {
      fetchClientCards(selectedClient.id)
    }
  }, [selectedClient])

  const fetchClients = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await ApiService.fetchClients(searchQuery)
      setClients(response.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }

  const fetchClientCards = async (clientId: string) => {
    setLoadingCards(true)
    try {
      const response = await ApiService.getClientCards(clientId)
      setClientCards(response.results || [])
    } catch (err) {
      console.error('Failed to fetch client cards:', err)
    } finally {
      setLoadingCards(false)
    }
  }

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client)
    if (onClientSelect) {
      onClientSelect(client)
    }
  }

  const handleAddCard = async () => {
    if (!selectedClient) return

    try {
      console.log('Original newCard data:', newCard)
      
      // Extract first 6 and last 4 digits from card number
      const cardNumber = newCard.number.replace(/\s/g, '')
      const first_6 = cardNumber.substring(0, 6)
      const last_4 = cardNumber.substring(cardNumber.length - 4)
      
      console.log('Card number processing:', { cardNumber, first_6, last_4 })
      
      // Create number_token (this is a placeholder - Fora might generate this)
      const number_token = `${first_6}AxLSmV${last_4}`
      
      // Create cvv_token by repeating cvv twice as specified
      const cvv_token = newCard.cvv + newCard.cvv
      
      // Use card_logo as is (already in correct format)
      const card_logo = newCard.card_logo
      
      const cardData = {
        address: newCard.address,
        address_additional: newCard.address_additional || null,
        card_logo: card_logo,
        city: newCard.city,
        country_id: newCard.country_id,
        cvv_token: cvv_token,
        expire_month: newCard.expire_month,
        expire_year: newCard.expire_year,
        first_6: first_6,
        holder_name: newCard.holder_name,
        last_4: last_4,
        nickname: newCard.nickname || null,
        number_token: number_token,
        state: newCard.state,
        zip_code: newCard.zip_code
      }

      console.log('Transformed card data to send:', cardData)
      const response = await ApiService.createClientCard(selectedClient.id, cardData)
      console.log('Card created:', response)
      
      // Refresh cards
      fetchClientCards(selectedClient.id)
      
      // Reset form
      setNewCard({
        address: '',
        address_additional: '',
        card_logo: 'visa',
        city: '',
        country_id: 23,
        cvv: '',
        expire_month: '',
        expire_year: '',
        holder_name: '',
        number: '',
        nickname: '',
        state: '',
        zip_code: ''
      })
      setShowAddCardForm(false)
    } catch (err) {
      console.error('Error in handleAddCard:', err)
      setError(err instanceof Error ? err.message : 'Failed to add card')
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!selectedClient) return

    if (confirm('Are you sure you want to delete this card?')) {
      try {
        await ApiService.deleteClientCard(selectedClient.id, cardId)
        fetchClientCards(selectedClient.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete card')
      }
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

  return (
    <div className="space-y-6">
      {/* Search and Add Client */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={fetchClients}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clients List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Clients</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading clients...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No clients found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => handleClientSelect(client)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedClient?.id === client.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {client.first_name} {client.last_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {client.emails[0]?.email || 'No email'}
                        </p>
                      </div>
                      <div className="text-sm text-gray-400">
                        {client.phone_numbers[0]?.phone_number || 'No phone'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Client Cards */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedClient ? `${selectedClient.first_name}'s Cards` : 'Cards'}
            </h3>
            {selectedClient && (
              <button
                onClick={() => setShowAddCardForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                Add Card
              </button>
            )}
          </div>
          <div className="p-6">
            {!selectedClient ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Select a client to view their cards</p>
              </div>
            ) : loadingCards ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading cards...</p>
              </div>
            ) : clientCards.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No cards found</p>
                <button
                  onClick={() => setShowAddCardForm(true)}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add First Card
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {clientCards.map((card) => (
                  <div key={card.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCardLogo(card.card_logo)}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {card.holder_name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            **** **** **** {card.last_4}
                          </p>
                          <p className="text-xs text-gray-400">
                            Expires {card.expire_month}/{card.expire_year}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      <p>{card.address}</p>
                      <p>{card.city}, {card.state} {card.zip_code}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddCardForm && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Card</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={newCard.number}
                  onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1234 5678 9012 3456"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Month
                  </label>
                  <input
                    type="text"
                    value={newCard.expire_month}
                    onChange={(e) => setNewCard({ ...newCard, expire_month: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Year
                  </label>
                  <input
                    type="text"
                    value={newCard.expire_year}
                    onChange={(e) => setNewCard({ ...newCard, expire_year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="25"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  value={newCard.cvv}
                  onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={newCard.holder_name}
                  onChange={(e) => setNewCard({ ...newCard, holder_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={newCard.address}
                  onChange={(e) => setNewCard({ ...newCard, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newCard.city}
                    onChange={(e) => setNewCard({ ...newCard, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={newCard.state}
                    onChange={(e) => setNewCard({ ...newCard, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="NY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP
                  </label>
                  <input
                    type="text"
                    value={newCard.zip_code}
                    onChange={(e) => setNewCard({ ...newCard, zip_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddCard}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Card
              </button>
              <button
                onClick={() => setShowAddCardForm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 