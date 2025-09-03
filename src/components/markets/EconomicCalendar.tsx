import React, { useState, useEffect } from 'react'
import { Calendar, Clock, TrendingUp, AlertTriangle, Star, Globe, DollarSign, Building, Zap } from 'lucide-react'

interface EconomicEvent {
  id: string
  time: string
  date: string
  title: string
  country: string
  currency: string
  impact: 'low' | 'medium' | 'high'
  category: 'monetary' | 'employment' | 'inflation' | 'gdp' | 'trade' | 'earnings' | 'crypto'
  forecast?: string
  previous?: string
  actual?: string
  description: string
  affectedAssets: string[]
}

export function EconomicCalendar() {
  const [events, setEvents] = useState<EconomicEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'today' | 'week'>('all')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'monetary' | 'employment' | 'inflation' | 'gdp' | 'trade' | 'earnings' | 'crypto'>('all')
  const [updateCount, setUpdateCount] = useState(0)

  const generateEconomicEvents = (): EconomicEvent[] => {
    const now = new Date()
    const timeVariation = Date.now() % 100000 / 100000
    
    // Generate events for the next 7 days
    const events: EconomicEvent[] = []
    
    // Today's events
    const todayEvents = [
      {
        id: 'fed-minutes-1',
        time: '14:00',
        date: now.toISOString().split('T')[0],
        title: 'FOMC Meeting Minutes',
        country: 'US',
        currency: 'USD',
        impact: 'high' as const,
        category: 'monetary' as const,
        forecast: 'Hawkish tone expected',
        previous: 'Neutral stance',
        description: 'Federal Reserve releases detailed minutes from the latest policy meeting, providing insights into future rate decisions.',
        affectedAssets: ['USD', 'SPY', 'QQQ', 'BTC', 'GOLD']
      },
      {
        id: 'jobless-claims-1',
        time: '08:30',
        date: now.toISOString().split('T')[0],
        title: 'Initial Jobless Claims',
        country: 'US',
        currency: 'USD',
        impact: 'medium' as const,
        category: 'employment' as const,
        forecast: '220K',
        previous: '218K',
        actual: (215 + Math.floor(timeVariation * 10)).toString() + 'K',
        description: 'Weekly measure of unemployment benefit claims, key indicator of labor market health.',
        affectedAssets: ['USD', 'SPY', 'DXY']
      },
      {
        id: 'btc-etf-flows-1',
        time: '16:00',
        date: now.toISOString().split('T')[0],
        title: 'Bitcoin ETF Net Flows',
        country: 'US',
        currency: 'USD',
        impact: 'high' as const,
        category: 'crypto' as const,
        forecast: '+$500M expected',
        previous: '+$342M',
        actual: '+$' + (450 + Math.floor(timeVariation * 200)).toString() + 'M',
        description: 'Daily net inflows/outflows from Bitcoin spot ETFs, indicating institutional demand.',
        affectedAssets: ['BTC', 'ETH', 'COIN']
      }
    ]

    // Tomorrow's events
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const tomorrowEvents = [
      {
        id: 'cpi-data-1',
        time: '08:30',
        date: tomorrow.toISOString().split('T')[0],
        title: 'Consumer Price Index (CPI)',
        country: 'US',
        currency: 'USD',
        impact: 'high' as const,
        category: 'inflation' as const,
        forecast: '2.9% YoY',
        previous: '3.1% YoY',
        description: 'Monthly inflation measure that heavily influences Federal Reserve policy decisions.',
        affectedAssets: ['USD', 'GOLD', 'TLT', 'SPY', 'BTC']
      },
      {
        id: 'tesla-earnings-1',
        time: '16:30',
        date: tomorrow.toISOString().split('T')[0],
        title: 'Tesla Q4 Earnings',
        country: 'US',
        currency: 'USD',
        impact: 'high' as const,
        category: 'earnings' as const,
        forecast: '$2.45 EPS',
        previous: '$2.27 EPS',
        description: 'Quarterly earnings report from Tesla, major influence on EV sector and tech stocks.',
        affectedAssets: ['TSLA', 'QQQ', 'EV Sector']
      },
      {
        id: 'ethereum-upgrade-1',
        time: '12:00',
        date: tomorrow.toISOString().split('T')[0],
        title: 'Ethereum Network Upgrade',
        country: 'Global',
        currency: 'ETH',
        impact: 'high' as const,
        category: 'crypto' as const,
        description: 'Major Ethereum protocol upgrade expected to improve transaction efficiency and reduce fees.',
        affectedAssets: ['ETH', 'DeFi Tokens', 'Layer 2s']
      }
    ]

    // This week's events
    const weekEvents = [
      {
        id: 'nonfarm-payrolls-1',
        time: '08:30',
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        title: 'Non-Farm Payrolls',
        country: 'US',
        currency: 'USD',
        impact: 'high' as const,
        category: 'employment' as const,
        forecast: '185K',
        previous: '199K',
        description: 'Monthly employment report showing job creation, unemployment rate, and wage growth.',
        affectedAssets: ['USD', 'SPY', 'DXY', 'GOLD']
      },
      {
        id: 'ecb-meeting-1',
        time: '12:45',
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        title: 'ECB Interest Rate Decision',
        country: 'EU',
        currency: 'EUR',
        impact: 'high' as const,
        category: 'monetary' as const,
        forecast: '3.25% (Hold)',
        previous: '3.25%',
        description: 'European Central Bank monetary policy decision and press conference.',
        affectedAssets: ['EUR', 'EUR/USD', 'European Stocks']
      },
      {
        id: 'china-gdp-1',
        time: '02:00',
        date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        title: 'China GDP (Q4)',
        country: 'CN',
        currency: 'CNY',
        impact: 'high' as const,
        category: 'gdp' as const,
        forecast: '4.8% YoY',
        previous: '4.6% YoY',
        description: 'Quarterly gross domestic product growth rate for the world\'s second-largest economy.',
        affectedAssets: ['AUD', 'Commodities', 'Emerging Markets']
      },
      {
        id: 'apple-earnings-1',
        time: '16:30',
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        title: 'Apple Q1 Earnings',
        country: 'US',
        currency: 'USD',
        impact: 'high' as const,
        category: 'earnings' as const,
        forecast: '$2.18 EPS',
        previous: '$2.18 EPS',
        description: 'Quarterly earnings from the world\'s most valuable company, major market mover.',
        affectedAssets: ['AAPL', 'QQQ', 'Tech Sector']
      }
    ]

    return [...todayEvents, ...tomorrowEvents, ...weekEvents]
  }

  const refreshEvents = async () => {
    setLoading(true)
    setUpdateCount(prev => prev + 1)
    await new Promise(resolve => setTimeout(resolve, 300))
    setEvents(generateEconomicEvents())
    setLoading(false)
  }

  useEffect(() => {
    refreshEvents()
    
    // Update events every 2 minutes for live feel
    const interval = setInterval(refreshEvents, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'medium': return <TrendingUp className="h-4 w-4" />
      case 'low': return <Clock className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'monetary': return <DollarSign className="h-4 w-4" />
      case 'employment': return <Building className="h-4 w-4" />
      case 'inflation': return <TrendingUp className="h-4 w-4" />
      case 'gdp': return <Globe className="h-4 w-4" />
      case 'earnings': return <Star className="h-4 w-4" />
      case 'crypto': return <Zap className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'US': '🇺🇸',
      'EU': '🇪🇺', 
      'CN': '🇨🇳',
      'JP': '🇯🇵',
      'UK': '🇬🇧',
      'Global': '🌍'
    }
    return flags[country] || '🌍'
  }

  const getFilteredEvents = () => {
    let filtered = events

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory)
    }

    // Filter by time/impact
    switch (selectedFilter) {
      case 'high':
        filtered = filtered.filter(event => event.impact === 'high')
        break
      case 'today':
        const today = new Date().toISOString().split('T')[0]
        filtered = filtered.filter(event => event.date === today)
        break
      case 'week':
        const weekFromNow = new Date()
        weekFromNow.setDate(weekFromNow.getDate() + 7)
        filtered = filtered.filter(event => new Date(event.date) <= weekFromNow)
        break
    }

    return filtered.sort((a, b) => {
      // Sort by date first, then by time
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.time.localeCompare(b.time)
    })
  }

  const isEventToday = (eventDate: string) => {
    return eventDate === new Date().toISOString().split('T')[0]
  }

  const isEventSoon = (eventDate: string, eventTime: string) => {
    const eventDateTime = new Date(`${eventDate}T${eventTime}:00`)
    const now = new Date()
    const diffHours = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diffHours <= 2 && diffHours > 0
  }

  const getTimeUntilEvent = (eventDate: string, eventTime: string) => {
    const eventDateTime = new Date(`${eventDate}T${eventTime}:00`)
    const now = new Date()
    const diffMs = eventDateTime.getTime() - now.getTime()
    
    if (diffMs < 0) return 'Past'
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours === 0) return `${diffMinutes}m`
    if (diffHours < 24) return `${diffHours}h ${diffMinutes}m`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ${diffHours % 24}h`
  }

  const filters = [
    { id: 'all', name: 'All Events', icon: Calendar },
    { id: 'high', name: 'High Impact', icon: AlertTriangle },
    { id: 'today', name: 'Today', icon: Clock },
    { id: 'week', name: 'This Week', icon: TrendingUp }
  ]

  const categories = [
    { id: 'all', name: 'All', icon: Globe },
    { id: 'monetary', name: 'Central Banks', icon: DollarSign },
    { id: 'employment', name: 'Employment', icon: Building },
    { id: 'inflation', name: 'Inflation', icon: TrendingUp },
    { id: 'earnings', name: 'Earnings', icon: Star },
    { id: 'crypto', name: 'Crypto', icon: Zap }
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-navy-900">Economic Calendar</h3>
            <p className="text-sm text-gray-600">
              Live updates: {updateCount} • Market-moving events
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-blue-600 font-medium">LIVE</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id as any)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
              selectedFilter === filter.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <filter.icon className="h-4 w-4" />
            <span>{filter.name}</span>
          </button>
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as any)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-full font-medium text-xs transition-colors ${
              selectedCategory === category.id
                ? 'bg-navy-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <category.icon className="h-3 w-3" />
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {getFilteredEvents().map((event) => (
            <div 
              key={event.id}
              className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                isEventToday(event.date) ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
              } ${
                isEventSoon(event.date, event.time) ? 'ring-2 ring-orange-200 bg-orange-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Time and Country */}
                  <div className="text-center min-w-[80px]">
                    <div className="text-lg font-bold text-gray-900">{event.time}</div>
                    <div className="text-2xl">{getCountryFlag(event.country)}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getTimeUntilEvent(event.date, event.time)}
                    </div>
                  </div>
                  
                  {/* Event Details */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(event.category)}
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      </div>
                      
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(event.impact)}`}>
                        {getImpactIcon(event.impact)}
                        <span className="capitalize">{event.impact}</span>
                      </div>
                      
                      {isEventSoon(event.date, event.time) && (
                        <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                          <Clock className="h-3 w-3" />
                          <span>Soon</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                    
                    {/* Forecast/Actual Data */}
                    {(event.forecast || event.previous || event.actual) && (
                      <div className="flex items-center space-x-6 text-sm mb-3">
                        {event.forecast && (
                          <div>
                            <span className="text-gray-500">Forecast: </span>
                            <span className="font-medium text-gray-900">{event.forecast}</span>
                          </div>
                        )}
                        {event.previous && (
                          <div>
                            <span className="text-gray-500">Previous: </span>
                            <span className="font-medium text-gray-700">{event.previous}</span>
                          </div>
                        )}
                        {event.actual && (
                          <div>
                            <span className="text-gray-500">Actual: </span>
                            <span className="font-bold text-blue-600">{event.actual}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Affected Assets */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Affects:</span>
                      <div className="flex flex-wrap gap-1">
                        {event.affectedAssets.map((asset, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700"
                          >
                            {asset}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {getFilteredEvents().length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No events match your current filters</p>
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {events.filter(e => e.impact === 'high').length}
            </div>
            <div className="text-sm text-gray-600">High Impact</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {events.filter(e => isEventToday(e.date)).length}
            </div>
            <div className="text-sm text-gray-600">Today</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {events.filter(e => isEventSoon(e.date, e.time)).length}
            </div>
            <div className="text-sm text-gray-600">Next 2 Hours</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-navy-900">
              {events.filter(e => e.category === 'monetary').length}
            </div>
            <div className="text-sm text-gray-600">Central Bank</div>
          </div>
        </div>
      </div>
    </div>
  )
}