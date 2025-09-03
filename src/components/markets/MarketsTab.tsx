import React from 'react'
import { AIMarketNarrative } from './AIMarketNarrative'
import { SocialSentimentTracker } from './SocialSentimentTracker'
import { EconomicCalendar } from './EconomicCalendar'
import { LiveMarketData } from './LiveMarketData'
import { OptionsFlowTracker } from './OptionsFlowTracker'

export function MarketsTab() {
  return (
    <div className="space-y-8">
      {/* AI Market Narrative - Top Priority */}
      <AIMarketNarrative />
      
      {/* Live Market Data */}
      <LiveMarketData />
      
      {/* Social Sentiment Tracker */}
      <SocialSentimentTracker />
      
      {/* Options Flow Tracker */}
      <OptionsFlowTracker />
      
      {/* Economic Calendar */}
      <EconomicCalendar />
    </div>
  )
}