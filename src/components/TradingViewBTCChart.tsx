import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    TradingView: any
  }
}

export function TradingViewBTCChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetInitialized = useRef(false)

  useEffect(() => {
    const initWidget = () => {
      if (!containerRef.current || widgetInitialized.current) return
      
      // Create container div
      const chartDiv = document.createElement('div')
      chartDiv.id = `tradingview_${Date.now()}`
      chartDiv.style.height = '100%'
      chartDiv.style.width = '100%'
      
      containerRef.current.innerHTML = ''
      containerRef.current.appendChild(chartDiv)

      // Check if TradingView is available
      if (window.TradingView) {
        try {
          new window.TradingView.widget({
            width: '100%',
            height: '100%',
            symbol: 'COINBASE:BTCUSD',
            interval: '5',
            timezone: 'Etc/UTC',
            theme: 'dark',
            style: '1',
            locale: 'en',
            toolbar_bg: '#1a1b1f',
            enable_publishing: false,
            allow_symbol_change: true,
            container_id: chartDiv.id,
            hide_side_toolbar: false,
            studies: ['STD;Volume'],
            save_image: false
          })
          widgetInitialized.current = true
        } catch (error) {
          console.error('TradingView widget error:', error)
        }
      }
    }

    // Load TradingView script
    const scriptId = 'tradingview-widget-script'
    let script = document.getElementById(scriptId) as HTMLScriptElement

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://s3.tradingview.com/tv.js'
      script.async = true
      script.onload = () => {
        setTimeout(initWidget, 100) // Small delay to ensure script is ready
      }
      document.head.appendChild(script)
    } else {
      // Script already loaded
      setTimeout(initWidget, 100)
    }

    // Cleanup
    return () => {
      widgetInitialized.current = false
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 h-[500px]">
      <div ref={containerRef} className="w-full h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400">Loading BTC Chart...</div>
        </div>
      </div>
    </div>
  )
}