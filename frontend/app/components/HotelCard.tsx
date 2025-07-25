'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Hotel } from '../types/hotel'
import { ApiService } from '../services/api'

interface HotelCardProps {
  hotel: Hotel
  loadingRate?: boolean
  loadingCard?: boolean
  filters?: any
  onClick?: () => void
}

export default function HotelCard({ hotel, loadingRate = false, loadingCard = false, filters, onClick }: HotelCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageInView, setImageInView] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (imageRef.current) {
      observer.observe(imageRef.current)
    }

    return () => observer.disconnect()
  }, [])

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
    <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100" onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Card Loading Overlay */}
      {loadingCard && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-primary-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-semibold text-primary-700">Loading details...</span>
          </div>
        </div>
      )}
      {/* Hotel Image */}
      {hotel.images && hotel.images.length > 0 && (
        <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden" ref={imageRef}>
          {imageInView ? (
            <img
              src={`https://media.fora.travel/foratravelportal/image/upload/c_fill,w_400,h_300,g_auto/f_auto/q_auto/v1/${hotel.images[0].public_id}`}
              alt={hotel.name}
              className={`w-full h-full object-cover transition-transform duration-700 hover:scale-110 transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                setImageLoaded(true)
              }}
            />
          ) : (
            <div className="w-full h-full animate-pulse bg-gray-300"></div>
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
          </div>

          {/* Favorite Button */}
          {/* <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all duration-200" onClick={e => e.stopPropagation()}>
            <svg className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button> */}

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
      )}

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
            <div className="flex flex-wrap gap-2 items-center">
              <div className="px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
                <span className="text-sm font-medium text-amber-700 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Extra perks included!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Rate Section */}
        {loadingRate ? (
          <div className="mb-4 p-4 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border border-primary-100">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
            </div>
            
            {/* Rate Details Grid Loading */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/70 rounded-lg p-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 flex items-center justify-center text-sm text-primary-600">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading rates...
            </div>
          </div>
        ) : hotel.rate ? (
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
            </div>
            
            {/* Rate Details Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
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
        ) : null}

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