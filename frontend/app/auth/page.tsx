'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import LoginForm from '../components/auth/LoginForm'
import SignUpForm from '../components/auth/SignUpForm'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    const messageParam = searchParams.get('message')
    if (messageParam) {
      setMessage(messageParam)
      // Auto-switch to signup if they need to create an account
      if (messageParam.includes('sign up')) {
        setIsLogin(false)
      }
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Welcome to Travel Agent
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Discover amazing hotels and destinations around the world. Your perfect stay awaits.
            </p>
            
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="bg-white/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Search</h3>
                <p className="text-indigo-100">Find the perfect hotel with our intelligent search</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Best Prices</h3>
                <p className="text-indigo-100">Get the best deals and competitive rates</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Secure Booking</h3>
                <p className="text-indigo-100">Safe and secure booking experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Message Display */}
        {message && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">{message}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          {/* Left Column - Auth Forms */}
          <div className="order-2 lg:order-1">
            <div className="h-full">
              {isLogin ? (
                <LoginForm onSwitchToSignUp={() => setIsLogin(false)} />
              ) : (
                <SignUpForm onSwitchToLogin={() => setIsLogin(true)} />
              )}
            </div>
          </div>

          {/* Right Column - Benefits & CTA */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 h-full flex flex-col">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {isLogin ? 'Welcome Back!' : 'Join Travel Agent'}
              </h2>
              
              {isLogin ? (
                <div className="space-y-6 flex-1 flex flex-col">
                  <p className="text-lg text-gray-600">
                    Sign in to access your personalized travel experience and continue exploring amazing destinations.
                  </p>
                  
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center">
                      <div className="bg-green-100 rounded-full p-2 mr-4">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Access your saved hotels</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-green-100 rounded-full p-2 mr-4">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">View booking history</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-green-100 rounded-full p-2 mr-4">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Get personalized recommendations</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 mt-auto">
                    <p className="text-gray-600 mb-4">Don't have an account?</p>
                    <button
                      onClick={() => setIsLogin(false)}
                      className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 flex-1 flex flex-col">
                  <p className="text-lg text-gray-600">
                    Create your account and start your journey to discovering the world's best hotels and destinations.
                  </p>
                  
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-full p-2 mr-4">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Free account creation</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-full p-2 mr-4">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Exclusive member benefits</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-full p-2 mr-4">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Early access to deals</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 mt-auto">
                    <p className="text-gray-600 mb-4">Already have an account?</p>
                    <button
                      onClick={() => setIsLogin(true)}
                      className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trust Indicators - Moved to bottom for better positioning */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-4">Trusted by travelers worldwide</p>
          <div className="flex justify-center space-x-8 opacity-60">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">10K+</div>
              <div className="text-xs text-gray-500">Happy Travelers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">500+</div>
              <div className="text-xs text-gray-500">Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">24/7</div>
              <div className="text-xs text-gray-500">Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 