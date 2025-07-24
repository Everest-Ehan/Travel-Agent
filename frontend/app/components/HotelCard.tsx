'use client'

import React from 'react'
import { Hotel } from '../types/hotel'

interface HotelCardProps {
  hotel: Hotel
}

export default function HotelCard({ hotel }: HotelCardProps) {
  const formatRate = (rate?: number, currency: string = 'USD') => {
    if (!rate) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(rate)
  }

  const getRateDisplay = () => {
    if (!hotel.rate) return null
    
    const { rate } = hotel
    return `${formatRate(rate.nightly_rate, rate.currency)}/night`
  }

  const getTotalDisplay = () => {
    if (!hotel.rate) return null
    
    const { rate } = hotel
    return `${formatRate(rate.total, rate.currency)} total`
  }

  const getCommissionDisplay = () => {
    if (!hotel.rate) return null
    
    const { rate } = hotel
    if (rate.lowest_commission === rate.highest_commission) {
      return `${rate.lowest_commission}%`
    }
    return `${rate.lowest_commission}-${rate.highest_commission}%`
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Hotel Image */}
      {hotel.images && hotel.images.length > 0 && (
        <div className="relative h-48 bg-gray-200">
          <img
            src={`https://media.fora.travel/foratravelportal/image/upload/c_fill,w_400,h_300,g_auto/f_auto/q_auto/v1/${hotel.images[0].public_id}`}
            alt={hotel.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          {/* Hotel Class Badge */}
          {hotel.hotel_class && (
            <div className="absolute top-3 left-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-semibold">
              {hotel.hotel_class}★
            </div>
          )}
          {/* Labels */}
          {hotel.labels && hotel.labels.length > 0 && (
            <div className="absolute top-3 right-3 flex flex-col gap-1">
              {hotel.labels.slice(0, 2).map((label, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    label.slug === 'reserve' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-green-600 text-white'
                  }`}
                >
                  {label.text}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="p-6">
        {/* Hotel Name and Brand */}
        <div className="mb-3">
          <h4 className="text-xl font-bold text-gray-900 mb-1">
            {hotel.name}
          </h4>
          {hotel.brand_name && (
            <p className="text-sm text-gray-500 font-medium">
              {hotel.brand_name}
            </p>
          )}
        </div>
        
        {/* Location */}
        <p className="text-gray-600 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {hotel.location}
        </p>
        
        {/* Rating */}
        {hotel.average_review_rating && (
          <div className="flex items-center mb-3">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(hotel.average_review_rating!) ? 'fill-current' : 'fill-gray-300'}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {hotel.average_review_rating.toFixed(1)} ({hotel.total_review_count} reviews)
            </span>
          </div>
        )}
        
        {/* Awards */}
        {hotel.awards && hotel.awards.length > 0 && (
          <div className="mb-3">
            {hotel.awards.map((award, index) => (
              <span
                key={index}
                className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-2 mb-1"
              >
                {award.label}
              </span>
            ))}
          </div>
        )}
        
        {/* Programs */}
        {hotel.programs && hotel.programs.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {hotel.programs.slice(0, 3).map((program, index) => (
                <img
                  key={index}
                  src={program.logo_url}
                  alt={program.name}
                  className="h-6 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Rate Display */}
        {hotel.rate && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-3">
              {/* Nightly Rate */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold text-primary-600">
                    {getRateDisplay()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {getTotalDisplay()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Commission</div>
                  <div className="text-lg font-semibold text-green-600">
                    {getCommissionDisplay()}
                  </div>
                </div>
              </div>
              
              {/* Additional Rate Info */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Commissionable</div>
                  <div className="text-sm font-medium">
                    {hotel.rate.is_commissionable ? 'Yes' : 'No'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Children Support</div>
                  <div className="text-sm font-medium capitalize">
                    {hotel.rate.children_support}
                  </div>
                </div>
                {hotel.rate.payout_speed && (
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Payout Speed</div>
                    <div className="text-sm font-medium">
                      {hotel.rate.payout_speed}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          {hotel.commission_range && (
            <div className="text-gray-600">
              <span className="font-medium">Commission:</span> {hotel.commission_range}
            </div>
          )}
          {hotel.payout_speed && (
            <div className="text-gray-600">
              <span className="font-medium">Payout:</span> {hotel.payout_speed}
            </div>
          )}
        </div>
        
        {/* Booking Stats */}
        {hotel.last_year_booking_count && (
          <div className="text-xs text-gray-500 mb-4">
            {hotel.last_year_booking_count} bookings last year
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {hotel.is_bookable && (
            <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
              Book Now
            </button>
          )}
          {hotel.gmaps_link && (
            <a
              href={hotel.gmaps_link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )
} 