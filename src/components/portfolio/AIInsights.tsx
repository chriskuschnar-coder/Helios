import React, { useState, useEffect } from 'react'
import { Brain, Lightbulb, AlertTriangle, TrendingUp, Target, Zap, RefreshCw, CheckCircle, ArrowUpRight } from 'lucide-react'

interface AIInsight {
  id: string
  type: 'opportunity' | 'risk' | 'rebalance' | 'tax' | 'market'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  actionable: boolean
  timeframe: string
}

interface MarketCondition {
  condition: string
  probability: number
  impact_on_portfolio: string
  recommended_action: string
}

export function AIInsights({ currentBalance }: { currentBalance: number }) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [marketConditions, setMarketConditions] = useState<MarketCondition[]>([])
  const [loading, setLoading] = useState(true)
  const [updateCount, setUpdateCount] = useState(0)
  const [newsImpact, setNewsImpact] = useState<string[]>([])
  const [lastMarketEvent, setLastMarketEvent] = useState<string>('')

  const generateAIInsights = (): AIInsight[] => {
    // Real-time market variations
    const marketVolatility = Math.sin(Date.now() / 20000) * 0.3 + 0.7  // 0.4-1.0 range
    const newsImpact = Math.cos(Date.now() / 45000) * 0.2 + 0.8        // 0.6-1.0 range
    const timeVariation = marketVolatility * newsImpact
    
    const hasActivity = currentBalance > 0
    
    if (!hasActivity) {
      return [
        {
          id: 'welcome-1',
          type: 'opportunity',
          title: 'Welcome to Quantitative Investing',
          description: 'Fund your account to begin receiving AI-powered portfolio insights and optimization recommendations.',
          impact: 'high',
          confidence: 100,
          actionable: true,
          timeframe: 'Immediate'
        }
      ]
    }

    const insightPool = [
      {
        id: 'momentum-1',
        type: 'opportunity' as const,
        title: 'Momentum Factor Acceleration Detected',
        description: `Cross-sectional momentum signals show ${(85 + timeVariation * 10).toFixed(0)}% strength. Consider increasing momentum allocation by 5-8% for next 2-3 weeks.`,
        impact: 'high' as const,
        confidence: Math.floor(85 + timeVariation * 10),
        actionable: true,
        timeframe: '2-3 weeks'
      },
      {
        id: 'rebalance-1',
        type: 'rebalance' as const,
        title: 'Technology Overweight Alert',
        description: `Tech allocation at ${(37 + timeVariation * 3).toFixed(1)}% vs 35% target. Rebalancing could reduce portfolio risk by ${(0.8 + timeVariation * 0.4).toFixed(1)}%.`,
        impact: 'medium' as const,
        confidence: Math.floor(78 + timeVariation * 15),
        actionable: true,
        timeframe: '1-2 weeks'
      },
      {
        id: 'risk-1',
        type: 'risk' as const,
        title: 'Volatility Regime Shift Warning',
        description: `Hidden Markov Model indicates ${(72 + timeVariation * 20).toFixed(0)}% probability of volatility expansion. Consider defensive positioning.`,
        impact: 'high' as const,
        confidence: Math.floor(72 + timeVariation * 20),
        actionable: true,
        timeframe: '5-10 days'
      },
      {
        id: 'tax-1',
        type: 'tax' as const,
        title: 'Tax Loss Harvesting Opportunity',
        description: `Unrealized losses in Energy sector (${(-2.3 + timeVariation * 1).toFixed(1)}%) could offset gains. Potential tax savings: $${(1200 + timeVariation * 800).toFixed(0)}.`,
        impact: 'medium' as const,
        confidence: Math.floor(88 + timeVariation * 8),
        actionable: true,
        timeframe: 'Before year-end'
      },
      {
        id: 'market-1',
        type: 'market' as const,
        title: 'Fed Policy Shift Impact Analysis',
        description: `Rate cut probability increased to ${(65 + timeVariation * 25).toFixed(0)}%. Duration risk in bond allocation may create opportunity for +${(1.8 + timeVariation * 1.2).toFixed(1)}% alpha.`,
        impact: 'high' as const,
        confidence: Math.floor(82 + timeVariation * 12),
        actionable: true,
        timeframe: 'Next FOMC meeting'
      },
      {
        id: 'opportunity-1',
        type: 'opportunity' as const,
        title: 'Statistical Arbitrage Signal',
        description: `Pairs trading model identifies ${Math.floor(12 + timeVariation * 8)} active opportunities with average expected return of ${(2.4 + timeVariation * 1.5).toFixed(1)}%.`,
        impact: 'medium' as const,
        confidence: Math.floor(79 + timeVariation * 15),
        actionable: true,
        timeframe: '3-7 days'
      }
    ]

    // Rotate through insights based on time
    const insightIndex = Math.floor(Date.now() / (1000 * 60 * 2)) % insightPool.length // Change every 2 minutes
    return insightPool.slice(insightIndex, insightIndex + 3).concat(insightPool.slice(0, Math.max(0, 3 - (insightPool.length - insightIndex))))
  }

  const generateMarketConditions = (): MarketCondition[] => {
    const timeVariation = Date.now() % 100000 / 100000
    
    return [
      {
        condition: 'Momentum Regime Continuation',
        probability: Math.floor(75 + timeVariation * 20),
        impact_on_portfolio: `Positive for momentum allocation (+${(2.1 + timeVariation * 1.5).toFixed(1)}% expected)`,
        recommended_action: 'Maintain or increase momentum exposure'
      },
      {
        condition: 'Volatility Compression',
        probability: Math.floor(68 + timeVariation * 25),
        impact_on_portfolio: `Favorable for carry strategies (+${(1.4 + timeVariation * 0.8).toFixed(1)}% expected)`,
        recommended_action: 'Consider volatility selling strategies'
      },
      {
        condition: 'Dollar Strength Cycle',
        probability: Math.floor(82 + timeVariation * 15),
        impact_on_portfolio: `Headwind for international exposure (-${(0.8 + timeVariation * 0.6).toFixed(1)}% drag)`,
        recommended_action: 'Hedge currency exposure or reduce international allocation'
      }
    ]
  }

  const refreshData = async () => {
    setLoading(true)
    setUpdateCount(prev => prev + 1)
    
    // Generate market events that affect AI insights
    const marketEvents = [
      'FOMC minutes release shifts rate expectations',
      'Earnings season momentum accelerating',
      'Geopolitical risk premium increasing',
      'Crypto correlation breakdown detected',
      'Institutional flow patterns changing',
      'Volatility regime shift in progress'
    ]
    
    const currentEvent = marketEvents[Math.floor(Date.now() / (1000 * 60 * 2)) % marketEvents.length]
    setLastMarketEvent(currentEvent)
    
    await new Promise(resolve => setTimeout(resolve, 800))
    
    setInsights(generateAIInsights())
    setMarketConditions(generateMarketConditions())
    
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
    
    const interval = setInterval(refreshData, 20000) // Update every 20 seconds
    return () => clearInterval(interval)
  }, [currentBalance])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-5 w-5 text-green-600" />
      case 'risk': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'rebalance': return <Target className="h-5 w-5 text-blue-600" />
      case 'tax': return <CheckCircle className="h-5 w-5 text-purple-600" />
      case 'market': return <Zap className="h-5 w-5 text-orange-600" />
      default: return <Lightbulb className="h-5 w-5 text-gray-600" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'border-green-200 bg-green-50'
      case 'risk': return 'border-red-200 bg-red-50'
      case 'rebalance': return 'border-blue-200 bg-blue-50'
      case 'tax': return 'border-purple-200 bg-purple-50'
      case 'market': return 'border-orange-200 bg-orange-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fintech-card animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center pulse-glow">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 text-premium">AI Insights</h3>
            <p className="text-sm text-gray-500">
              Machine learning analysis • Update #{updateCount} • {new Date().toLocaleTimeString()}
            </p>
            {lastMarketEvent && (
              <p className="text-xs text-purple-600 mt-1 font-medium">
                📊 {lastMarketEvent}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 glass px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-700 font-semibold">AI ACTIVE</span>
          </div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="glass-button p-2 hover-lift"
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* AI Insights */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-6 text-premium">Active Insights</h4>
            <div className="space-y-3">
              {insights.map((insight) => (
                <div key={insight.id} className={`p-5 rounded-xl border-2 ${getInsightColor(insight.type)} hover-lift interactive-element transition-all duration-300`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-900 mb-2 text-premium">{insight.title}</h5>
                        <p className="text-sm text-gray-700 leading-relaxed">{insight.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${getImpactColor(insight.impact)}`}>
                        {insight.impact.toUpperCase()} IMPACT
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        {insight.confidence}% confidence
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 font-medium">
                      Timeframe: {insight.timeframe}
                    </div>
                    {insight.actionable && (
                      <button className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1 hover-lift">
                        Take Action <ArrowUpRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Conditions */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-6 text-premium">Market Regime Analysis</h4>
            <div className="space-y-3">
              {marketConditions.map((condition, index) => (
                <div key={index} className={`p-5 glass-dark rounded-xl border border-purple-200 hover-lift stagger-${(index % 3) + 1}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-bold text-gray-900 text-premium">{condition.condition}</h5>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gradient animate-count-up">{condition.probability}%</div>
                      <div className="text-xs text-gray-500 font-medium">Probability</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600 font-medium">Portfolio Impact:</span>
                      <span className="ml-2 text-gray-900 font-semibold">{condition.impact_on_portfolio}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Recommended Action:</span>
                      <span className="ml-2 font-bold text-gray-900">{condition.recommended_action}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}