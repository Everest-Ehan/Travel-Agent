'use client'

import React from 'react'
import { Trip } from '../types/trip'

interface TripCardProps {
  trip: Trip
  onClick?: () => void
}

const TripCard: React.FC<TripCardProps> = ({ trip, onClick }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount)
    if (isNaN(num)) return amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'past':
        return 'bg-slate-50 text-slate-700 border-slate-200'
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'past':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'cancelled':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return null
    }
  }

  // Check if we have a valid image URL (not just id and public_id)
  const hasValidImage = trip.image && trip.image.length > 0 && trip.image[0].url

  // Get trip destination from name (remove email prefix if present)
  const getTripDestination = () => {
    const name = trip.name
    // Remove email prefix if present (e.g., "email@domain.com client's Trip Name")
    const match = name.match(/client's (.+)$/i)
    return match ? match[1] : name
  }

  return (
    <div 
      className={`group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer overflow-hidden ${
        onClick ? 'hover:scale-[1.02]' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex h-32">
        {/* Trip Image or Placeholder */}
        {hasValidImage ? (
          <div className="w-40 h-32 flex-shrink-0">
            <img 
              src={trip.image[0].url} 
              alt={trip.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-40 h-32 flex-shrink-0 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-8 h-8 text-indigo-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
              </svg>
              <p className="text-xs text-indigo-500 font-medium">Trip</p>
            </div>
          </div>
        )}

        {/* Trip Details */}
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate mb-2 leading-tight">
                {getTripDestination()}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  {trip.num_nights} nights
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(trip.status)} ml-4`}>
              {getStatusIcon(trip.status)}
              <span className="ml-1.5 capitalize">{trip.status}</span>
            </div>
          </div>

          {/* Trip Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm">
              {/* Commission */}
              <div className="flex items-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2.5"></div>
                <span className="text-gray-500 font-medium">Commission:</span>
                <span className="ml-1.5 font-bold text-gray-900">
                  {formatCurrency(trip.commission_summary.advisor_value)}
                </span>
              </div>

              {/* Total Value */}
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2.5"></div>
                <span className="text-gray-500 font-medium">Total:</span>
                <span className="ml-1.5 font-bold text-gray-900">
                  {formatCurrency(trip.commission_summary.total_value)}
                </span>
              </div>

              {/* Bookings */}
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2.5"></div>
                <span className="text-gray-500 font-medium">Bookings:</span>
                <span className="ml-1.5 font-bold text-gray-900">
                  {trip.booking_summary.total}
                </span>
              </div>
            </div>

            {/* Client Count */}
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">{trip.clients.length} client{trip.clients.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Action Arrow */}
        {onClick && (
          <div className="flex items-center justify-center w-12 bg-gradient-to-b from-gray-50 to-gray-100 border-l border-gray-200 group-hover:bg-gradient-to-b group-hover:from-indigo-50 group-hover:to-indigo-100 transition-all duration-300">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}

export default TripCard 