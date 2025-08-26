'use client'

import React, { useEffect } from 'react'

interface CardRevealModalProps {
  isOpen: boolean
  onClose: () => void
  cardData: any
  cardInfo: {
    holder_name: string
    last_4: string
    expire_month: string
    expire_year: string
    card_logo: string
  }
}

export default function CardRevealModal({ isOpen, onClose, cardData, cardInfo }: CardRevealModalProps) {
  
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const formatCardNumber = () => {
    if (!cardData?.card_data?.first_6 || !cardData?.card_data?.last_4) return '**** **** **** ****'
    const first6 = cardData.card_data.first_6
    const last4 = cardData.card_data.last_4
    return `${first6} **** **** ${last4}`
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Card Information</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Card Details</h4>
              <p className="text-sm text-blue-700">
                This shows the card information as stored in the system. Sensitive information like the full card number and CVV are hidden for security.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Card Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
              {formatCardNumber()}
            </div>
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                {cardData?.card_data?.expire_month || cardInfo?.expire_month}/{cardData?.card_data?.expire_year || cardInfo?.expire_year}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                ***
              </div>
            </div>
          </div>

          {/* Cardholder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cardholder Name
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
              {cardData?.card_data?.holder_name || cardInfo?.holder_name}
            </div>
          </div>

          {/* Card Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Label
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
              {cardData?.card_data?.nickname || 'No label set'}
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Address
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
              {cardData?.card_data?.address || 'Not available'}
            </div>
          </div>

          {/* Apartment Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apartment Number
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
              {cardData?.card_data?.address_additional || 'Not specified'}
            </div>
          </div>

          {/* City, State, Zip */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                {cardData?.card_data?.city || 'Not available'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                {cardData?.card_data?.state || 'Not available'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zip Code
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                {cardData?.card_data?.zip_code || 'Not available'}
              </div>
            </div>
          </div>

          {/* Card Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Card Details</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Card Type:</span>
                <span className="flex items-center">
                  <span className="mr-2">{getCardLogo(cardData?.card_data?.card_logo || cardInfo?.card_logo)}</span>
                  {cardData?.card_data?.card_logo || cardInfo?.card_logo}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last 4 Digits:</span>
                <span>**** {cardData?.card_data?.last_4 || cardInfo?.last_4}</span>
              </div>
              <div className="flex justify-between">
                <span>Country:</span>
                <span>{cardData?.card_data?.country_name || 'Not available'}</span>
              </div>
              {cardData?.card_data?.created_at && (
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{new Date(cardData.card_data.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Close Button */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}