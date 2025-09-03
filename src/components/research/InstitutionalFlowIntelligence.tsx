import React, { useState, useEffect } from 'react'
import { Users, Eye, TrendingUp, TrendingDown, Building, Zap, RefreshCw, ExternalLink, X, BarChart3, Target, AlertTriangle, Clock, DollarSign, Activity } from 'lucide-react'

interface InstitutionalFlow {
  asset: string
  smart_money_flow: number
  retail_flow: number
  dark_pool_percentage: number
  whale_activity: number
  institutional_sentiment: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  timeframe: string
  price_impact: number
  volume_profile: string
  key_institutions: string[]
  flow_analysis: string
  trading_recommendation: string
}

interface FlowIntelligence {
  flows: InstitutionalFlow[]
  summary: {
    total_institutional_volume: number
    smart_money_direction: 'bullish' | 'bearish' | 'neutral'
    retail_vs_institutional_ratio: number
    dark_pool_activity_level: 'high' | 'medium' | 'low'
  }
  whale_alerts: {
    asset: string
    amount: string
    direction: 'buy' | 'sell'
    timestamp: string
    confidence: number
    institution: string
    impact_analysis: string
    follow_up_action: string
  }[]
  lastUpdated: string
}

interface FlowDetailModalProps {
  flow: InstitutionalFlow | null
  isOpen: boolean
  onClose: () => void
}

function FlowDetailModal({ flow, isOpen, onClose }: FlowDetailModalProps) {
  if (!isOpen || !flow) return null

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-600 bg-green-50 border-green-200'
      case 'bearish': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="h-5 w-5" />
      case 'bearish': return <TrendingDown className="h-5 w-5" />
      default: return <Activity className="h-5 w-5" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-navy-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              {flow.asset}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{flow.asset} Smart Money Analysis</h2>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span>Confidence: {flow.confidence}%</span>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(flow.institutional_sentiment)}`}>
                  {flow.institutional_sentiment.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Flow Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-900">
                  {flow.smart_money_flow > 0 ? '+' : ''}${Math.abs(flow.smart_money_flow).toFixed(0)}M
                </div>
                <div className="text-sm text-blue-700">Large Investor Flow</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-900">
                  {flow.retail_flow > 0 ? '+' : ''}${Math.abs(flow.retail_flow).toFixed(0)}M
                </div>
                <div className="text-sm text-purple-700">Small Investor Flow</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {flow.dark_pool_percentage.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-700">Private Trading</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-900">
                  {flow.price_impact > 0 ? '+' : ''}{flow.price_impact.toFixed(1)}%
                </div>
                <div className="text-sm text-orange-700">Price Impact</div>
              </div>
            </div>

            {/* Flow Analysis */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Smart Money Analysis
              </h3>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-blue-900 leading-relaxed">{flow.flow_analysis}</p>
              </div>
            </div>

            {/* Key Institutions */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <Building className="h-5 w-5 mr-2 text-purple-600" />
                Major Funds & Institutions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {flow.key_institutions.map((institution, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Building className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-900">{institution}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Volume Profile */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-600" />
                Trading Volume Analysis
              </h3>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-green-900">{flow.volume_profile}</p>
              </div>
            </div>

            {/* Trading Recommendation */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <Target className="h-5 w-5 mr-2 text-navy-600" />
                Investment Recommendation
              </h3>
              <div className="bg-navy-50 rounded-lg p-4 border border-navy-200">
                <p className="text-navy-900 font-medium">{flow.trading_recommendation}</p>
              </div>
            </div>

            {/* Flow Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Money Flow Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Large Investor Ratio:</span>
                    <span className="font-medium">{(Math.abs(flow.smart_money_flow) / (Math.abs(flow.smart_money_flow) + Math.abs(flow.retail_flow)) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Large Trade Activity:</span>
                    <span className="font-medium">{flow.whale_activity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timeframe:</span>
                    <span className="font-medium">{flow.timeframe}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Market Impact</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price Impact:</span>
                    <span className={`font-medium ${flow.price_impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {flow.price_impact > 0 ? '+' : ''}{flow.price_impact.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Private Trading %:</span>
                    <span className="font-medium">{flow.dark_pool_percentage.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-medium">{flow.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface WhaleAlertModalProps {
  alert: any | null
  isOpen: boolean
  onClose: () => void
}

function WhaleAlertModal({ alert, isOpen, onClose }: WhaleAlertModalProps) {
  if (!isOpen || !alert) return null

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-yellow-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Large Trade Alert</h2>
              <div className="text-sm text-gray-600">
                {alert.asset} • {getTimeAgo(alert.timestamp)} • {alert.confidence}% confidence
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-yellow-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Alert Summary */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{alert.asset === 'BTC' ? '₿' : alert.asset === 'ETH' ? 'Ξ' : '📈'}</span>
                <div>
                  <h3 className="font-bold text-yellow-900">{alert.asset} Large Trade {alert.direction.toUpperCase()}</h3>
                  <p className="text-sm text-yellow-700">{alert.institution}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-900">{alert.amount}</div>
                <div className={`text-sm font-medium ${alert.direction === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                  {alert.direction === 'buy' ? 'ACCUMULATION' : 'DISTRIBUTION'}
                </div>
              </div>
            </div>
          </div>

          {/* Impact Analysis */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Market Impact Analysis
            </h4>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-blue-900 leading-relaxed">{alert.impact_analysis}</p>
            </div>
          </div>

          {/* Follow-up Action */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <Target className="h-5 w-5 mr-2 text-navy-600" />
              Investment Recommendation
            </h4>
            <div className="bg-navy-50 rounded-lg p-4 border border-navy-200">
              <p className="text-navy-900 font-medium">{alert.follow_up_action}</p>
            </div>
          </div>

          {/* Alert Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Alert Details</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Confidence Level:</span>
                  <span className="font-medium">{alert.confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Detected:</span>
                  <span className="font-medium">{getTimeAgo(alert.timestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Direction:</span>
                  <span className={`font-medium ${alert.direction === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                    {alert.direction.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Fund/Institution</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Entity:</span>
                  <span className="font-medium">{alert.institution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{alert.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Asset:</span>
                  <span className="font-medium">{alert.asset}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function InstitutionalFlowIntelligence() {
  const [intelligence, setIntelligence] = useState<FlowIntelligence | null>(null)
  const [loading, setLoading] = useState(true)
  const [updateCount, setUpdateCount] = useState(0)
  const [selectedFlow, setSelectedFlow] = useState<InstitutionalFlow | null>(null)
  const [showFlowModal, setShowFlowModal] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [showAlertModal, setShowAlertModal] = useState(false)

  const generateFlowData = (): FlowIntelligence => {
    const timeVariation = Date.now() % 100000 / 100000
    const assets = ['BTC', 'ETH', 'SOL', 'ADA', 'MATIC', 'AVAX']
    
    const institutions = [
      'BlackRock', 'Fidelity', 'Grayscale', 'MicroStrategy', 'Tesla', 'Coinbase Ventures',
      'Andreessen Horowitz', 'Paradigm', 'Pantera Capital', 'Galaxy Digital'
    ]

    return {
      flows: assets.map(asset => {
        const smartFlow = (Math.random() - 0.5) * 200 + (timeVariation * 50)
        const retailFlow = (Math.random() - 0.5) * 100 + (timeVariation * 25)
        const sentiment = smartFlow > 50 ? 'bullish' : smartFlow < -50 ? 'bearish' : 'neutral'
        
        return {
          asset,
          smart_money_flow: smartFlow,
          retail_flow: retailFlow,
          dark_pool_percentage: 25 + Math.random() * 30 + (timeVariation * 10),
          whale_activity: Math.floor(60 + Math.random() * 35 + (timeVariation * 15)),
          institutional_sentiment: sentiment,
          confidence: Math.floor(75 + Math.random() * 20 + (timeVariation * 5)),
          timeframe: '24h',
          price_impact: (Math.random() - 0.5) * 8 + (timeVariation * 2),
          volume_profile: asset === 'BTC' 
            ? `Large block trades detected at $${(106000 + timeVariation * 2000).toFixed(0)} level. Smart money accumulation pattern suggests sustained buying pressure with average trade size of $2.3M.`
            : asset === 'ETH'
            ? `Ethereum showing strong smart money interest around $${(3200 + timeVariation * 200).toFixed(0)}. Major funds and ETF flows driving demand with 67% of volume from large investors.`
            : `${asset} experiencing ${smartFlow > 0 ? 'smart money accumulation' : 'profit-taking'} with ${Math.abs(smartFlow).toFixed(0)}M in large investor flow over 24h period.`,
          key_institutions: institutions.slice(0, 3 + Math.floor(timeVariation * 3)),
          flow_analysis: asset === 'BTC'
            ? `Bitcoin smart money analysis reveals ${smartFlow > 0 ? 'strong accumulation' : 'distribution'} patterns. Major funds and institutions are ${smartFlow > 0 ? 'adding to positions' : 'reducing exposure'} with ${Math.abs(smartFlow).toFixed(0)}M in net flow. Large trader activity at ${(25 + timeVariation * 30).toFixed(0)}% suggests sophisticated positioning.`
            : asset === 'ETH'
            ? `Ethereum showing ${sentiment} smart money sentiment with ${Math.abs(smartFlow).toFixed(0)}M in large investor flow. Staking derivatives and major fund activity driving interest. Layer 2 adoption creating new opportunities for big players.`
            : `${asset} smart money flow indicates ${sentiment} positioning with ${Math.abs(smartFlow).toFixed(0)}M net flow. ${smartFlow > 0 ? 'Accumulation' : 'Distribution'} phase detected across major investor wallets.`,
          trading_recommendation: smartFlow > 50
            ? `Strong BUY signal based on smart money accumulation. Consider increasing ${asset} allocation on any dips. Target entry below current levels with 2-3% position sizing.`
            : smartFlow < -50
            ? `CAUTION advised due to smart money distribution. Consider reducing ${asset} exposure or implementing hedges. Wait for accumulation signals before re-entering.`
            : `NEUTRAL stance recommended. Monitor for clearer smart money direction signals. Current flow patterns suggest consolidation phase.`
        }
      }),
      summary: {
        total_smart_money_volume: 2.4 + (timeVariation * 1.2),
        smart_money_direction: Math.random() > 0.5 ? 'bullish' : 'bearish',
        retail_vs_smart_money_ratio: 0.65 + (timeVariation * 0.3),
        dark_pool_activity_level: timeVariation > 0.7 ? 'high' : timeVariation > 0.3 ? 'medium' : 'low'
      },
      whale_alerts: [
        {
          asset: 'BTC',
          amount: '$' + (50 + Math.floor(timeVariation * 200)).toString() + 'M',
          direction: Math.random() > 0.5 ? 'buy' : 'sell',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          confidence: Math.floor(85 + timeVariation * 10),
          institution: institutions[Math.floor(timeVariation * institutions.length)],
          impact_analysis: `This ${(50 + Math.floor(timeVariation * 200))}M Bitcoin ${Math.random() > 0.5 ? 'purchase' : 'sale'} represents significant smart money activity. Based on historical patterns, moves of this size typically create 2-4% price impact within 24-48 hours. The timing suggests ${Math.random() > 0.5 ? 'strategic accumulation ahead of potential catalysts' : 'profit-taking or portfolio rebalancing'}.`,
          follow_up_action: Math.random() > 0.5 
            ? 'Monitor for follow-up buying. If confirmed, consider increasing BTC allocation by 1-2%. Watch for support at current levels.'
            : 'Expect potential downside pressure. Consider defensive positioning or wait for clearer accumulation signals before adding exposure.'
        },
        {
          asset: 'ETH',
          amount: '$' + (25 + Math.floor(timeVariation * 100)).toString() + 'M',
          direction: Math.random() > 0.5 ? 'buy' : 'sell',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          confidence: Math.floor(78 + timeVariation * 15),
          institution: institutions[Math.floor((timeVariation * 1000) % institutions.length)],
          impact_analysis: `Ethereum whale activity of ${(25 + Math.floor(timeVariation * 100))}M indicates ${Math.random() > 0.5 ? 'smart money confidence in ETH fundamentals' : 'profit-taking after recent gains'}. This size transaction typically influences ETH price by 1-3% and often signals broader altcoin market direction.`,
          follow_up_action: Math.random() > 0.5
            ? 'Bullish signal for ETH and broader altcoin market. Consider increasing ETH allocation or exploring high-quality altcoins.'
            : 'Monitor ETH support levels. Large sales may pressure altcoin market. Consider reducing risk or implementing hedges.'
        }
      ],
      lastUpdated: new Date().toISOString()
    }
  }

  const refreshData = async () => {
    setLoading(true)
    setUpdateCount(prev => prev + 1)
    await new Promise(resolve => setTimeout(resolve, 600))
    setIntelligence(generateFlowData())
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
    
    const interval = setInterval(refreshData, 45 * 1000) // Update every 45 seconds
    return () => clearInterval(interval)
  }, [])

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const handleFlowClick = (flow: InstitutionalFlow) => {
    setSelectedFlow(flow)
    setShowFlowModal(true)
  }

  const handleAlertClick = (alert: any) => {
    setSelectedAlert(alert)
    setShowAlertModal(true)
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-navy-900">Smart Money Tracker</h3>
              <p className="text-sm text-gray-600">
                Large Investor Activity • Update #{updateCount} • Click for details
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-600 font-medium">LIVE</span>
            <button
              onClick={refreshData}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading && !intelligence ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ) : intelligence && (
          <div className="space-y-6">
            {/* Summary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-900">
                  ${intelligence.summary.total_smart_money_volume.toFixed(1)}B
                </div>
                <div className="text-sm text-blue-700">Smart Money Volume</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-900 capitalize">
                  {intelligence.summary.smart_money_direction}
                </div>
                <div className="text-sm text-green-700">Large Investors</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-900">
                  {intelligence.summary.retail_vs_smart_money_ratio.toFixed(2)}:1
                </div>
                <div className="text-sm text-purple-700">Retail vs Smart Money</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 capitalize">
                  {intelligence.summary.dark_pool_activity_level}
                </div>
                <div className="text-sm text-gray-700">Private Trading</div>
              </div>
            </div>

            {/* Asset Flow Analysis - Clickable */}
            <div>
              <h5 className="text-lg font-bold text-gray-900 mb-4">Smart Money Flow Analysis (Click for Details)</h5>
              <div className="space-y-3">
                {intelligence.flows.slice(0, 6).map((flow, index) => (
                  <div 
                    key={index} 
                    onClick={() => handleFlowClick(flow)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-navy-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {flow.asset.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 group-hover:text-blue-900">{flow.asset}</div>
                        <div className="text-sm text-gray-600">
                          Private Trading: {flow.dark_pool_percentage.toFixed(0)}% • Confidence: {flow.confidence}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm text-gray-600">Smart:</span>
                        <span className={`font-medium ${flow.smart_money_flow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {flow.smart_money_flow > 0 ? '+' : ''}${flow.smart_money_flow.toFixed(0)}M
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Retail:</span>
                        <span className={`font-medium ${flow.retail_flow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {flow.retail_flow > 0 ? '+' : ''}${flow.retail_flow.toFixed(0)}M
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        flow.institutional_sentiment === 'bullish' ? 'bg-green-100 text-green-800' :
                        flow.institutional_sentiment === 'bearish' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {flow.institutional_sentiment}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                        <ExternalLink className="h-4 w-4 text-blue-600 mx-auto" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Whale Alerts - Clickable */}
            <div>
              <h5 className="text-lg font-bold text-gray-900 mb-4">Large Trade Alerts (Click for Analysis)</h5>
              <div className="space-y-3">
                {intelligence.whale_alerts.map((alert, index) => (
                  <div 
                    key={index} 
                    onClick={() => handleAlertClick(alert)}
                    className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 hover:border-yellow-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 group-hover:text-yellow-900">
                          {alert.asset} Large Trade {alert.direction.toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getTimeAgo(alert.timestamp)} • {alert.institution} • {alert.confidence}% confidence
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{alert.amount}</div>
                      <div className={`text-sm font-medium ${
                        alert.direction === 'buy' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {alert.direction === 'buy' ? 'ACCUMULATION' : 'DISTRIBUTION'}
                      </div>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-navy-50 rounded-lg p-4">
              <h5 className="font-medium text-navy-900 mb-3">Smart Money Summary</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-navy-900">
                    {intelligence.flows.filter(f => f.smart_money_flow > 0).length}
                  </div>
                  <div className="text-sm text-navy-700">Bullish Assets</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-navy-900">
                    {intelligence.flows.filter(f => f.dark_pool_percentage > 40).length}
                  </div>
                  <div className="text-sm text-navy-700">High Private Trading</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-navy-900">
                    {Math.round(intelligence.flows.reduce((sum, f) => sum + f.confidence, 0) / intelligence.flows.length)}%
                  </div>
                  <div className="text-sm text-navy-700">Avg Confidence</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-navy-900">
                    {intelligence.whale_alerts.length}
                  </div>
                  <div className="text-sm text-navy-700">Active Alerts</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flow Detail Modal */}
      <FlowDetailModal
        flow={selectedFlow}
        isOpen={showFlowModal}
        onClose={() => {
          setShowFlowModal(false)
          setSelectedFlow(null)
        }}
      />

      {/* Whale Alert Modal */}
      <WhaleAlertModal
        alert={selectedAlert}
        isOpen={showAlertModal}
        onClose={() => {
          setShowAlertModal(false)
          setSelectedAlert(null)
        }}
      />
    </>
  )
}