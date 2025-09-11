import React from 'react'
import { Lock } from 'lucide-react'

// Disabled button component for funding actions
export function DisabledFundingButton({ 
  children, 
  kycStatus, 
  hasCompletedDocuments = false,
  className = "",
  onClick 
}: { 
  children: React.ReactNode
  kycStatus: string
  hasCompletedDocuments?: boolean
  className?: string
  onClick?: () => void
}) {
  const isDisabled = kycStatus !== 'verified'
  
  const getTooltipMessage = () => {
    if (!hasCompletedDocuments) {
      return 'Complete onboarding documents first'
    }
    
    switch (kycStatus) {
      case 'pending':
        return 'Funding locked - Identity verification in progress'
      case 'rejected':
        return 'Funding locked - Please resubmit verification documents'
      default:
        return 'Funding locked - Complete identity verification first'
    }
  }

  if (isDisabled) {
    return (
      <div className="relative group">
        <button
          disabled
          className={`${className} opacity-50 cursor-not-allowed relative`}
          title={getTooltipMessage()}
        >
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            {children}
          </div>
        </button>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
          {getTooltipMessage()}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  )
}