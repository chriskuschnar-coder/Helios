import React, { useState, useEffect } from 'react'
import { PieChart, BarChart3, TrendingUp, RefreshCw, Target, Zap, ArrowUpRight } from 'lucide-react'
import { MetricDetailModal } from './MetricDetailModal'

interface AllocationData {
  name: string
  value: number
  percentage: number
  performance: number
  color: string
  target: number
  risk: 'Low' | 'Medium' | 'High'
  description: string
}

interface ChartProps {
  currentBalance: number
}

export function InteractiveAllocationChart({ currentBalance }: ChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)
  const [selectedView, setSelectedView] = useState<'pie' | 'bar'>('pie')
  const [selectedMetric, setSelectedMetric] = useState<any>(null)
  const [showMetricModal, setShowMetricModal] = useState(false)
  const [updateCount, setUpdateCount] = useState(0)

  const generateAllocationData = (): AllocationData[] => {
    // Live allocation with realistic data
    const timeVariation = Math.sin(Date.now() / 20000) * 0.02
    
    if (currentBalance === 0) {
      return [
        { 
          name: 'Alpha Fund', 
          value: 0, 
          percentage: 0, 
          performance: 0, 
          color: '#2563eb', 
          target: 65, 
          risk: 'Medium',
          description: 'Quantitative momentum strategies with systematic alpha generation'
        },
        { 
          name: 'Market Neutral', 
          value: 0, 
          percentage: 0, 
          performance: 0, 
          color: '#10b981', 
          target: 25, 
          risk: 'Low',
          description: 'Statistical arbitrage and relative value strategies'
        },
        { 
          name: 'Momentum Portfolio', 
          value: 0, 
          percentage: 0, 
          performance: 0, 
          color: '#8b5cf6', 
          target: 10, 
          risk: 'High',
          description: 'High-conviction momentum signals with dynamic leverage'
        }
      ]
    }

    return [
      {
        name: 'Alpha Fund',
        value: currentBalance * 0.65,
        percentage: 65,
        performance: 14.2 + (timeVariation * 3),
        color: '#2563eb',
        target: 65,
        risk: 'Medium',
        description: 'Quantitative momentum strategies with systematic alpha generation'
      },
      {
        name: 'Market Neutral',
        value: currentBalance * 0.25,
        percentage: 25,
        performance: 8.7 + (timeVariation * 2),
        color: '#10b981',
        target: 25,
        risk: 'Low',
        description: 'Statistical arbitrage and relative value strategies'
      },
      {
        name: 'Momentum Portfolio',
        value: currentBalance * 0.10,
        percentage: 10,
        performance: 18.9 + (timeVariation * 4),
        color: '#8b5cf6',
        target: 10,
        risk: 'High',
        description: 'High-conviction momentum signals with dynamic leverage'
      }
    ]
  }

  const [allocationData, setAllocationData] = useState<AllocationData[]>(generateAllocationData())

  useEffect(() => {
    const refreshData = () => {
      setAllocationData(generateAllocationData())
      setUpdateCount(prev => prev + 1)
    }
    
    refreshData()
    const interval = setInterval(refreshData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [currentBalance])

  const getAllocationDetails = (allocation: AllocationData) => {
    return {
      name: allocation.name,
      value: `${allocation.percentage}% (${allocation.value.toLocaleString()})`,
      description: allocation.description,
      calculation: `(Fund Value / Total Portfolio Value) × 100 = (${allocation.value.toLocaleString()} / ${currentBalance.toLocaleString()}) × 100`,
      interpretation: `Your ${allocation.name} allocation is ${Math.abs(allocation.percentage - allocation.target) < 2 ? 'well-balanced' : allocation.percentage > allocation.target ? 'overweight' : 'underweight'} relative to the target of ${allocation.target}%. The ${allocation.performance.toFixed(1)}% performance ${allocation.performance > 10 ? 'significantly exceeds' : allocation.performance > 5 ? 'exceeds' : 'meets'} expectations for this risk level.`,
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
        `Consider ${allocation.performance > 15 ? 'taking profits' : allocation.performance < 0 ? 'reducing exposure' : 'maintaining position'} based on recent performance`,
        `${allocation.risk === 'High' ? 'Monitor volatility closely' : allocation.risk === 'Low' ? 'Stable allocation suitable for risk management' : 'Balanced risk profile supports core allocation'}`
      ]
    }
  }

  const handleAllocationClick = (allocation: AllocationData) => {
    const details = getAllocationDetails(allocation)
    setSelectedMetric(details)
    setShowMetricModal(true)
  }

  const createPieChart = () => {
    const centerX = 200
    const centerY = 200
    const radius = 140
    let currentAngle = -90

    return allocationData.map((item, index) => {
      const angle = (item.percentage / 100) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      
      const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
      const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
      const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
      const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180)
      
      const largeArcFlag = angle > 180 ? 1 : 0
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ')
      
      currentAngle += angle
      
      return (
        <path
          key={index}
          d={pathData}
          fill={item.color}
          stroke="white"
          strokeWidth="3"
          className={`transition-all duration-300 cursor-pointer ${
            hoveredSegment === item.name ? 'opacity-80 drop-shadow-lg' : 'opacity-90'
          }`}
          onMouseEnter={() => setHoveredSegment(item.name)}
          onMouseLeave={() => setHoveredSegment(null)}
          onClick={() => handleAllocationClick(item)}
        />
      )
    })
  }

  return (
    <div className="allocation-section">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center animate-blue-glow">
            <PieChart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="exchange-heading text-xl">Asset Allocation</h3>
            <p className="exchange-text">Portfolio breakdown and performance metrics</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="live-indicator">
            <div className="live-dot"></div>
            <span className="live-text">LIVE</span>
          </div>
          <button
            onClick={() => setSelectedView('pie')}
            className={`p-3 rounded-xl transition-all duration-300 ${
              selectedView === 'pie' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <PieChart className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelectedView('bar')}
            className={`p-3 rounded-xl transition-all duration-300 ${
              selectedView === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="allocation-grid">
        {/* Chart */}
        <div className="allocation-chart">
          {selectedView === 'pie' ? (
            <div className="relative">
              <svg width="400" height="400" className="transform transition-all duration-500">
                {createPieChart()}
                
                {/* Center circle */}
                <circle
                  cx="200"
                  cy="200"
                  r="80"
                  fill="white"
                  stroke="rgba(37, 99, 235, 0.2)"
                  strokeWidth="3"
                />
                
                {/* Center text */}
                <text
                  x="200"
                  y="190"
                  textAnchor="middle"
                  className="text-sm font-semibold fill-gray-500"
                >
                  Total Value
                </text>
                <text
                  x="200"
                  y="210"
                  textAnchor="middle"
                  className="text-lg font-bold fill-gray-900"
                >
                  ${currentBalance.toLocaleString()}
                </text>
              </svg>
              
              {hoveredSegment && (
                <div className="absolute top-4 left-4 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-md">
                  {hoveredSegment}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full space-y-6">
              {allocationData.map((item, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">{item.name}</span>
                    <span className="text-sm font-bold text-gray-700">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-4 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: item.color
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">${item.value.toLocaleString()}</span>
                    <span className={`font-bold ${item.performance > 0 ? 'text-blue-600' : 'text-red-500'}`}>
                      {item.performance > 0 ? '+' : ''}{item.performance.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend & Details */}
        <div className="allocation-legend">
          <h4 className="font-semibold text-gray-900 mb-4">Fund Details</h4>
          
          {allocationData.map((item, index) => (
            <div 
              key={index}
              className="allocation-item group cursor-pointer"
              onMouseEnter={() => setHoveredSegment(item.name)}
              onMouseLeave={() => setHoveredSegment(null)}
              onClick={() => handleAllocationClick(item)}
            >
              <div className="flex items-center space-x-3 flex-1">
                <div 
                  className="allocation-color"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="allocation-details">
                  <div className="allocation-name">{item.name}</div>
                  <div className="allocation-description">{item.description}</div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.risk === 'Low' ? 'bg-green-100 text-green-800' :
                      item.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.risk} Risk
                    </span>
                    <span className="text-xs text-gray-500">Target: {item.target}%</span>
                  </div>
                </div>
              </div>
              
              <div className="allocation-metrics">
                <div className="allocation-percentage">{item.percentage}%</div>
                <div className="allocation-value">${item.value.toLocaleString()}</div>
                <div className={`allocation-performance ${item.performance > 0 ? 'positive' : 'negative'}`}>
                  {item.performance > 0 ? '+' : ''}{item.performance.toFixed(1)}%
                </div>
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                <ArrowUpRight className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          ))}
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