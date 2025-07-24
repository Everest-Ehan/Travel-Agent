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
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hotel.hotel_class && (
            <div className="bg-white/95 backdrop-blur-sm text-gray-900 px-2.5 py-1 rounded-full text-sm font-bold shadow-lg">
              {hotel.hotel_class}★
            </div>
          )}
          {hotel.labels && hotel.labels.length > 0 && (
            hotel.labels.slice(0, 1).map((label, index) => (
              <span
                key={index}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${
                  label.slug === 'reserve' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                }`}
              >
                {label.text}
              </span>
            ))
          )}

          
          {/* Favorite Button */}
          <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all duration-200" onClick={e => e.stopPropagation()}>
            <svg className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

        </div>

        {/* Favorite Button */}
        <button className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all duration-200">
          <svg className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Hotel Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <h4 className="text-lg font-bold text-white leading-tight">
            {hotel.name}
          </h4>
          {hotel.brand_name && (
            <p className="text-sm text-gray-200 mt-1">
              {hotel.brand_name}
            </p>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Location and Rating Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">{hotel.location}</span>
          </div>
          
          {hotel.average_review_rating && (
            <div className="flex items-center gap-1.5">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.round(hotel.average_review_rating!) ? 'fill-current' : 'fill-gray-300'}`}
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
          )}
        </div>

        {/* Awards and Programs */}
        <div className="mb-4 space-y-2">
          {hotel.awards && hotel.awards.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hotel.awards.slice(0, 2).map((award, index) => (
                <span
                  key={index}
                  className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium"
                >
                  {award.label}
                </span>
              ))}
            </div>
          )}
          
          {hotel.programs && hotel.programs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {hotel.programs.slice(0, 3).map((program, index) => (
                <img
                  key={index}
                  src={program.logo_url}
                  alt={program.name}
                  className="h-5 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Rate Section */}
        {hotel.rate && (
          <div className="mb-4 p-4 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border border-primary-100">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-2xl font-bold text-primary-700">
                  {getRateDisplay()}
                </div>
                <div className="text-sm text-primary-600 font-medium">
                  {getTotalDisplay()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">Commission</div>
                <div className="text-lg font-bold text-green-600">
                  {getCommissionDisplay()}
                </div>
              </div>
            </div>
            
            {/* Rate Details Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/70 rounded-lg p-2">
                <div className="text-xs text-gray-600 font-medium">Commissionable</div>
                <div className="text-sm font-semibold text-gray-800">
                  {hotel.rate.is_commissionable ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="bg-white/70 rounded-lg p-2">
                <div className="text-xs text-gray-600 font-medium">Children</div>
                <div className="text-sm font-semibold text-gray-800 capitalize">
                  {hotel.rate.children_support}
                </div>
              </div>
              {hotel.rate.payout_speed && (
                <div className="bg-white/70 rounded-lg p-2">
                  <div className="text-xs text-gray-600 font-medium">Payout</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {hotel.rate.payout_speed.replace('payout ', '')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hotel Stats */}
        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
          {hotel.commission_range && (
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span>{hotel.commission_range}</span>
            </div>
          )}
          {hotel.payout_speed && (
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{hotel.payout_speed.replace('payout ', '')}</span>
            </div>
          )}
        </div>

        {/* Booking Stats */}
        {hotel.last_year_booking_count && hotel.last_year_booking_count > 0 && (
          <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>{hotel.last_year_booking_count} {hotel.last_year_booking_count === 1 ? 'booking' : 'bookings'} last year</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {hotel.is_bookable && (
            <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:transform active:scale-95">
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