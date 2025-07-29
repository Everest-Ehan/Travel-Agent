'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import UserProfile from '../components/auth/UserProfile'
import ClientManagement from '../components/ClientManagement'
import TripCard from '../components/TripCard'
import { Client } from '../types/auth'
import { Trip, TripsResponse } from '../types/trip'
import { ApiService } from '../services/api'

export default function Dashboard() {
  const { user, userClient } = useAuth()
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'trips'>('overview')
  
  // Trips state
  const [trips, setTrips] = useState<Trip[]>([])
  const [tripsLoading, setTripsLoading] = useState(false)
  const [tripsError, setTripsError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all')
  


  // Fetch trips when user is available and trips tab is active
  useEffect(() => {
    if (user && userClient && activeTab === 'trips') {
      fetchTrips()
    }
  }, [user, userClient, activeTab])

  const fetchTrips = async () => {
    if (!userClient?.id) return
    
    try {
      setTripsLoading(true)
      setTripsError(null)
      console.log('🔍 Fetching trips for client ID:', userClient.id)
      
      const response: TripsResponse = await ApiService.fetchTrips(userClient.id)
      setTrips(response.results || [])
      console.log('✅ Trips fetched:', response.results?.length || 0)
    } catch (error) {
      console.error('❌ Failed to fetch trips:', error)
      setTripsError(error instanceof Error ? error.message : 'Failed to fetch trips')
      setTrips([])
    } finally {
      setTripsLoading(false)
    }
  }

  const filteredTrips = trips.filter(trip => {
    if (statusFilter === 'all') return true
    return trip.status === statusFilter
  })

  const getStatusCounts = () => {
    const counts = {
      all: trips.length,
      upcoming: trips.filter(t => t.status === 'upcoming').length,
      past: trips.filter(t => t.status === 'past').length,
      cancelled: trips.filter(t => t.status === 'cancelled').length
    }
    return counts
  }

  const statusCounts = getStatusCounts()

    const handleTripClick = (trip: Trip) => {
    // Navigate to the trip details page
    window.location.href = `/trip/${trip.id}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <a href="/" className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors">
                Travel Agent
              </a>
              <nav className="hidden md:flex space-x-6">
                <a href="/" className="text-gray-500 hover:text-gray-900 transition-colors">Home</a>
                <a href="/dashboard" className="text-indigo-600 font-medium">Dashboard</a>
              </nav>
            </div>
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your travel plans.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('trips')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'trips'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Trips ({statusCounts.all})
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'clients'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Client Management
            </button>
          </nav>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-indigo-100 rounded-lg p-3 mr-4">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{statusCounts.upcoming}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-lg p-3 mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Trips</p>
                    <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-lg p-3 mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Trips</p>
                    <p className="text-2xl font-bold text-gray-900">{statusCounts.past}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Trips</h2>
                  </div>
                  <div className="p-6">
                    {trips.length > 0 ? (
                      <div className="space-y-4">
                        {trips.slice(0, 3).map((trip) => (
                          <TripCard key={trip.id} trip={trip} onClick={() => handleTripClick(trip)} />
                        ))}
                        {trips.length > 3 && (
                          <div className="text-center pt-4">
                            <button
                              onClick={() => setActiveTab('trips')}
                              className="text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                              View all {trips.length} trips →
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No trips yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Start booking hotels to see your trips here.
                        </p>
                        <div className="mt-6">
                          <a
                            href="/"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                          >
                            Start Exploring
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <a
                      href="/"
                      className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <div className="bg-indigo-100 rounded-lg p-2 mr-3">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Search Hotels</p>
                        <p className="text-sm text-gray-500">Find your next destination</p>
                      </div>
                    </a>

                    <button
                      onClick={() => setActiveTab('trips')}
                      className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <div className="bg-green-100 rounded-lg p-2 mr-3">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">View All Trips</p>
                        <p className="text-sm text-gray-500">See all your travel plans</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('clients')}
                      className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <div className="bg-blue-100 rounded-lg p-2 mr-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Manage Clients</p>
                        <p className="text-sm text-gray-500">View and manage client cards</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'trips' ? (
          <div className="space-y-8">
            {/* Trips Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Trips</h2>
                  <p className="text-gray-600 text-lg">Manage and view all your travel plans</p>
                </div>
                <button
                  onClick={fetchTrips}
                  disabled={tripsLoading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {tripsLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh Trips
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Status</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'all', label: 'All Trips', count: statusCounts.all, color: 'bg-gray-100 text-gray-700 border-gray-200' },
                  { key: 'upcoming', label: 'Upcoming', count: statusCounts.upcoming, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                  { key: 'past', label: 'Past', count: statusCounts.past, color: 'bg-slate-100 text-slate-700 border-slate-200' },
                  { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled, color: 'bg-red-100 text-red-700 border-red-200' }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setStatusFilter(filter.key as any)}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                      statusFilter === filter.key
                        ? `${filter.color} shadow-md scale-105`
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{filter.label}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        statusFilter === filter.key ? 'bg-white bg-opacity-20' : 'bg-gray-100'
                      }`}>
                        {filter.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {tripsError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-red-800">Error loading trips</h3>
                    <p className="text-red-700 mt-2">{tripsError}</p>
                    <button
                      onClick={fetchTrips}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Trips List */}
            {tripsLoading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-600 mt-6 text-lg">Loading your trips...</p>
                  <p className="text-gray-500 mt-2">Please wait while we fetch your travel plans</p>
                </div>
              </div>
            ) : filteredTrips.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {statusFilter === 'all' ? 'All Trips' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Trips`}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-4">
                  {filteredTrips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} onClick={() => handleTripClick(trip)} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
                <div className="text-center">
                  <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {statusFilter === 'all' ? 'No trips found' : `No ${statusFilter} trips`}
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {statusFilter === 'all' 
                      ? 'Start booking hotels to see your trips here. Your travel plans will appear in this section once you make your first booking.'
                      : `You don't have any ${statusFilter} trips yet. Check other status filters or start planning your next adventure.`
                    }
                  </p>
                  {statusFilter === 'all' && (
                    <a
                      href="/"
                      className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Start Exploring
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <ClientManagement onClientSelect={setSelectedClient} />
        )}

        
      </main>
    </div>
  )
} 