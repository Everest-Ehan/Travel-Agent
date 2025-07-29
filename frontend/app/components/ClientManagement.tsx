'use client'

import React, { useState, useEffect } from 'react'
import { ApiService } from '../services/api'
import { Client, ClientCard } from '../types/auth'
import SeleniumCardForm from './SeleniumCardForm'
import CardRevealModal from './CardRevealModal'

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
  
  // State for card reveal functionality
  const [revealedCards, setRevealedCards] = useState<{ [cardId: string]: any }>({})
  const [revealingCard, setRevealingCard] = useState<string | null>(null)
  
  // State for modal
  const [showRevealModal, setShowRevealModal] = useState(false)
  const [selectedRevealedCard, setSelectedRevealedCard] = useState<{ cardData: any; cardInfo: any } | null>(null)

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

  const handleRevealCard = async (cardId: string) => {
    if (!selectedClient) {
      console.error('No client selected')
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
      console.log('🔍 Revealing card:', cardId, 'for client:', selectedClient.id)
      
      const revealedData = await ApiService.revealClientCard(selectedClient.id, cardId)
      console.log('✅ Card revealed:', revealedData)
      
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
      
      // Show success message
      console.log('Card information revealed successfully!')
    } catch (error) {
      console.error('❌ Error revealing card:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to reveal card information'
      setError(errorMessage)
      // You could add a toast notification here
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
                        <div className="flex-1">
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
                      <div className="flex items-center space-x-2">
                        {/* Reveal button */}
                        <button
                          onClick={() => handleRevealCard(card.id)}
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
                        
                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
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
        <SeleniumCardForm
          checkoutUrl="https://advisor.fora.travel/partners/2ad941ab-6704-47f7-8601-a7241ea4202e/checkout/S1QAP7?start_date=2025-08-18&end_date=2025-08-27&adults=2&rate_code=API&rate_id=VIRTUOSO&expected_amount=13691.7&expected_currency=USD&supplier_type=hotels%2C2ad941ab-6704-47f7-8601-a7241ea4202e&description=Petit+Piton+600sf+Queen+Open+Wall+Piton+Views+Heated+Plunge+Pool+Fbfast+Airport+Transfer+Inc&detailsCategory=Virtuoso&method=ae9ce586-c659-4f07-992e-314fb091ab2c&currency=USD&cart_id=a4a1df9f-dad6-4a5b-9d40-b98c0e7c9600"
          clientName={selectedClient.first_name + ' ' + selectedClient.last_name}
          onCardCreated={() => {
            setShowAddCardForm(false)
            if (selectedClient) {
              fetchClientCards(selectedClient.id)
            }
          }}
          onCancel={() => setShowAddCardForm(false)}
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