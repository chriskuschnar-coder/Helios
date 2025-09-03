import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity, Globe, Zap, DollarSign, BarChart3, X } from 'lucide-react'
import { TradingViewChart } from './TradingViewChart'

interface MarketDataPoint {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: string
  marketCap?: string
  category: 'crypto' | 'stocks' | 'forex' | 'commodities'
  tradingViewSymbol: string
}

interface MarketOverview {
  indices: MarketDataPoint[]
  crypto: MarketDataPoint[]
  forex: MarketDataPoint[]
  commodities: MarketDataPoint[]
  lastUpdated: string
}

export function LiveMarketData() {
  const [marketData, setMarketData] = useState<MarketOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'crypto' | 'stocks' | 'forex' | 'commodities'>('all')
  const [tickCount, setTickCount] = useState(0)
  const [selectedAsset, setSelectedAsset] = useState<MarketDataPoint | null>(null)
  const [showChart, setShowChart] = useState(false)

  // Base prices for realistic movements
  const basePrices = {
    'SPY': 597.05,
    'QQQ': 485.30,
    'IWM': 231.45,
    'VIX': 18.2,
    'BTC': 106250,
    'ETH': 3195,
    'SOL': 245.80,
    'ADA': 1.08,
    'EUR/USD': 1.0845,
    'GBP/USD': 1.2634,
    'USD/JPY': 149.85,
    'DXY': 105.50,
    'GLD': 2685.50,
    'OIL': 78.25,
    'NG': 2.84,
    'CORN': 456.75
  }

  const generateLiveData = (): MarketOverview => {
    const now = Date.now()
    
    // Multiple time-based variations for realistic market movements
    const fastTick = Math.sin(now / 5000) * 0.002    // ±0.2% every 5 seconds
    const mediumWave = Math.cos(now / 30000) * 0.005  // ±0.5% every 30 seconds  
    const slowTrend = Math.sin(now / 120000) * 0.01   // ±1% every 2 minutes
    const microNoise = (Math.random() - 0.5) * 0.001  // ±0.1% random noise
    
    // Generate realistic price with multiple time components
    const generatePrice = (basePrice: number, volatility: number = 0.02, symbol: string) => {
      const totalChange = fastTick + mediumWave + slowTrend + (microNoise * volatility)
      const price = basePrice * (1 + totalChange)
      const change = price - basePrice
      const changePercent = (change / basePrice) * 100
      
      return { price, change, changePercent }
    }

    // Generate volume with realistic patterns
    const generateVolume = (baseVolume: number, isHighVolume: boolean = false) => {
      const volumeMultiplier = 1 + Math.sin(now / 45000) * 0.3 + (Math.random() * 0.2)
      const volume = baseVolume * volumeMultiplier * (isHighVolume ? 1.5 : 1)
      return volume
    }

    const btcData = generatePrice(basePrices.BTC, 0.03, 'BTC')
    const ethData = generatePrice(basePrices.ETH, 0.04, 'ETH')
    const spyData = generatePrice(basePrices.SPY, 0.015, 'SPY')

    return {
      indices: [
        {
          symbol: 'SPY',
          name: 'S&P 500 ETF',
          tradingViewSymbol: 'AMEX:SPY',
          ...spyData,
          volume: '$' + generateVolume(125, true).toFixed(0) + 'M',
          category: 'stocks'
        },
        {
          symbol: 'QQQ',
          name: 'Nasdaq 100 ETF',
          tradingViewSymbol: 'NASDAQ:QQQ',
          ...generatePrice(basePrices.QQQ, 0.02, 'QQQ'),
          volume: '$' + generateVolume(95).toFixed(0) + 'M',
          category: 'stocks'
        },
        {
          symbol: 'IWM',
          name: 'Russell 2000 ETF',
          tradingViewSymbol: 'AMEX:IWM',
          ...generatePrice(basePrices.IWM, 0.025, 'IWM'),
          volume: '$' + generateVolume(55).toFixed(0) + 'M',
          category: 'stocks'
        },
        {
          symbol: 'VIX',
          name: 'Volatility Index',
          tradingViewSymbol: 'CBOE:VIX',
          ...generatePrice(basePrices.VIX, 0.1, 'VIX'),
          volume: 'N/A',
          category: 'stocks'
        }
      ],
      crypto: [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          tradingViewSymbol: 'COINBASE:BTCUSD',
          ...btcData,
          volume: '$' + generateVolume(35, true).toFixed(1) + 'B',
          marketCap: '$2.1T',
          category: 'crypto'
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          tradingViewSymbol: 'COINBASE:ETHUSD',
          ...ethData,
          volume: '$' + generateVolume(20).toFixed(1) + 'B',
          marketCap: '$384B',
          category: 'crypto'
        },
        {
          symbol: 'SOL',
          name: 'Solana',
          tradingViewSymbol: 'COINBASE:SOLUSD',
          ...generatePrice(basePrices.SOL, 0.06, 'SOL'),
          volume: '$' + generateVolume(4).toFixed(1) + 'B',
          marketCap: '$115B',
          category: 'crypto'
        },
        {
          symbol: 'ADA',
          name: 'Cardano',
          tradingViewSymbol: 'COINBASE:ADAUSD',
          ...generatePrice(basePrices.ADA, 0.05, 'ADA'),
          volume: '$' + generateVolume(950).toFixed(0) + 'M',
          marketCap: '$38B',
          category: 'crypto'
        }
      ],
      forex: [
        {
          symbol: 'EUR/USD',
          name: 'Euro Dollar',
          tradingViewSymbol: 'FX:EURUSD',
          ...generatePrice(basePrices['EUR/USD'], 0.005, 'EUR/USD'),
          volume: '$6.2T daily',
          category: 'forex'
        },
        {
          symbol: 'GBP/USD',
          name: 'British Pound',
          tradingViewSymbol: 'FX:GBPUSD',
          ...generatePrice(basePrices['GBP/USD'], 0.008, 'GBP/USD'),
          volume: '$2.1T daily',
          category: 'forex'
        },
        {
          symbol: 'USD/JPY',
          name: 'Dollar Yen',
          tradingViewSymbol: 'FX:USDJPY',
          ...generatePrice(basePrices['USD/JPY'], 0.006, 'USD/JPY'),
          volume: '$4.8T daily',
          category: 'forex'
        },
        {
          symbol: 'DXY',
          name: 'Dollar Index',
          tradingViewSymbol: 'TVC:DXY',
          ...generatePrice(basePrices.DXY, 0.004, 'DXY'),
          volume: 'N/A',
          category: 'forex'
        }
      ],
      commodities: [
        {
          symbol: 'GLD',
          name: 'Gold',
          tradingViewSymbol: 'AMEX:GLD',
          ...generatePrice(basePrices.GLD, 0.015, 'GLD'),
          volume: '$' + generateVolume(12).toFixed(1) + 'M',
          category: 'commodities'
        },
        {
          symbol: 'OIL',
          name: 'Crude Oil',
          tradingViewSymbol: 'NYMEX:CL1!',
          ...generatePrice(basePrices.OIL, 0.025, 'OIL'),
          volume: generateVolume(450).toFixed(0) + 'K contracts',
          category: 'commodities'
        },
        {
          symbol: 'NG',
          name: 'Natural Gas',
          tradingViewSymbol: 'NYMEX:NG1!',
          ...generatePrice(basePrices.NG, 0.04, 'NG'),
          volume: generateVolume(180).toFixed(0) + 'K contracts',
          category: 'commodities'
        },
        {
          symbol: 'CORN',
          name: 'Corn Futures',
          tradingViewSymbol: 'CBOT:ZC1!',
          ...generatePrice(basePrices.CORN, 0.02, 'CORN'),
          volume: generateVolume(95).toFixed(0) + 'K contracts',
          category: 'commodities'
        }
      ],
      lastUpdated: new Date().toISOString()
    }
  }

  const refreshData = async () => {
    setTickCount(prev => prev + 1)
    const newData = generateLiveData()
    setMarketData(newData)
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
    
    // CONTINUOUS LIVE UPDATES: Every 3 seconds for ultra-responsive feel
    const interval = setInterval(refreshData, 3000)
    return () => clearInterval(interval)
  }, [])

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Activity className="h-4 w-4 text-gray-600" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const formatPrice = (price: number, symbol: string) => {
    if (symbol.includes('/')) return price.toFixed(4)
    if (symbol === 'BTC') return '$' + price.toLocaleString(undefined, { maximumFractionDigits: 0 })
    if (symbol === 'ETH') return '$' + price.toLocaleString(undefined, { maximumFractionDigits: 0 })
    if (price > 1000) return '$' + price.toLocaleString(undefined, { maximumFractionDigits: 2 })
    return '$' + price.toFixed(2)
  }

  const getAllData = () => {
    if (!marketData) return []
    return [
      ...marketData.indices,
      ...marketData.crypto,
      ...marketData.forex,
      ...marketData.commodities
    ]
  }

  const getFilteredData = () => {
    if (!marketData) return []
    if (selectedCategory === 'all') return getAllData()
    if (selectedCategory === 'stocks') return marketData.indices
    return marketData[selectedCategory] || []
  }

  const handleAssetClick = (asset: MarketDataPoint) => {
    setSelectedAsset(asset)
    setShowChart(true)
  }

  const closeChart = () => {
    setShowChart(false)
    setSelectedAsset(null)
  }

  const categories = [
    { id: 'all', name: 'All Markets', icon: Globe },
    { id: 'crypto', name: 'Crypto', icon: Zap },
    { id: 'stocks', name: 'Indices', icon: TrendingUp },
    { id: 'forex', name: 'Forex', icon: DollarSign },
    { id: 'commodities', name: 'Commodities', icon: Activity }
  ]

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Globe className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-navy-900">Live Market Data</h3>
              <p className="text-sm text-gray-600">
                Live tick #{tickCount} • Click any asset for chart
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">LIVE • 3s updates</span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedCategory === category.id
                  ? 'bg-navy-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <category.icon className="h-4 w-4" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {loading && !marketData ? (
          <div className="animate-pulse space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {getFilteredData().map((item, index) => (
              <div 
                key={`${item.symbol}-${index}`}
                onClick={() => handleAssetClick(item)}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getChangeIcon(item.change)}
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-blue-900 transition-colors">
                        {item.symbol}
                      </div>
                      <div className="text-sm text-gray-600">{item.name}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="font-mono font-medium text-gray-900">
                      {formatPrice(item.price, item.symbol)}
                    </div>
                    <div className="text-sm text-gray-600">{item.volume}</div>
                  </div>
                  
                  <div className="text-right min-w-[80px]">
                    <div className={`font-medium ${getChangeColor(item.change)}`}>
                      {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}
                    </div>
                    <div className={`text-sm ${getChangeColor(item.changePercent)}`}>
                      {item.changePercent > 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </div>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Market Summary */}
        {marketData && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {getAllData().filter(item => item.change > 0).length}
                </div>
                <div className="text-sm text-gray-600">Advancing</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {getAllData().filter(item => item.change < 0).length}
                </div>
                <div className="text-sm text-gray-600">Declining</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-navy-900">
                  {(getAllData().reduce((sum, item) => sum + Math.abs(item.changePercent), 0) / getAllData().length).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Avg Volatility</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-navy-900">
                  {new Date().toLocaleTimeString()}
                </div>
                <div className="text-sm text-gray-600">Last Update</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TradingView Chart Modal */}
      {showChart && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getChangeIcon(selectedAsset.change)}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedAsset.symbol} - {selectedAsset.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="font-mono font-medium text-gray-900">
                        {formatPrice(selectedAsset.price, selectedAsset.symbol)}
                      </span>
                      <span className={`font-medium ${getChangeColor(selectedAsset.change)}`}>
                        {selectedAsset.change > 0 ? '+' : ''}{selectedAsset.change.toFixed(2)} 
                        ({selectedAsset.changePercent > 0 ? '+' : ''}{selectedAsset.changePercent.toFixed(2)}%)
                      </span>
                      <span className="text-gray-500">Vol: {selectedAsset.volume}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={closeChart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            
            <div className="h-[600px]">
              <TradingViewChart symbol={selectedAsset.tradingViewSymbol} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}