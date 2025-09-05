import React, { useState, useEffect } from 'react'
import { PieChart, BarChart3, TrendingUp, RefreshCw, Target, Zap, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react'
import { MetricDetailModal } from './MetricDetailModal'

interface AllocationData {
  name: string
  value: number
  percentage: number
  performance: number
  color: string
  target: number
  risk: 'Low' | 'Medium' | 'High'
  category: 'stocks' | 'crypto' | 'bonds' | 'cash' | 'other'
  icon: string
}

interface ChartProps {
  currentBalance: number
}

export function InteractiveAllocationChart({ currentBalance }: ChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)
  const [selectedView, setSelectedView] = useState<'pie' | 'bar'>('pie')
  const [animationProgress, setAnimationProgress] = useState(0)
  const [selectedMetric, setSelectedMetric] = useState<any>(null)
  const [showMetricModal, setShowMetricModal] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const generateAllocationData = (): AllocationData[] => {
    const marketMovement = Math.sin(Date.now() / 20000) * 0.02
    const performanceDrift = Math.cos(Date.now() / 40000) * 0.015
    const timeVariation = marketMovement + performanceDrift
    
    if (currentBalance === 0) {
      return [
        { name: 'Bitcoin', value: 0, percentage: 40, performance: 0, color: '#F7931A', target: 40, risk: 'High', category: 'crypto', icon: '₿' },
        { name: 'Ethereum', value: 0, percentage: 30, performance: 0, color: '#627EEA', target: 30, risk: 'High', category: 'crypto', icon: 'Ξ' },
        { name: 'Altcoins', value: 0, percentage: 20, performance: 0, color: '#8B5CF6', target: 20, risk: 'High', category: 'crypto', icon: '🚀' },
        { name: 'Trading Cash', value: 0, percentage: 10, performance: 0, color: '#10B981', target: 10, risk: 'Low', category: 'trading', icon: '💵' }
      ]
    }

    return [
      {
        name: 'Bitcoin',
        value: currentBalance * 0.40,
        percentage: 40 + (timeVariation * 4),
        performance: 28.7 + (timeVariation * 8),
        color: '#F7931A',
        target: 40,
        risk: 'High',
        category: 'crypto',
        icon: '₿'
      },
      {
        name: 'Ethereum',
        value: currentBalance * 0.30,
        percentage: 30 + (timeVariation * 3),
        performance: 24.3 + (timeVariation * 6),
        color: '#627EEA',
        target: 30,
        risk: 'High',
        category: 'crypto',
        icon: 'Ξ'
      },
      {
        name: 'Altcoins',
        value: currentBalance * 0.20,
        percentage: 20 + (timeVariation * 2),
        performance: 35.2 + (timeVariation * 10),
        color: '#8B5CF6',
        target: 20,
        risk: 'High',
        category: 'crypto',
        icon: '🚀'
      },
      {
        name: 'Trading Cash',
        value: currentBalance * 0.10,
        percentage: 10 + (timeVariation * 1),
        performance: 4.8 + (timeVariation * 1),
        color: '#10B981',
        target: 10,
        risk: 'Low', 
        category: 'trading',
        icon: '💵'
      }
    ]
  }

  const [allocationData, setAllocationData] = useState<AllocationData[]>(generateAllocationData())

  useEffect(() => {
    setAllocationData(generateAllocationData())
  }, [currentBalance])

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(timer)
  }, [])

  const getAllocationDetails = (allocation: AllocationData) => {
    return {
      name: allocation.name,
      value: `${allocation.percentage.toFixed(1)}% (${allocation.value.toLocaleString()})`,
      description: `${allocation.name} represents ${allocation.percentage.toFixed(1)}% of your total portfolio allocation.`,
      calculation: `(Asset Value / Total Portfolio Value) × 100`,
      interpretation: `Your ${allocation.name} allocation is ${Math.abs(allocation.percentage - allocation.target) < 2 ? 'well-balanced' : allocation.percentage > allocation.target ? 'overweight' : 'underweight'} relative to the target of ${allocation.target}%.`,
      benchmark: `${allocation.target}% target`,
      percentile: allocation.performance > 15 ? 90 : allocation.performance > 10 ? 75 : 60,
      trend: allocation.performance > 0 ? 'up' as const : 'down' as const,
      historicalData: [
        { period: 'Target', value: allocation.target },
        { period: 'Last Month', value: allocation.percentage * 0.95 },
        { period: 'Last Quarter', value: allocation.percentage * 0.98 },
        { period: 'Current', value: allocation.percentage }
      ],
      relatedMetrics: [
        { name: 'Performance', value: `${allocation.performance > 0 ? '+' : ''}${allocation.performance.toFixed(1)}%`, correlation: 0.85 },
        { name: 'Risk Level', value: allocation.risk, correlation: 0.45 },
        { name: 'Target Deviation', value: `${allocation.percentage - allocation.target > 0 ? '+' : ''}${(allocation.percentage - allocation.target).toFixed(1)}%`, correlation: -0.23 }
      ],
      actionableInsights: [
        `${allocation.name} is ${allocation.percentage > allocation.target ? 'overweight' : allocation.percentage < allocation.target ? 'underweight' : 'properly weighted'} in your portfolio`,
        `Consider ${allocation.performance > 15 ? 'taking profits' : allocation.performance < 0 ? 'reducing exposure' : 'maintaining position'} based on recent performance`
      ]
    }
  }

  const handleAllocationClick = (allocation: AllocationData) => {
    const details = getAllocationDetails(allocation)
    setSelectedMetric(details)
    setShowMetricModal(true)
  }

  const createDonutChart = () => {
    const centerX = 120
    const centerY = 120
    const outerRadius = 100
    const innerRadius = 65
    let currentAngle = -90

    return allocationData.map((item, index) => {
      const angle = (item.percentage / 100) * 360
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
      
      const isHovered = hoveredSegment === item.name
      const scale = isHovered ? 1.05 : 1
      
      return (
        <g key={index}>
          <path
            d={pathData}
            fill={item.color}
            stroke="white"
            strokeWidth="2"
            className="transition-all duration-300 cursor-pointer"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: `${centerX}px ${centerY}px`,
              filter: isHovered ? 'brightness(1.1)' : 'none'
            }}
            onMouseEnter={() => setHoveredSegment(item.name)}
            onMouseLeave={() => setHoveredSegment(null)}
            onClick={() => handleAllocationClick(item)}
          />
          {isHovered && (
            <text
              x={centerX}
              y={centerY - 5}
              textAnchor="middle"
              className="text-sm font-semibold fill-gray-700"
            >
              {item.name}
            </text>
          )}
          {isHovered && (
            <text
              x={centerX}
              y={centerY + 10}
              textAnchor="middle"
              className="text-xs fill-gray-600"
            >
              {item.percentage.toFixed(1)}%
            </text>
          )}
        </g>
      )
    })
  }

  // Calculate today's change
  const todaysChange = allocationData.reduce((sum, item) => sum + (item.value * 0.012), 0) // Simulated daily change
  const todaysChangePercent = currentBalance > 0 ? (todaysChange / currentBalance) * 100 : 0
  const isPositiveChange = todaysChange >= 0

  // Calculate allocation balance score
  const allocationBalance = allocationData.reduce((sum, item) => {
    const deviation = Math.abs(item.percentage - item.target)
    return sum + (deviation > 5 ? 0 : (5 - deviation) * 20)
  }, 0) / allocationData.length

  return (
    <div className="space-y-6">
      {/* Main Portfolio Allocation Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Portfolio Allocation</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Asset distribution and performance</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setSelectedView('pie')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    selectedView === 'pie' 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <PieChart className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedView('bar')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    selectedView === 'bar' 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Chart Section */}
            <div className="flex items-center justify-center">
              {selectedView === 'pie' ? (
                <div className="relative">
                  <svg width="240" height="240" className="transform transition-all duration-500">
                    {createDonutChart()}
                    
                    {/* Center content */}
                    <circle
                      cx="120"
                      cy="120"
                      r="65"
                      fill="white"
                      stroke="#f3f4f6"
                      strokeWidth="1"
                      className="dark:fill-gray-800 dark:stroke-gray-600"
                    />
                    
                    <text
                      x="120"
                      y="110"
                      textAnchor="middle"
                      className="text-xs font-medium fill-gray-500 dark:fill-gray-400"
                    >
                      Total Value
                    </text>
                    <text
                      x="120"
                      y="125"
                      textAnchor="middle"
                      className="text-lg font-bold fill-gray-900 dark:fill-white"
                    >
                      ${(currentBalance / 1000).toFixed(0)}K
                    </text>
                    <text
                      x="120"
                      y="140"
                      textAnchor="middle"
                      className={`text-xs font-medium ${isPositiveChange ? 'fill-green-600' : 'fill-red-600'}`}
                    >
                      {isPositiveChange ? '+' : ''}{todaysChangePercent.toFixed(1)}%
                    </text>
                  </svg>
                  
                  {/* Hover tooltip */}
                  {hoveredSegment && (
                    <div className="absolute top-4 left-4 bg-gray-900 dark:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm shadow-lg animate-in fade-in duration-200">
                      <div className="font-medium">{hoveredSegment}</div>
                      <div className="text-xs opacity-80">
                        {allocationData.find(item => item.name === hoveredSegment)?.percentage.toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full space-y-4">
                  {allocationData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{item.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${item.percentage}%`,
                            backgroundColor: item.color
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">${item.value.toLocaleString()}</span>
                        <span className={`font-medium ${item.performance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.performance > 0 ? '+' : ''}{item.performance.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Legend & Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Asset Breakdown</h4>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                  Rebalance
                </button>
              </div>
              
              <div className="space-y-3">
                {allocationData.map((item, index) => (
                  <div 
                    key={index}
                    className={`group p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                      hoveredSegment === item.name 
                        ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
                        : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onMouseEnter={() => setHoveredSegment(item.name)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    onClick={() => handleAllocationClick(item)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-lg">{item.icon}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.name}
                          </span>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              item.risk === 'Low' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                              item.risk === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                              'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                              {item.risk} Risk
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {item.percentage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ${item.value.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Performance:</span>
                        <span className={`font-semibold ml-2 ${item.performance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.performance > 0 ? '+' : ''}{item.performance.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Target:</span>
                        <span className="font-semibold ml-2 text-gray-700 dark:text-gray-300">{item.target}%</span>
                      </div>
                    </div>
                    
                    {/* Allocation bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Current vs Target</span>
                        <span>{Math.abs(item.percentage - item.target).toFixed(1)}% {item.percentage > item.target ? 'over' : 'under'}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                        <div className="flex h-full">
                          <div
                            className="transition-all duration-1000 ease-out rounded-full"
                            style={{ 
                              width: `${Math.min(item.percentage, item.target)}%`,
                              backgroundColor: item.color
                            }}
                          ></div>
                          {item.percentage > item.target && (
                            <div
                              className="transition-all duration-1000 ease-out bg-opacity-50 rounded-full"
                              style={{ 
                                width: `${item.percentage - item.target}%`,
                                backgroundColor: item.color
                              }}
                            ></div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {Math.abs(item.percentage - item.target) > 3 && (
                      <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-center space-x-1">
                          <Target className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                            Consider rebalancing: {item.percentage > item.target ? 'Overweight' : 'Underweight'} by {Math.abs(item.percentage - item.target).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center">
                        View details <ArrowUpRight className="w-3 h-3 ml-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Summary</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {allocationData.reduce((sum, item) => sum + item.performance * (item.percentage / 100), 0).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Weighted Return</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {allocationData.filter(item => item.performance > 0).length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Positive Assets</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {allocationData.find(item => item.performance === Math.max(...allocationData.map(a => a.performance)))?.name}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Top Performer</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {(allocationData.reduce((sum, item) => sum + Math.abs(item.percentage - item.target), 0) / allocationData.length).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Avg Deviation</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Metric Detail Modal */}
      <MetricDetailModal
        metric={selectedMetric}
        isOpen={showMetricModal}
        onClose={() => {
          setShowMetricModal(false)
          setSelectedMetric(null)
        }}
      />
    </div>
  )
}