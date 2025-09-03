import React, { useState, useEffect } from 'react'
import { PieChart, TrendingUp, TrendingDown, Eye, EyeOff, RefreshCw, MoreHorizontal } from 'lucide-react'

interface AssetAllocation {
  id: string
  name: string
  symbol: string
  percentage: number
  value: number
  change24h: number
  color: string
  icon: string
}

interface PortfolioSummary {
  totalValue: number
  todayChange: number
  todayChangePercent: number
  allocationBalance: number
}

interface ModernPortfolioAllocationProps {
  currentBalance: number
  className?: string
}

export function ModernPortfolioAllocation({ currentBalance, className = '' }: ModernPortfolioAllocationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Generate realistic portfolio data
  const generatePortfolioData = (): { assets: AssetAllocation[], summary: PortfolioSummary } => {
    const timeVariation = Math.sin(Date.now() / 30000) * 0.02 // ±2% variation
    
    if (currentBalance === 0) {
      return {
        assets: [
          { id: 'stocks', name: 'Stocks', symbol: 'STOCKS', percentage: 0, value: 0, change24h: 0, color: '#3B82F6', icon: '📈' },
          { id: 'crypto', name: 'Crypto', symbol: 'CRYPTO', percentage: 0, value: 0, change24h: 0, color: '#F59E0B', icon: '₿' },
          { id: 'bonds', name: 'Bonds', symbol: 'BONDS', percentage: 0, value: 0, change24h: 0, color: '#10B981', icon: '🏛️' },
          { id: 'cash', name: 'Cash', symbol: 'CASH', percentage: 0, value: 0, change24h: 0, color: '#6B7280', icon: '💵' },
          { id: 'other', name: 'Other', symbol: 'OTHER', percentage: 0, value: 0, change24h: 0, color: '#8B5CF6', icon: '🏗️' }
        ],
        summary: {
          totalValue: 0,
          todayChange: 0,
          todayChangePercent: 0,
          allocationBalance: 100
        }
      }
    }

    const assets: AssetAllocation[] = [
      {
        id: 'stocks',
        name: 'Stocks',
        symbol: 'STOCKS',
        percentage: 65 + (timeVariation * 5),
        value: currentBalance * (0.65 + timeVariation * 0.05),
        change24h: 2.4 + (timeVariation * 1.5),
        color: '#3B82F6',
        icon: '📈'
      },
      {
        id: 'crypto',
        name: 'Crypto',
        symbol: 'CRYPTO',
        percentage: 20 + (timeVariation * 3),
        value: currentBalance * (0.20 + timeVariation * 0.03),
        change24h: 4.8 + (timeVariation * 2.5),
        color: '#F59E0B',
        icon: '₿'
      },
      {
        id: 'bonds',
        name: 'Bonds',
        symbol: 'BONDS',
        percentage: 10 + (timeVariation * 2),
        value: currentBalance * (0.10 + timeVariation * 0.02),
        change24h: 0.8 + (timeVariation * 0.5),
        color: '#10B981',
        icon: '🏛️'
      },
      {
        id: 'cash',
        name: 'Cash',
        symbol: 'CASH',
        percentage: 3 + (timeVariation * 1),
        value: currentBalance * (0.03 + timeVariation * 0.01),
        change24h: 0.1,
        color: '#6B7280',
        icon: '💵'
      },
      {
        id: 'other',
        name: 'Other',
        symbol: 'OTHER',
        percentage: 2 + (timeVariation * 1),
        value: currentBalance * (0.02 + timeVariation * 0.01),
        change24h: 1.2 + (timeVariation * 0.8),
        color: '#8B5CF6',
        icon: '🏗️'
      }
    ]

    const totalChange = assets.reduce((sum, asset) => sum + (asset.value * asset.change24h / 100), 0)
    const totalChangePercent = (totalChange / currentBalance) * 100

    return {
      assets,
      summary: {
        totalValue: currentBalance,
        todayChange: totalChange,
        todayChangePercent: totalChangePercent,
        allocationBalance: 98.5 + (timeVariation * 3) // Slight deviation from 100%
      }
    }
  }

  const [portfolioData, setPortfolioData] = useState(generatePortfolioData())

  // Animation and live updates
  useEffect(() => {
    const animationTimer = setInterval(() => {
      setAnimationProgress(prev => (prev + 1) % 100)
    }, 50)

    const dataTimer = setInterval(() => {
      setPortfolioData(generatePortfolioData())
    }, 10000) // Update every 10 seconds

    return () => {
      clearInterval(animationTimer)
      clearInterval(dataTimer)
    }
  }, [currentBalance])

  // Create SVG donut chart
  const createDonutChart = () => {
    const centerX = 120
    const centerY = 120
    const outerRadius = 100
    const innerRadius = 65
    let currentAngle = -90

    return portfolioData.assets.map((asset, index) => {
      if (asset.percentage === 0) return null

      const angle = (asset.percentage / 100) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle

      const x1 = centerX + outerRadius * Math.cos((startAngle * Math.PI) / 180)
      const y1 = centerY + outerRadius * Math.sin((startAngle * Math.PI) / 180)
      const x2 = centerX + outerRadius * Math.cos((endAngle * Math.PI) / 180)
      const y2 = centerY + outerRadius * Math.sin((endAngle * Math.PI) / 180)

      const x3 = centerX + innerRadius * Math.cos((endAngle * Math.PI) / 180)
      const y3 = centerY + innerRadius * Math.sin((endAngle * Math.PI) / 180)
      const x4 = centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180)
      const y4 = centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180)

      const largeArcFlag = angle > 180 ? 1 : 0

      const pathData = [
        `M ${x1} ${y1}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
        'Z'
      ].join(' ')

      currentAngle += angle

      const isHovered = hoveredAsset === asset.id
      const scale = isHovered ? 1.05 : 1
      const opacity = hoveredAsset && !isHovered ? 0.6 : 1

      return (
        <g key={asset.id}>
          <path
            d={pathData}
            fill={asset.color}
            className="transition-all duration-300 cursor-pointer"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: `${centerX}px ${centerY}px`,
              opacity
            }}
            onMouseEnter={() => setHoveredAsset(asset.id)}
            onMouseLeave={() => setHoveredAsset(null)}
          />
          {isHovered && (
            <text
              x={centerX}
              y={centerY - 5}
              textAnchor="middle"
              className="text-sm font-semibold fill-gray-700"
            >
              {asset.percentage.toFixed(1)}%
            </text>
          )}
        </g>
      )
    })
  }

  const formatCurrency = (amount: number) => {
    if (!isVisible) return '••••••'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (percent: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(percent / 100)
  }

  return (
    <div className={`${className} ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Allocation</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Asset distribution overview</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsVisible(!isVisible)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title={isVisible ? 'Hide values' : 'Show values'}
              >
                {isVisible ? (
                  <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Toggle theme"
              >
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-gray-600"></div>
              </button>
              
              <button
                onClick={() => setPortfolioData(generatePortfolioData())}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Portfolio Value</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatCurrency(portfolioData.summary.totalValue)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Change</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className={`text-2xl font-bold ${
                      portfolioData.summary.todayChange >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {portfolioData.summary.todayChange >= 0 ? '+' : ''}
                      {formatCurrency(Math.abs(portfolioData.summary.todayChange))}
                    </p>
                    <span className={`text-sm font-medium ${
                      portfolioData.summary.todayChangePercent >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      ({portfolioData.summary.todayChangePercent >= 0 ? '+' : ''}
                      {portfolioData.summary.todayChangePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  portfolioData.summary.todayChange >= 0 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {portfolioData.summary.todayChange >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Allocation Balance</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {portfolioData.summary.allocationBalance.toFixed(1)}%
                    </p>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      Math.abs(portfolioData.summary.allocationBalance - 100) < 2
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {Math.abs(portfolioData.summary.allocationBalance - 100) < 2 ? 'Balanced' : 'Rebalance'}
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Donut Chart */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <svg width="240" height="240" className="transform transition-all duration-500">
                  {/* Background circle */}
                  <circle
                    cx="120"
                    cy="120"
                    r="100"
                    fill="none"
                    stroke="#F3F4F6"
                    strokeWidth="20"
                    className="dark:stroke-gray-700"
                  />
                  
                  {/* Asset segments */}
                  {createDonutChart()}
                  
                  {/* Center content */}
                  <circle
                    cx="120"
                    cy="120"
                    r="65"
                    fill="white"
                    className="dark:fill-gray-900"
                  />
                </svg>
                
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(portfolioData.summary.totalValue)}
                    </p>
                    <div className="flex items-center justify-center space-x-1 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">LIVE</span>
                    </div>
                  </div>
                </div>

                {/* Hover tooltip */}
                {hoveredAsset && (
                  <div className="absolute top-4 left-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
                    {portfolioData.assets.find(a => a.id === hoveredAsset)?.name}
                  </div>
                )}
              </div>
            </div>

            {/* Legend & Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Asset Breakdown</h4>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-3">
                {portfolioData.assets.map((asset, index) => (
                  <div
                    key={asset.id}
                    className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                      hoveredAsset === asset.id
                        ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                        : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`}
                    onMouseEnter={() => setHoveredAsset(asset.id)}
                    onMouseLeave={() => setHoveredAsset(null)}
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full transition-all duration-200"
                          style={{ 
                            backgroundColor: asset.color,
                            transform: hoveredAsset === asset.id ? 'scale(1.2)' : 'scale(1)'
                          }}
                        ></div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{asset.icon}</span>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {asset.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {asset.symbol}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {asset.percentage.toFixed(1)}%
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatCurrency(asset.value)}
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            asset.change24h >= 0
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            backgroundColor: asset.color,
                            width: `${asset.percentage}%`,
                            transform: `translateX(${hoveredAsset === asset.id ? '2px' : '0px'})`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Allocation Status */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Portfolio Health</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      {Math.abs(portfolioData.summary.allocationBalance - 100) < 2 
                        ? 'Well balanced across asset classes'
                        : 'Consider rebalancing for optimal allocation'
                      }
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    Math.abs(portfolioData.summary.allocationBalance - 100) < 2
                      ? 'bg-green-500'
                      : 'bg-yellow-500'
                  } animate-pulse`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}