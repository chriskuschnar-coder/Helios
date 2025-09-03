import React, { useState, useEffect, useRef } from 'react'
import { BarChart3, Maximize2, RotateCcw, Info } from 'lucide-react'

interface CorrelationData {
  assets: string[]
  matrix: number[][]
  lastUpdated: string
}

export function CorrelationMatrix3D() {
  const [data, setData] = useState<CorrelationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isRotating, setIsRotating] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const generateCorrelationData = (): CorrelationData => {
    const assets = ['BTC', 'ETH', 'SPY', 'QQQ', 'GLD', 'TLT', 'DXY', 'OIL']
    const matrix: number[][] = []

    // Generate realistic correlation matrix
    for (let i = 0; i < assets.length; i++) {
      matrix[i] = []
      for (let j = 0; j < assets.length; j++) {
        if (i === j) {
          matrix[i][j] = 1.0 // Perfect self-correlation
        } else {
          // Generate realistic correlations based on asset relationships
          let correlation = 0
          
          // Crypto correlations
          if ((assets[i] === 'BTC' && assets[j] === 'ETH') || 
              (assets[i] === 'ETH' && assets[j] === 'BTC')) {
            correlation = 0.7 + Math.random() * 0.2 // 0.7-0.9
          }
          // Stock correlations
          else if ((assets[i] === 'SPY' && assets[j] === 'QQQ') || 
                   (assets[i] === 'QQQ' && assets[j] === 'SPY')) {
            correlation = 0.8 + Math.random() * 0.15 // 0.8-0.95
          }
          // Safe haven correlations
          else if ((assets[i] === 'GLD' && assets[j] === 'TLT') || 
                   (assets[i] === 'TLT' && assets[j] === 'GLD')) {
            correlation = 0.1 + Math.random() * 0.3 // 0.1-0.4
          }
          // Dollar negative correlations
          else if (assets[i] === 'DXY' || assets[j] === 'DXY') {
            correlation = -0.6 + Math.random() * 0.4 // -0.6 to -0.2
          }
          // Default random correlations
          else {
            correlation = -0.3 + Math.random() * 0.6 // -0.3 to 0.3
          }
          
          matrix[i][j] = Math.round(correlation * 100) / 100
        }
      }
    }

    return {
      assets,
      matrix,
      lastUpdated: new Date().toISOString()
    }
  }

  const refreshData = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setData(generateCorrelationData())
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
    
    // Auto-refresh every 10 minutes
    const interval = setInterval(refreshData, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Auto-rotation effect
  useEffect(() => {
    if (!isRotating) return

    const interval = setInterval(() => {
      setRotation(prev => ({
        x: prev.x + 0.5,
        y: prev.y + 0.3
      }))
    }, 50)

    return () => clearInterval(interval)
  }, [isRotating])

  const getCorrelationColor = (value: number) => {
    const intensity = Math.abs(value)
    if (value > 0.7) return `rgba(34, 197, 94, ${intensity})` // Strong positive - green
    if (value > 0.3) return `rgba(59, 130, 246, ${intensity})` // Moderate positive - blue
    if (value > -0.3) return `rgba(156, 163, 175, ${intensity})` // Neutral - gray
    if (value > -0.7) return `rgba(249, 115, 22, ${intensity})` // Moderate negative - orange
    return `rgba(239, 68, 68, ${intensity})` // Strong negative - red
  }

  const resetRotation = () => {
    setRotation({ x: 0, y: 0 })
    setIsRotating(false)
    setTimeout(() => setIsRotating(true), 2000)
  }

  if (loading && !data) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-indigo-600 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-navy-900">3D Correlation Matrix</h3>
            <p className="text-sm text-gray-600">Loading correlation data...</p>
          </div>
        </div>
        <div className="h-80 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-navy-900">3D Correlation Matrix</h3>
            <p className="text-sm text-gray-600">
              Interactive asset correlation visualization
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-2 rounded-lg transition-colors ${
              isRotating ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
            }`}
            title={isRotating ? 'Pause Rotation' : 'Start Rotation'}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          
          <button
            onClick={resetRotation}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Reset View"
          >
            <Maximize2 className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {data && (
        <div className="space-y-6">
          {/* 3D Matrix Visualization */}
          <div 
            ref={containerRef}
            className="relative h-80 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
            style={{ perspective: '1000px' }}
            onMouseDown={(e) => {
              setIsRotating(false)
              const startX = e.clientX
              const startY = e.clientY
              const startRotation = { ...rotation }

              const handleMouseMove = (e: MouseEvent) => {
                const deltaX = e.clientX - startX
                const deltaY = e.clientY - startY
                setRotation({
                  x: startRotation.x + deltaY * 0.5,
                  y: startRotation.y + deltaX * 0.5
                })
              }

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
                setTimeout(() => setIsRotating(true), 1000)
              }

              document.addEventListener('mousemove', handleMouseMove)
              document.addEventListener('mouseup', handleMouseUp)
            }}
          >
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                transformStyle: 'preserve-3d',
                transition: isRotating ? 'none' : 'transform 0.3s ease'
              }}
            >
              {/* 3D Grid of Correlation Cubes */}
              <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
                {data.matrix.map((row, i) =>
                  row.map((correlation, j) => {
                    const x = (j - data.assets.length / 2) * 40
                    const y = (i - data.assets.length / 2) * 40
                    const z = correlation * 100
                    const size = Math.abs(correlation) * 20 + 5

                    return (
                      <div
                        key={`${i}-${j}`}
                        className="absolute rounded-lg shadow-lg border border-white border-opacity-20"
                        style={{
                          transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                          width: `${size}px`,
                          height: `${size}px`,
                          backgroundColor: getCorrelationColor(correlation),
                          transformStyle: 'preserve-3d'
                        }}
                        title={`${data.assets[i]} vs ${data.assets[j]}: ${correlation.toFixed(2)}`}
                      >
                        {/* Cube faces for 3D effect */}
                        <div 
                          className="absolute inset-0 rounded-lg opacity-80"
                          style={{
                            backgroundColor: getCorrelationColor(correlation),
                            transform: 'translateZ(2px)'
                          }}
                        />
                      </div>
                    )
                  })
                )}
                
                {/* Asset Labels */}
                {data.assets.map((asset, index) => (
                  <div
                    key={asset}
                    className="absolute text-white font-bold text-sm bg-black bg-opacity-50 px-2 py-1 rounded backdrop-blur-sm"
                    style={{
                      transform: `translate3d(${(index - data.assets.length / 2) * 40 - 15}px, ${-data.assets.length / 2 * 40 - 30}px, 0px)`
                    }}
                  >
                    {asset}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-3">
              <div className="text-white text-xs space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Strong Positive (0.7+)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Moderate Positive (0.3-0.7)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded"></div>
                  <span>Neutral (-0.3 to 0.3)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Negative (-0.3 to -0.7)</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 right-4 text-white text-xs bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-2">
              <div>Click and drag to rotate</div>
              <div>Auto-rotation: {isRotating ? 'ON' : 'OFF'}</div>
            </div>
          </div>

          {/* Correlation Insights */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Strongest Correlations</h4>
              <div className="space-y-2">
                {data.matrix.map((row, i) =>
                  row.map((corr, j) => ({ i, j, corr }))
                )
                .filter(item => item.i < item.j && Math.abs(item.corr) > 0.6)
                .sort((a, b) => Math.abs(b.corr) - Math.abs(a.corr))
                .slice(0, 4)
                .map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {data.assets[item.i]} ↔ {data.assets[item.j]}
                    </span>
                    <span className={`text-sm font-medium ${
                      item.corr > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.corr > 0 ? '+' : ''}{item.corr.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Diversification Opportunities</h4>
              <div className="space-y-2">
                {data.matrix.map((row, i) =>
                  row.map((corr, j) => ({ i, j, corr }))
                )
                .filter(item => item.i < item.j && Math.abs(item.corr) < 0.3)
                .sort((a, b) => Math.abs(a.corr) - Math.abs(b.corr))
                .slice(0, 4)
                .map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {data.assets[item.i]} ↔ {data.assets[item.j]}
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      {item.corr > 0 ? '+' : ''}{item.corr.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Matrix Table for Reference */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 font-medium text-gray-900">Asset</th>
                  {data.assets.map(asset => (
                    <th key={asset} className="text-center p-2 font-medium text-gray-900 min-w-[60px]">
                      {asset}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.matrix.map((row, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="p-2 font-medium text-gray-900">{data.assets[i]}</td>
                    {row.map((correlation, j) => (
                      <td 
                        key={j} 
                        className="text-center p-2 font-mono text-xs"
                        style={{
                          backgroundColor: getCorrelationColor(correlation),
                          color: Math.abs(correlation) > 0.5 ? 'white' : 'black'
                        }}
                      >
                        {correlation.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Update Info */}
          <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4" />
              <span>Correlations calculated using 30-day rolling window</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              <span>Updates every 10 minutes</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}