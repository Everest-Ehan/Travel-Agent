'use client'

import React from 'react'
import { Hotel } from '../types/hotel'
import { ApiService } from '../services/api'

interface HotelCardProps {
  hotel: Hotel
  filters?: any // Add filters prop for now
  onClick?: () => void
}

export default function HotelCard({ hotel, filters, onClick }: HotelCardProps) {
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

  // Handler for card click
  const handleCardClick = async () => {
    console.log(`Hotel card clicked: ${hotel.name} (ID: ${hotel.id})`);
    console.log('Sending request for hotel details...');
    // Fetch hotel details
    try {
      const details = await ApiService.fetchHotelDetails(hotel.id);
      console.log('Hotel details received:', details);
    } catch (err) {
      console.error('Error in hotel details request:', err);
    }
    // Prepare correct filter params for filtered hotels
    const filterParams = {
      view_mode: filters?.view_mode || 'list',
      adults: filters?.adults || 2,
      dates: `${filters?.start_date || '2025-08-11'}-${filters?.end_date || '2025-08-16'}`,
      rooms: filters?.rooms || 1,
      q: hotel.name,
      currency: filters?.currency || 'USD',
    };
    console.log('Sending request for filtered hotels with params:', filterParams);
    try {
      const filtered = await ApiService.fetchFilteredHotels(filterParams);
      console.log('Filtered hotels API response:', filtered);
    } catch (err) {
      console.error('Error in filtered hotels request:', err);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100" onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Hotel Image */}
      {hotel.images && hotel.images.length > 0 && (
        <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          <img
            src={`https://media.fora.travel/foratravelportal/image/upload/c_fill,w_400,h_300,g_auto/f_auto/q_auto/v1/${hotel.images[0].public_id}`}
            alt={hotel.name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          
          {/* Hotel Class Badge */}
          {hotel.hotel_class && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
              {hotel.hotel_class}★
            </div>
          )}
          
          {/* Labels */}
          {hotel.labels && hotel.labels.length > 0 && (
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {hotel.labels.slice(0, 2).map((label, index) => (
                <span
                  key={index}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${
                    label.slug === 'reserve' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                  }`}
                >
                  {label.text}
                </span>
              ))}
            </div>
          )}
          
          {/* Favorite Button */}
          <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all duration-200" onClick={e => e.stopPropagation()}>
            <svg className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      )}
      
      <div className="p-6">
        {/* Hotel Name and Brand */}
        <div className="mb-4">
          <h4 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
            {hotel.name}
          </h4>
          {hotel.brand_name && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <p className="text-sm text-gray-600 font-medium">
                {hotel.brand_name}
              </p>
            </div>
          )}
        </div>
        
        {/* Location */}
        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary-100 rounded-lg">
              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-gray-700 font-medium">{hotel.location}</span>
          </div>
        </div>
        
        {/* Rating */}
        {hotel.average_review_rating && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
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
                <span className="text-sm font-semibold text-gray-700">
                  {hotel.average_review_rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {hotel.total_review_count} reviews
              </span>
            </div>
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
          <div className="mb-6 p-5 bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl border border-primary-100">
            <div className="space-y-4">
              {/* Nightly Rate */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-3xl font-bold text-primary-700">
                    {getRateDisplay()}
                  </div>
                  <div className="text-sm text-primary-600 font-medium">
                    {getTotalDisplay()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">Commission</div>
                  <div className="text-xl font-bold text-green-600">
                    {getCommissionDisplay()}
                  </div>
                </div>
              </div>
              
              {/* Additional Rate Info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary-200">
                <div className="text-center p-3 bg-white/60 rounded-xl">
                  <div className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-1">Commissionable</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {hotel.rate.is_commissionable ? 'Yes' : 'No'}
                  </div>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-xl">
                  <div className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-1">Children Support</div>
                  <div className="text-sm font-semibold text-gray-800 capitalize">
                    {hotel.rate.children_support}
                  </div>
                </div>
                {hotel.rate.payout_speed && (
                  <div className="col-span-2 text-center p-3 bg-white/60 rounded-xl">
                    <div className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-1">Payout Speed</div>
                    <div className="text-sm font-semibold text-gray-800">
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
        <div className="flex gap-3">
          {hotel.is_bookable && (
            <button className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Book Now
            </button>
          )}
          {hotel.gmaps_link && (
            <a
              href={hotel.gmaps_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              onClick={e => e.stopPropagation()}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )
} 