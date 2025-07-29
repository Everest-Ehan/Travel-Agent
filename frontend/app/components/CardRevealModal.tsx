'use client'

import React, { useEffect } from 'react'

interface CardRevealModalProps {
  isOpen: boolean
  onClose: () => void
  cardData: any
  cardInfo: {
    holder_name: string
    last_4: string
    expire_month: string
    expire_year: string
    card_logo: string
  }
}

export default function CardRevealModal({ isOpen, onClose, cardData, cardInfo }: CardRevealModalProps) {
  console.log('CardRevealModal props:', { isOpen, cardData, cardInfo })
  
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    console.log('Modal not showing - isOpen is false')
    return null
  }

  console.log('Modal should be showing')

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
    console.log(`${label} copied to clipboard`)
  }

  const formatCardNumber = () => {
    if (!cardData?.card_data?.first_6 || !cardData?.card_data?.last_4) return '**** **** **** ****'
    const first6 = cardData.card_data.first_6
    const last4 = cardData.card_data.last_4
    return `${first6} **** **** ${last4}`
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Card Information</h2>
        <p className="mb-4">Modal is working!</p>
        <p className="mb-4">Card Holder: {cardInfo?.holder_name}</p>
        <p className="mb-4">Card Number: {cardData?.card_data?.first_6}******{cardData?.card_data?.last_4}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  )
}