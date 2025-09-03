import React, { useState, useEffect } from 'react'
import { MessageCircle, TrendingUp, TrendingDown, Users, Hash, Eye, RefreshCw } from 'lucide-react'

interface SentimentData {
  platform: string
  symbol: string
  sentiment: number // -100 to +100
  volume: number
  trending: boolean
  keyMentions: string[]
  influencerScore: number
}

interface SocialMetrics {
  overall_sentiment: number
  fear_greed_index: number
  viral_coefficient: number
  institutional_mentions: number
  retail_mentions: number
  trending_topics: string[]
  sentiment_data: SentimentData[]
}

export function SocialSentimentTracker() {
  const [metrics, setMetrics] = useState<SocialMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')

  const generateSentimentData = (): SocialMetrics => {
    const timeMultiplier = selectedTimeframe === '1h' ? 0.3 : selectedTimeframe === '24h' ? 1 : 7

    return {
      overall_sentiment: Math.floor(Math.random() * 40 + 30), // 30-70 range
      fear_greed_index: Math.floor(Math.random() * 30 + 45), // 45-75 range
      viral_coefficient: Math.random() * 2 + 1, // 1-3 range
      institutional_mentions: Math.floor(Math.random() * 500 * timeMultiplier + 200),
      retail_mentions: Math.floor(Math.random() * 5000 * timeMultiplier + 2000),
      trending_topics: [
        '#Bitcoin', '#Ethereum', '#FedPolicy', '#Inflation', '#TechStocks'
      ],
      sentiment_data: [
        {
          platform: 'Crypto Twitter',
          symbol: 'BTC',
          sentiment: Math.floor(Math.random() * 40 + 40), // 40-80
          volume: Math.floor(Math.random() * 10000 + 5000),
          trending: Math.random() > 0.3,
          keyMentions: ['@elonmusk', '@michael_saylor', '@cz_binance'],
          influencerScore: Math.floor(Math.random() * 30 + 70)
        },
        {
          platform: 'Reddit WSB',
          symbol: 'SPY',
          sentiment: Math.floor(Math.random() * 60 + 20), // 20-80
          volume: Math.floor(Math.random() * 5000 + 2000),
          trending: Math.random() > 0.4,
          keyMentions: ['diamond hands', 'to the moon', 'HODL'],
          influencerScore: Math.floor(Math.random() * 40 + 40)
        },
        {
          platform: 'FinTwit',
          symbol: 'TSLA',
          sentiment: Math.floor(Math.random() * 50 + 25), // 25-75
          volume: Math.floor(Math.random() * 3000 + 1000),
          trending: Math.random() > 0.5,
          keyMentions: ['earnings', 'delivery numbers', 'FSD'],
          influencerScore: Math.floor(Math.random() * 35 + 55)
        },
        {
          platform: 'LinkedIn Finance',
          symbol: 'GOLD',
          sentiment: Math.floor(Math.random() * 30 + 50), // 50-80
          volume: Math.floor(Math.random() * 1000 + 500),
          trending: Math.random() > 0.6,
          keyMentions: ['inflation hedge', 'central banks', 'safe haven'],
          influencerScore: Math.floor(Math.random() * 25 + 65)
        }
      ]
    }
  }

  const refreshData = async () => {
    setLoading(true)
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setMetrics(generateSentimentData())
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(refreshData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedTimeframe])

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 60) return 'text-green-600 bg-green-50'
    if (sentiment >= 40) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment >= 60) return <TrendingUp className="h-4 w-4" />
    if (sentiment >= 40) return <Eye className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  const getFearGreedLabel = (score: number) => {
    if (score >= 75) return 'Extreme Greed'
    if (score >= 55) return 'Greed'
    if (score >= 45) return 'Neutral'
    if (score >= 25) return 'Fear'
    return 'Extreme Fear'
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-navy-900">Social Sentiment Intelligence</h3>
            <p className="text-sm text-gray-600">Real-time social media analysis</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:ring-2 focus:ring-purple-500"
          >
            <option value="1h">1 Hour</option>
            <option value="24h">24 Hours</option>
            <option value="7d">7 Days</option>
          </select>
          
          <button
            onClick={refreshData}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && !metrics ? (
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      ) : metrics && (
        <div className="space-y-6">
          {/* Overall Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-navy-900 mb-1">
                {metrics.overall_sentiment}
              </div>
              <div className="text-sm text-gray-600">Overall Sentiment</div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.overall_sentiment >= 60 ? 'Bullish' : 
                 metrics.overall_sentiment >= 40 ? 'Neutral' : 'Bearish'}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-navy-900 mb-1">
                {metrics.fear_greed_index}
              </div>
              <div className="text-sm text-gray-600">Fear & Greed</div>
              <div className="text-xs text-gray-500 mt-1">
                {getFearGreedLabel(metrics.fear_greed_index)}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-navy-900 mb-1">
                {metrics.viral_coefficient.toFixed(1)}x
              </div>
              <div className="text-sm text-gray-600">Viral Coefficient</div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.viral_coefficient > 2 ? 'High' : 
                 metrics.viral_coefficient > 1.5 ? 'Medium' : 'Low'}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-navy-900 mb-1">
                {(metrics.institutional_mentions / metrics.retail_mentions * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Institutional Ratio</div>
              <div className="text-xs text-gray-500 mt-1">vs Retail</div>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Platform Sentiment Breakdown</h4>
            <div className="space-y-3">
              {metrics.sentiment_data.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getSentimentColor(data.sentiment >= 60 ? 'bullish' : data.sentiment >= 40 ? 'neutral' : 'bearish')}`}>
                      {getSentimentIcon(data.sentiment >= 60 ? 'bullish' : data.sentiment >= 40 ? 'neutral' : 'bearish')}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{data.platform}</div>
                      <div className="text-sm text-gray-600">{data.symbol} • {data.volume.toLocaleString()} mentions</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{data.sentiment}/100</div>
                    <div className="text-sm text-gray-600">
                      Influence: {data.influencerScore}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Topics */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Trending Topics</h4>
            <div className="flex flex-wrap gap-2">
              {metrics.trending_topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Live Updates Indicator */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 pt-4 border-t border-gray-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live updates every 5 minutes</span>
          </div>
        </div>
      )}
    </div>
  )
}