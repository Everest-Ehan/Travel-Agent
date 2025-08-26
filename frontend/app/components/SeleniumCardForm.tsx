'use client'

import React, { useState, useEffect } from 'react'
import { ApiService } from '../services/api'

interface SeleniumCardFormProps {
  checkoutUrl: string
  clientName?: string
  onCardCreated: () => void
  onCancel: () => void
}

interface ProgressUpdate {
  message: string
  percentage: number
  timestamp: number
}

interface CardData {
  number: string
  expiry: string
  cvv: string
  name: string
  address: string
  cardLabel: string
  apartment: string
  city: string
  state: string
  zipCode: string
}

export default function SeleniumCardForm({ 
  checkoutUrl, 
  clientName = "Testing 1", 
  onCardCreated, 
  onCancel 
}: SeleniumCardFormProps) {
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>('form')
  const [progress, setProgress] = useState<ProgressUpdate[]>([])
  const [currentProgress, setCurrentProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState('')
  const [error, setError] = useState('')
  const [duration, setDuration] = useState('')
  const [formData, setFormData] = useState<CardData>({
    number: '5556710479144892',
    expiry: '12/29',
    cvv: '202',
    name: 'Sathvik Nori',
    address: '16075 Surprise Ln',
    cardLabel: 'Test Card',
    apartment: 'Apt 1',
    city: 'Huntington Beach',
    state: 'CA',
    zipCode: '92649'
  })

  const handleInputChange = (field: keyof CardData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep('processing')
    setProgress([])
    setCurrentProgress(0)
    setCurrentMessage('')
    setError('')
    setDuration('')

    try {
      const startTime = Date.now()
      
      // Call the Selenium endpoint using API service
      const result = await ApiService.createCardWithSelenium(checkoutUrl, formData, clientName)
      const endTime = Date.now()
      const totalDuration = ((endTime - startTime) / 1000).toFixed(2)
      setDuration(`${totalDuration} seconds`)

      if (result.success) {
        setStep('success')
        setProgress(result.progress_updates || [])
        if (result.progress_updates && result.progress_updates.length > 0) {
          const lastUpdate = result.progress_updates[result.progress_updates.length - 1]
          setCurrentProgress(lastUpdate.percentage)
          setCurrentMessage(lastUpdate.message)
        }
      } else {
        setStep('error')
        setError(result.message || 'Failed to create card')
      }
    } catch (err) {
      setStep('error')
      setError(err instanceof Error ? err.message : 'Failed to create card')
    }
  }

  const simulateProgress = () => {
    const steps = [
      { message: "Initializing payment processing...", percentage: 5 },
      { message: "Establishing secure connection...", percentage: 10 },
      { message: "Validating payment gateway...", percentage: 15 },
      { message: "Loading payment interface...", percentage: 20 },
      { message: "Authenticating payment system...", percentage: 25 },
      { message: "Authentication successful", percentage: 30 },
      { message: "Preparing payment form...", percentage: 35 },
      { message: "Configuring payment details...", percentage: 40 },
      { message: "Payment details configured", percentage: 45 },
      { message: "Opening payment form...", percentage: 50 },
      { message: "Payment form ready", percentage: 55 },
      { message: "Processing card information...", percentage: 60 },
      { message: "Card information processed", percentage: 65 },
      { message: "Validating security details...", percentage: 70 },
      { message: "Security validation complete", percentage: 75 },
      { message: "Submitting payment information...", percentage: 80 },
      { message: "Payment information submitted", percentage: 85 },
      { message: "Finalizing payment...", percentage: 90 },
      { message: "Payment completed successfully", percentage: 100 }
    ]

    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep]
        setCurrentProgress(step.percentage)
        setCurrentMessage(step.message)
        setProgress(prev => [...prev, { ...step, timestamp: Date.now() }])
        currentStep++
      } else {
        clearInterval(interval)
      }
    }, 1500) // Update every 1.5 seconds

    return interval
  }

  useEffect(() => {
    if (step === 'processing') {
      const interval = simulateProgress()
      return () => clearInterval(interval)
    }
  }, [step, clientName])

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-md">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Processing Payment Card
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Please wait while we process your payment information...
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{currentProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${currentProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Current Step */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-900 mb-2">Current Step:</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {currentMessage}
              </p>
            </div>

            {/* Progress Log */}
            <div className="max-h-32 overflow-y-auto">
              <p className="text-xs font-medium text-gray-900 mb-2">Progress Log:</p>
              <div className="text-xs text-gray-600 space-y-1">
                {progress.slice(-3).map((update, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{update.message}</span>
                    <span>{update.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Payment Card Added Successfully!
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Your payment card has been successfully saved.
              </p>
            {duration && (
              <p className="text-xs text-gray-500 mb-4">
                Total time: {duration}
              </p>
            )}
            <button
              onClick={onCardCreated}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to Add Payment Card
              </h3>
            <p className="text-sm text-gray-600 mb-4">
              {error}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setStep('form')}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onCancel}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Add Payment Card</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>



        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number *
            </label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5556710479144892"
              required
            />
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date *
              </label>
              <input
                type="text"
                value={formData.expiry}
                onChange={(e) => handleInputChange('expiry', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12/29"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV *
              </label>
              <input
                type="text"
                value={formData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="202"
                required
              />
            </div>
          </div>

          {/* Cardholder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cardholder Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
              required
            />
          </div>

          {/* Card Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Label (Optional)
            </label>
            <input
              type="text"
              value={formData.cardLabel}
              onChange={(e) => handleInputChange('cardLabel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter card label"
            />
          </div>

          {/* Billing Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Address *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123 Main St"
              required
            />
          </div>

          {/* Apartment Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apartment Number (Optional)
            </label>
            <input
              type="text"
              value={formData.apartment}
              onChange={(e) => handleInputChange('apartment', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Apt 1"
            />
          </div>

          {/* City, State, Zip */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Huntington Beach"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CA"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zip Code *
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="92649"
                required
              />
            </div>
          </div>



          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Payment Card
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 