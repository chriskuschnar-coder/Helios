import React from 'react'
import { MarketRegimeDetector } from './MarketRegimeDetector'
import { InstitutionalFlowIntelligence } from './InstitutionalFlowIntelligence'
import { QuantitativeReports } from './QuantitativeReports'
import { CrossAssetCorrelations } from './CrossAssetCorrelations'
import { FactorAnalysis } from './FactorAnalysis'
import { ModelPlayground } from './ModelPlayground'

export function ResearchTab() {
  console.log('🔬 ResearchTab component rendering...')
  
  return (
    <div className="space-y-4 md:space-y-6">
      {/* AI Market Regime Detection - Top Priority */}
      <MarketRegimeDetector />
      
      {/* Smart Money Tracker */}
      <InstitutionalFlowIntelligence />
      
      {/* Quantitative Research Reports */}
      <QuantitativeReports />
    </div>
  )
}