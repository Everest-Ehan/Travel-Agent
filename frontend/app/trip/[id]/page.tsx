'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DetailedTrip } from '../../types/trip'
import { ApiService } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

const TripDetailsPage: React.FC = () => {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const tripId = params.id as string

  const [trip, setTrip] = useState<DetailedTrip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !tripId) return

    const fetchTripDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('🔍 Fetching trip details for trip ID:', tripId)

        const detailedTrip: DetailedTrip = await ApiService.fetchTripDetails(tripId)
        setTrip(detailedTrip)
        console.log('✅ Trip details fetched:', detailedTrip)
      } catch (error) {
        console.error('❌ Failed to fetch trip details:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch trip details')
      } finally {
        setLoading(false)
      }
    }

    fetchTripDetails()
  }, [user, tripId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: string | number) => {
    if (amount === null || amount === undefined) return '$0.00'
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'past':
        return 'bg-slate-100 text-slate-800 border-slate-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        )
      case 'past':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'cancelled':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const getTripDestination = () => {
    if (!trip) return ''
    const name = trip.name
    // Remove email prefix if present (e.g., "email@domain.com client's Trip Name")
    const match = name.match(/client's (.+)$/i)
    return match ? match[1] : name
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-900">Loading trip details...</p>
            <p className="text-gray-600 mt-2">Please wait while we fetch the complete information</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Trip Details</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex space-x-3">
              <button
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip Not Found</h2>
          <p className="text-gray-600 mb-4">The trip you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const hasValidImage = trip.image && trip.image.length > 0 && trip.image[0].url

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{getTripDestination()}</h1>
                <p className="text-sm text-gray-600">Trip Details</p>
              </div>
            </div>
            <div className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(trip.status)}`}>
              {getStatusIcon(trip.status)}
              <span className="ml-2 capitalize">{trip.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Trip Overview, Bookings) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trip Overview */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
              <div className="flex items-start space-x-6">
                {hasValidImage ? (
                  <div className="w-32 h-24 flex-shrink-0">
                    <img
                      src={trip.image[0].url}
                      alt={trip.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-24 flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-8 h-8 text-indigo-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                      </svg>
                      <p className="text-xs text-indigo-500 font-medium">Trip</p>
                    </div>
                  </div>
                )}
                
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{getTripDestination()}</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Start Date</p>
                      <p className="font-semibold text-gray-900">{formatDate(trip.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">End Date</p>
                      <p className="font-semibold text-gray-900">{formatDate(trip.end_date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-semibold text-gray-900">{trip.num_nights} nights</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Travelers</p>
                      <p className="font-semibold text-gray-900">{trip.clients.length}</p>
                    </div>
                  </div>
                  {trip.reason && typeof trip.reason.name === 'string' && (
                    <div className="mt-4">
                      <p className="text-gray-600 text-sm">Purpose</p>
                      <p className="font-semibold text-gray-900">{trip.reason.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bookings */}
            {trip.bookings && trip.bookings.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Bookings</h3>
                {trip.bookings.map((booking: any, index: number) => (
                  <div key={booking.unique_id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                         <div className="flex items-start justify-between mb-4">
                       <div>
                         <h4 className="text-lg font-semibold text-gray-900 mb-1">
                           {typeof booking.supplier === 'string' ? booking.supplier : 'Unknown Supplier'}
                         </h4>
                         <p className="text-sm text-gray-600">
                           {typeof booking.category === 'string' ? booking.category : 'No Category'} • {typeof booking.confirmation_num === 'string' ? booking.confirmation_num : 'No confirmation'}
                         </p>
                       </div>
                       <div className="text-right">
                         <p className="text-lg font-bold text-gray-900">
                           {formatCurrency(booking.total_commissionable_booking_usd)}
                         </p>
                         <p className="text-sm text-gray-600">{typeof booking.status === 'string' ? booking.status : 'Unknown'}</p>
                       </div>
                     </div>

                                         {/* Stay Details */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                       <div>
                         <p className="text-sm text-gray-600">Check-in</p>
                         <p className="font-semibold text-gray-900">{formatDate(booking.arrival)}</p>
                       </div>
                       <div>
                         <p className="text-sm text-gray-600">Check-out</p>
                         <p className="font-semibold text-gray-900">{formatDate(booking.departure)}</p>
                       </div>
                       <div>
                         <p className="text-sm text-gray-600">Guests</p>
                         <p className="font-semibold text-gray-900">{booking.number_of_adults || 'Not specified'}</p>
                       </div>
                       <div>
                         <p className="text-sm text-gray-600">Rooms</p>
                         <p className="font-semibold text-gray-900">{booking.rooms || 'Not specified'}</p>
                       </div>
                     </div>

                                         {/* Location */}
                     {booking.supplier_ref?.location && typeof booking.supplier_ref.location === 'string' && (
                       <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                         <p className="text-sm text-gray-600 mb-1">Location</p>
                         <p className="font-semibold text-gray-900">{booking.supplier_ref.location}</p>
                       </div>
                     )}

                                         {/* Cost Breakdown */}
                     {booking.line_items && booking.line_items.length > 0 && (
                       <div className="mb-4">
                         <h5 className="text-sm font-semibold text-gray-900 mb-2">Cost Breakdown</h5>
                         <div className="space-y-2">
                           {booking.line_items.map((item: any, itemIndex: number) => (
                             <div key={itemIndex} className="flex justify-between text-sm">
                               <span className="text-gray-600">{typeof item.label === 'string' ? item.label : 'Unknown item'}</span>
                               <span className="font-semibold text-gray-900">{formatCurrency(item.total)}</span>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                                         {/* Additional Information */}
                     {booking.additional_information && Array.isArray(booking.additional_information) && booking.additional_information.length > 0 && (
                       <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                         <p className="text-sm text-gray-600 mb-2">Additional Information</p>
                         <div className="space-y-2">
                           {booking.additional_information.map((info: any, infoIndex: number) => (
                             <div key={infoIndex}>
                               <p className="text-sm font-semibold text-gray-900">{info.title}</p>
                               <p className="text-sm text-gray-700">{info.content}</p>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                                         {/* Contact Information */}
                     {booking.contact_info && (
                       <div className="p-4 bg-green-50 rounded-lg">
                         <p className="text-sm text-gray-600 mb-2">Contact Information</p>
                         <div className="space-y-1 text-sm">
                           {booking.contact_info.phones && Array.isArray(booking.contact_info.phones) && booking.contact_info.phones.length > 0 && (
                             <div>
                               <p className="font-semibold text-gray-900">Phone Numbers:</p>
                               {booking.contact_info.phones.map((phone: any, phoneIndex: number) => (
                                 <p key={phoneIndex} className="text-gray-700">{phone.number}</p>
                               ))}
                             </div>
                           )}
                           {booking.contact_info.emails && Array.isArray(booking.contact_info.emails) && booking.contact_info.emails.length > 0 && (
                             <div>
                               <p className="font-semibold text-gray-900">Email Addresses:</p>
                               {booking.contact_info.emails.map((email: any, emailIndex: number) => (
                                 <p key={emailIndex} className="text-gray-700">{email.email}</p>
                               ))}
                             </div>
                           )}
                         </div>
                       </div>
                     )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trip Summary */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Trip Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bookings</span>
                  <span className="font-semibold text-gray-900">{trip.booking_summary.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Value</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(trip.commission_summary.total_value)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(trip.status)}`}>
                    {trip.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Travelers */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Travelers</h3>
              <div className="space-y-3">
                {trip.clients.map((client: any) => (
                  <div key={client.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-indigo-600">
                        {typeof client.first_name === 'string' && client.first_name.length > 0 ? client.first_name.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {typeof client.preferred_name === 'string' ? client.preferred_name : (typeof client.first_name === 'string' ? client.first_name : 'Unknown')} {typeof client.last_name === 'string' ? client.last_name : ''}
                      </p>
                      <p className="text-sm text-gray-600">{typeof client.type === 'string' ? client.type : 'Unknown'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {trip.notes && typeof trip.notes === 'string' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{trip.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TripDetailsPage 