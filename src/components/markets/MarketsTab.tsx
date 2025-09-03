import React from 'react'
import { AIMarketNarrative } from './AIMarketNarrative'
import { SocialSentimentTracker } from './SocialSentimentTracker'
import { CorrelationMatrix3D } from './CorrelationMatrix3D'
import { LiveMarketData } from './LiveMarketData'

export function MarketsTab() {
  return (
    <div className="space-y-8">
      {/* AI Market Narrative - Top Priority */}
      <AIMarketNarrative />
      
      {/* Live Market Data */}
      <LiveMarketData />
      
      {/* Social Sentiment Tracker */}
      <SocialSentimentTracker />
      
      {/* 3D Correlation Matrix */}
      <CorrelationMatrix3D />
    </div>
  )
}