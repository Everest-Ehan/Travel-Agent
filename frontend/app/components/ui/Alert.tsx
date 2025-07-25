import React from 'react'

interface AlertProps {
  type: 'error' | 'success' | 'info'
  message: string
  className?: string
}

export default function Alert({ type, message, className = '' }: AlertProps) {
  const styles = {
    error: 'bg-red-50 border border-red-200 rounded-lg p-3',
    success: 'bg-green-50 border border-green-200 rounded-lg p-3',
    info: 'bg-blue-50 border border-blue-200 rounded-lg p-4'
  }

  const icons = {
    error: (
      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    success: (
      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    )
  }

  const textColors = {
    error: 'text-red-700',
    success: 'text-green-700',
    info: 'text-blue-700'
  }

  return (
    <div className={`${styles[type]} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="ml-3">
          <p className={`text-sm ${textColors[type]}`}>{message}</p>
        </div>
      </div>
    </div>
  )
} 