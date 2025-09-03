import React, { useState, useEffect } from 'react'
import { ModernPortfolioAllocation } from './ModernPortfolioAllocation'
import { PieChart, BarChart3, TrendingUp, RefreshCw, Target, Zap } from 'lucide-react'
import { MetricDetailModal } from './MetricDetailModal'

interface AllocationData {
  name: string
  value: number
  percentage: number
  performance: number
  color: string
  target: number
  risk: 'Low' | 'Medium' | 'High'
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
  const [allocationDrift, setAllocationDrift] = useState<{ [key: string]: number }>({})
  const [rebalanceAlerts, setRebalanceAlerts] = useState<string[]>([])

  // Use the modern component for better UX
  return (
    <ModernPortfolioAllocation currentBalance={currentBalance} />
  )

  const generateAllocationData = (): AllocationData[] => {
    // Live allocation drift simulation
    const marketMovement = Math.sin(Date.now() / 20000) * 0.02    // ±2% market movement
    const performanceDrift = Math.cos(Date.now() / 40000) * 0.015  // ±1.5% performance drift
    const timeVariation = marketMovement + performanceDrift
    
    if (currentBalance === 0) {
      return [
        { name: 'Alpha Fund', value: 0, percentage: 0, performance: 0, color: '#1e40af', target: 65, risk: 'Medium' },
        { name: 'Market Neutral', value: 0, percentage: 0, performance: 0, color: '#059669', target: 25, risk: 'Low' },
        { name: 'Momentum Portfolio', value: 0, percentage: 0, performance: 0, color: '#dc2626', target: 10, risk: 'High' }
      ]
    }

    // Calculate allocation drift from targets
    return [
      {
        name: 'Alpha Fund',
        value: currentBalance * 0.65,
        percentage: 65,
        performance: 14.2 + (timeVariation * 3),
        color: '#1e40af',
        target: 65,
        deviation: (65 + timeVariation * 5) - 65,
        risk: 'Medium'
      },
      {
        name: 'Market Neutral',
        value: currentBalance * 0.25,
        percentage: 25,
        performance: 8.7 + (timeVariation * 2),
        color: '#059669',
        target: 25,
        deviation: (25 + timeVariation * 3) - 25,
        risk: 'Low'
      },
      {
        name: 'Momentum Portfolio',
        value: currentBalance * 0.10,
        percentage: 10,
        performance: 18.9 + (timeVariation * 4),
        color: '#dc2626',
        target: 10,
        deviation: (10 + timeVariation * 2) - 10,
        risk: 'High'
      }
    ]
  }

  const [allocationData, setAllocationData] = useState<AllocationData[]>(generateAllocationData())

  useEffect(() => {
    setAllocationData(generateAllocationData())
    
    // Check for rebalancing needs
    const newData = generateAllocationData()
    const alerts: string[] = []
    
    newData.forEach(allocation => {
      if (Math.abs(allocation.deviation) > 3) {
        alerts.push(`${allocation.name} is ${allocation.deviation > 0 ? 'overweight' : 'underweight'} by ${Math.abs(allocation.deviation).toFixed(1)}%`)
      }
    })
    
    setRebalanceAlerts(alerts)
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
      value: `${allocation.percentage}% (${allocation.value.toLocaleString()})`,
      description: `${allocation.name} represents ${allocation.percentage}% of your total portfolio allocation. This ${allocation.risk.toLowerCase()}-risk investment strategy focuses on ${allocation.name.includes('Alpha') ? 'generating alpha through quantitative models' : allocation.name.includes('Neutral') ? 'market-neutral strategies with low correlation to market movements' : 'momentum-based strategies with higher return potential'}.`,
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
    const centerX = 150
    const centerY = 150
    const radius = 120
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
            hoveredSegment === item.name ? 'opacity-80 transform scale-105' : 'opacity-90'
          }`}
          onMouseEnter={() => setHoveredSegment(item.name)}
          onMouseLeave={() => setHoveredSegment(null)}
          onClick={() => handleAllocationClick(item)}
        />
      )
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <PieChart className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-navy-900">Portfolio Allocation</h3>
            <p className="text-sm text-gray-600">Interactive breakdown with performance</p>
            {rebalanceAlerts.length > 0 && (
              <p className="text-xs text-orange-600 mt-1">
                🎯 {rebalanceAlerts[0]}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedView('pie')}
            className={`p-2 rounded-lg transition-colors ${
              selectedView === 'pie' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <PieChart className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelectedView('bar')}
            className={`p-2 rounded-lg transition-colors ${
              selectedView === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Chart */}
        <div className="flex items-center justify-center">
          {selectedView === 'pie' ? (
            <div className="relative">
              <svg width="300" height="300" className="transform transition-all duration-500">
                {createPieChart()}
                
                {/* Center circle */}
                <circle
                  cx="150"
                  cy="150"
                  r="60"
                  fill="white"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                
                {/* Center text */}
                <text
                  x="150"
                  y="140"
                  textAnchor="middle"
                  className="text-sm font-medium fill-gray-600"
                >
                  Total Value
                </text>
                <text
                  x="150"
                  y="160"
                  textAnchor="middle"
                  className="text-lg font-bold fill-gray-900"
                >
                  ${currentBalance.toLocaleString()}
                </text>
              </svg>
              
              {hoveredSegment && (
                <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm">
                  {hoveredSegment}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full space-y-4">
              {allocationData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <span className="text-sm text-gray-600">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: item.color
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">${item.value.toLocaleString()}</span>
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
          <h4 className="font-medium text-gray-900">Fund Details</h4>
          
          {allocationData.map((item, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border transition-all cursor-pointer group ${
                hoveredSegment === item.name 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
              onMouseEnter={() => setHoveredSegment(item.name)}
              onMouseLeave={() => setHoveredSegment(null)}
              onClick={() => handleAllocationClick(item)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="font-medium text-gray-900 group-hover:text-blue-900">{item.name}</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.risk === 'Low' ? 'bg-green-100 text-green-800' :
                  item.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {item.risk} Risk
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Value:</span>
                  <span className="font-medium ml-2">${item.value.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Performance:</span>
                  <span className={`font-medium ml-2 ${item.performance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.performance > 0 ? '+' : ''}{item.performance.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Allocation:</span>
                  <span className="font-medium ml-2">{item.percentage}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Target:</span>
                  <span className="font-medium ml-2">{item.target}%</span>
                </div>
              </div>
              
              {Math.abs(item.deviation) > 2 && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                  <Target className="h-3 w-3 inline mr-1" />
                  Consider rebalancing: {item.deviation > 0 ? 'Overweight' : 'Underweight'} by {Math.abs(item.deviation).toFixed(1)}%
                </div>
              )}
              
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-xs text-blue-600 font-medium">Click for allocation details →</div>
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