'use client'

import React, { useState } from 'react'

interface CancelBookingModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  booking: {
    unique_id: string
    supplier: string
    arrival: string
    departure: string
    confirmation_num: string
    total_commissionable_booking_usd: string
  }
  isLoading?: boolean
}

const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  booking,
  isLoading = false
}) => {
  const [isConfirming, setIsConfirming] = useState(false)

  console.log('🔍 CancelBookingModal render - isOpen:', isOpen, 'booking:', booking)

  const handleConfirm = async () => {
    console.log('🔍 CancelBookingModal handleConfirm called')
    setIsConfirming(true)
    try {
      console.log('📞 Calling onConfirm...')
      await onConfirm()
      console.log('✅ onConfirm completed successfully')
    } catch (error) {
      console.error('❌ onConfirm failed:', error)
      throw error
    } finally {
      setIsConfirming(false)
      console.log('🔄 handleConfirm completed')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-red-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Cancel Booking</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Are you sure you want to cancel this booking? This action will permanently cancel the reservation and may incur cancellation fees.
            </p>
            
            {/* Booking Details */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-600">Hotel</span>
                <span className="text-sm font-semibold text-gray-900 text-right">{booking.supplier}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-600">Confirmation</span>
                <span className="text-sm font-semibold text-gray-900 text-right">{booking.confirmation_num}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-600">Check-in</span>
                <span className="text-sm font-semibold text-gray-900 text-right">{formatDate(booking.arrival)}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-600">Check-out</span>
                <span className="text-sm font-semibold text-gray-900 text-right">{formatDate(booking.departure)}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-600">Total Value</span>
                <span className="text-sm font-semibold text-gray-900 text-right">{formatCurrency(booking.total_commissionable_booking_usd)}</span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">Important Notice</p>
                <p className="text-sm text-amber-700 mt-1">
                  Cancellation may be subject to fees based on the hotel's policy. Please review the cancellation terms before proceeding.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading || isConfirming}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Keep Booking
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || isConfirming}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {(isLoading || isConfirming) ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Cancelling...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancel Booking</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CancelBookingModal 