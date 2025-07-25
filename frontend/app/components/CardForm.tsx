'use client'

import React, { useState } from 'react'
import { ApiService } from '../services/api'
import { CreateCardRequest } from '../types/auth'

interface CardFormProps {
  clientId: string
  onCardCreated: () => void
  onCancel: () => void
}

export default function CardForm({ clientId, onCardCreated, onCancel }: CardFormProps) {
  const [formData, setFormData] = useState<CreateCardRequest>({
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Original form data:', formData)
      
      // Extract first 6 and last 4 digits from card number
      const cardNumber = formData.number.replace(/\s/g, '')
      const first_6 = cardNumber.substring(0, 6)
      const last_4 = cardNumber.substring(cardNumber.length - 4)
      
      console.log('Card number processing:', { cardNumber, first_6, last_4 })
      
      // Create number_token (this is a placeholder - Fora might generate this)
      const number_token = `${first_6}AxLSmV${last_4}`
      
      // Create cvv_token by repeating cvv twice as specified
      const cvv_token = formData.cvv + formData.cvv
      
      // Use card_logo as is (already in correct format)
      const card_logo = formData.card_logo
      
      const cardData = {
        address: formData.address,
        address_additional: formData.address_additional || null,
        card_logo: card_logo,
        city: formData.city,
        country_id: formData.country_id,
        cvv_token: cvv_token,
        expire_month: formData.expire_month,
        expire_year: formData.expire_year,
        first_6: first_6,
        holder_name: formData.holder_name,
        last_4: last_4,
        nickname: formData.nickname || null,
        number_token: number_token,
        state: formData.state,
        zip_code: formData.zip_code
      }

      console.log('Transformed card data to send:', cardData)
      await ApiService.createClientCard(clientId, cardData)
      onCardCreated()
    } catch (err) {
      console.error('Error in handleSubmit:', err)
      setError(err instanceof Error ? err.message : 'Failed to create card')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateCardRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Add New Card</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number *
            </label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1234 5678 9012 3456"
              required
            />
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month *
              </label>
              <input
                type="text"
                value={formData.expire_month}
                onChange={(e) => handleInputChange('expire_month', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12"
                maxLength={2}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year *
              </label>
              <input
                type="text"
                value={formData.expire_year}
                onChange={(e) => handleInputChange('expire_year', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="25"
                maxLength={2}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV *
              </label>
              <input
                type="text"
                value={formData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
          </div>

          {/* Cardholder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cardholder Name *
            </label>
            <input
              type="text"
              value={formData.holder_name}
              onChange={(e) => handleInputChange('holder_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
              required
            />
          </div>

          {/* Card Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Type *
            </label>
            <select
              value={formData.card_logo}
              onChange={(e) => handleInputChange('card_logo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="visa">Visa</option>
              <option value="masterCard">Mastercard</option>
              <option value="amex">American Express</option>
            </select>
          </div>

          {/* Billing Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Address *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123 Main St"
              required
            />
          </div>

          {/* Address Additional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Additional
            </label>
            <input
              type="text"
              value={formData.address_additional}
              onChange={(e) => handleInputChange('address_additional', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Apt 4B"
            />
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="New York"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="NY"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP *
              </label>
              <input
                type="text"
                value={formData.zip_code}
                onChange={(e) => handleInputChange('zip_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10001"
                required
              />
            </div>
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nickname (Optional)
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => handleInputChange('nickname', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Primary Card"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </div>
              ) : (
                'Add Card'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 