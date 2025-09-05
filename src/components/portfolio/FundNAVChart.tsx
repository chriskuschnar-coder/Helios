import React, { useState, useEffect } from 'react'
import { TrendingUp, Calendar, BarChart3, RefreshCw } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface NAVDataPoint {
  date: string
  nav_per_unit: number
  daily_return_pct: number
  total_aum: number
}

export function FundNAVChart() {
  const [navData, setNavData] = useState<NAVDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('3M')
  const [updateCount, setUpdateCount] = useState(0)

  const generateNAVHistory = (): NAVDataPoint[] => {
    const periods = {
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      'ALL': 500
    }

    const days = periods[selectedPeriod]
    const data: NAVDataPoint[] = []
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    let currentNAV = 1000.0000 // Starting NAV
    let totalAUM = 250000 // Starting AUM

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      // Generate realistic daily returns with some volatility
      const dailyReturn = (Math.random() - 0.48) * 0.02 // Slight positive bias
      const dailyReturnPct = dailyReturn * 100
      
      currentNAV = currentNAV * (1 + dailyReturn)
      totalAUM = totalAUM * (1 + dailyReturn)

      data.push({
        date: date.toISOString().split('T')[0],
        nav_per_unit: currentNAV,
        daily_return_pct: dailyReturnPct,
        total_aum: totalAUM
      })
    }

    return data
  }

  const refreshData = async () => {
    setLoading(true)
    setUpdateCount(prev => prev + 1)
    
    // In production, this would fetch from fund_nav table
    // For now, generate realistic historical data
    await new Promise(resolve => setTimeout(resolve, 400))
    setNavData(generateNAVHistory())
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
  }, [selectedPeriod])

  const chartData = {
    labels: navData.map(point => {
      const date = new Date(point.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'NAV per Unit',
        data: navData.map(point => point.nav_per_unit),
        borderColor: '#1e40af',
        backgroundColor: 'rgba(30, 64, 175, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#1e40af',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: '#334155',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y
            const dataPoint = navData[context.dataIndex]
            return [
              `NAV: $${value.toFixed(4)}`,
              `Daily Return: ${dataPoint.daily_return_pct > 0 ? '+' : ''}${dataPoint.daily_return_pct.toFixed(2)}%`,
              `Fund AUM: $${dataPoint.total_aum.toLocaleString()}`
            ]
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11
          },
          callback: function(value: any) {
            return '$' + value.toFixed(0)
          }
        }
      }
    }
  }

  // Calculate performance metrics
  const startNAV = navData[0]?.nav_per_unit || 1000
  const currentNAV = navData[navData.length - 1]?.nav_per_unit || 1000
  const totalReturn = ((currentNAV - startNAV) / startNAV) * 100
  const bestDay = Math.max(...navData.map(d => d.daily_return_pct))
  const worstDay = Math.min(...navData.map(d => d.daily_return_pct))
  const avgDaily = navData.reduce((sum, d) => sum + d.daily_return_pct, 0) / navData.length

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-navy-900">Fund NAV History</h3>
            <p className="text-sm text-gray-600">
              Net Asset Value per unit • Daily updates from Helios
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
      ) : (
        <>
          <div className="h-80 mb-6">
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* Performance Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className={`h-5 w-5 ${totalReturn > 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div className="text-sm text-gray-600 mb-1">Total Return</div>
              <div className={`font-bold ${totalReturn > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalReturn > 0 ? '+' : ''}{totalReturn.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500">{selectedPeriod} Period</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-sm text-gray-600 mb-1">Best Day</div>
              <div className="font-bold text-green-600">
                +{bestDay.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500">Single Day</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-sm text-gray-600 mb-1">Worst Day</div>
              <div className="font-bold text-red-600">
                {worstDay.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500">Single Day</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="h-5 w-5 text-navy-600" />
              </div>
              <div className="text-sm text-gray-600 mb-1">Avg Daily</div>
              <div className="font-bold text-navy-600">
                {avgDaily > 0 ? '+' : ''}{avgDaily.toFixed(3)}%
              </div>
              <div className="text-xs text-gray-500">Daily Average</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}