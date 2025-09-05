import React, { useState } from 'react'
import { FundingModal } from './FundingModal'
import { HeliosTerminalEmbed } from './HeliosTerminalEmbed'
import { useAuth } from './auth/AuthProvider'

export function HeliosDashboard() {
  const { account } = useAuth()
  const [showFundingModal, setShowFundingModal] = useState(false)

  const openFunding = () => {
    setShowFundingModal(true)
  }

  const closeFunding = () => {
    setShowFundingModal(false)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <HeliosTerminalEmbed
        onFundAccount={openFunding}
        userBalance={account?.balance || 0}
      />
      
      <FundingModal
        isOpen={showFundingModal}
        onClose={closeFunding}
      />
    </div>
  )
}