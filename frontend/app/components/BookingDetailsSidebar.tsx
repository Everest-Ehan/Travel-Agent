'use client'

import React from 'react'
import { HotelRate, HotelRateProgram } from '../types/hotel'

interface BookingDetailsSidebarProps {
  isOpen: boolean
  onClose: () => void
  selectedRate: HotelRate | null
  program: HotelRateProgram | null
  hotelName: string
  startDate?: string
  endDate?: string
  adults?: string
  rooms?: string
}

export default function BookingDetailsSidebar({
  isOpen,
  onClose,
  selectedRate,
  program,
  hotelName,
  startDate,
  endDate,
  adults,
  rooms
}: BookingDetailsSidebarProps) {
  if (!isOpen || !selectedRate || !program) return null

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
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
  const totalPrice = selectedRate.price.grand_total_items.find(item => item.category === 'grand_total')?.total || 0
  const basePrice = selectedRate.price.grand_total_items.find(item => item.category === 'base')?.total || 0
  const taxesAndFees = selectedRate.price.grand_total_items.find(item => item.category === 'taxes_and_fees')?.total || 0
  const commissionableValue = basePrice
  const totalCommission = (commissionableValue * selectedRate.commission.expected_commission_percent) / 100
  const yourCommission = totalCommission * 0.7 // Assuming 70% commission split

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div 
        className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Hotel Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{hotelName}</h3>
              <p className="text-gray-600">{selectedRate.room.description}</p>
            </div>

            {/* Stay Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Stay Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Check in</span>
                  <p className="font-medium">{startDate ? formatDate(startDate) : 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Check out</span>
                  <p className="font-medium">{endDate ? formatDate(endDate) : 'N/A'}</p>
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
                <div className="flex items-center gap-3 mb-3">
                  {program.name === 'Fora Reserve' ? (
                    <svg className="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
                    </svg>
                  ) : program.logo_url && (
                    <img 
                      src={program.logo_url} 
                      alt={program.name}
                      className="w-8 h-8 object-contain"
                    />
                  )}
                  <div>
                    <h5 className="font-semibold text-gray-900">{program.name === 'Fora Reserve' ? 'Reserve' : program.name}</h5>
                  </div>
                </div>
                
                <div className="text-sm text-gray-700">
                  <p><strong>Rate Code:</strong> {selectedRate.rate_identifier}</p>
                  <p><strong>Rate Description:</strong> {selectedRate.price.rate_description}</p>
                  <p><strong>Payment Type:</strong> {selectedRate.price.payment_type}</p>
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Cancellation Policy</h4>
              <div className="space-y-3">
                {selectedRate.policies.cancellations.map((policy, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(policy.valid_from)}
                        {policy.valid_until && ` - ${formatDate(policy.valid_until)}`}
                      </span>
                      <span className={`text-sm font-semibold px-2 py-1 rounded ${
                        policy.refundable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {policy.refundable ? 'Refundable' : 'Non-refundable'}
                      </span>
                    </div>
                    {policy.penalty_amount && (
                      <p className="text-sm text-gray-600">
                        Penalty: {formatCurrency(policy.penalty_amount, policy.penalty_currency)}
                      </p>
                    )}
                    {policy.penalty_percentage && (
                      <p className="text-sm text-gray-600">
                        Penalty: {policy.penalty_percentage}%
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Nightly Rates */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Nightly Rates</h4>
              <div className="space-y-2">
                {selectedRate.price.line_items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(item.total, item.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Details */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Price Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{rooms} Room x {nights} Nights</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(basePrice, selectedRate.price.avg_per_night.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taxes & fees</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(taxesAndFees, selectedRate.price.avg_per_night.currency)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total {selectedRate.price.avg_per_night.currency}</span>
                  <span className="font-bold text-lg text-gray-900">
                    {formatCurrency(totalPrice, selectedRate.price.avg_per_night.currency)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Including all known taxes and fees</p>
              </div>
            </div>

           

           

            {/* Additional Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Additional Information</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Rate Code:</span>
                  <p className="text-gray-600">{selectedRate.rate_identifier}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Booking Code:</span>
                  <p className="text-gray-600">{selectedRate.booking_code}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Offer ID:</span>
                  <p className="text-gray-600">{selectedRate.offer_id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <button
              onClick={onClose}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </>
  )
} 