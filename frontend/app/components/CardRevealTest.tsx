'use client'

import React, { useState } from 'react'
import { ApiService } from '../services/api'

interface CardRevealTestProps {
  clientId: string
  cardId: string
}

export default function CardRevealTest({ clientId, cardId }: CardRevealTestProps) {
  const [revealedData, setRevealedData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleReveal = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Testing card reveal for client:', clientId, 'card:', cardId)
      const data = await ApiService.revealClientCard(clientId, cardId)
      
      console.log('✅ Card revealed successfully:', data)
      setRevealedData(data)
    } catch (err) {
      console.error('❌ Error revealing card:', err)
      setError(err instanceof Error ? err.message : 'Failed to reveal card')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Card Reveal Test</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Client ID: {clientId}</p>
          <p className="text-sm text-gray-600">Card ID: {cardId}</p>
        </div>
        
        <button
          onClick={handleReveal}
          disabled={loading}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            loading
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? 'Revealing...' : 'Reveal Card'}
        </button>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">Error: {error}</p>
          </div>
        )}
        
        {revealedData && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Card Revealed Successfully
            </h4>
            
            <div className="space-y-3">
              {/* Card Data Section */}
              {revealedData.card_data && (
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <h5 className="text-sm font-semibold text-gray-800 mb-2">Card Information</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Card Number:</span>
                      <p className="font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded">
                        {revealedData.card_data.first_6}******{revealedData.card_data.last_4}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Card Type:</span>
                      <p className="text-gray-800 capitalize">
                        {revealedData.card_data.card_logo?.replace('masterCard', 'Mastercard')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Expires:</span>
                      <p className="font-mono text-gray-800">
                        {revealedData.card_data.expire_month?.toString().padStart(2, '0')}/{revealedData.card_data.expire_year}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Holder:</span>
                      <p className="text-gray-800">{revealedData.card_data.holder_name}</p>
                    </div>
                  </div>
                  
                  {/* Billing Address */}
                  {revealedData.card_data.address && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="text-gray-600 text-xs">Billing Address:</span>
                      <div className="text-gray-800 text-xs mt-1">
                        <p>{revealedData.card_data.address}</p>
                        {revealedData.card_data.address_additional && (
                          <p>{revealedData.card_data.address_additional}</p>
                        )}
                        <p>{revealedData.card_data.city}, {revealedData.card_data.state} {revealedData.card_data.zip_code}</p>
                        <p>{revealedData.card_data.country_name}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Tokens Section */}
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <h5 className="text-sm font-semibold text-gray-800 mb-2">Security Tokens</h5>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-gray-600">Number Token:</span>
                    <p className="font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded break-all">
                      {revealedData.number_token}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">CVV Token:</span>
                    <p className="font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded break-all">
                      {revealedData.cvv_token}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Tokenex ID:</span>
                    <p className="font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded">
                      {revealedData.tokenex_id}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Metadata */}
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <h5 className="text-sm font-semibold text-gray-800 mb-2">Metadata</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Timestamp:</span>
                    <p className="text-gray-800">{revealedData.timestamp}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Origin:</span>
                    <p className="text-gray-800">{revealedData.origin}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}