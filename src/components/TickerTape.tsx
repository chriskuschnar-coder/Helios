import { useEffect, useRef } from 'react'

export default function TickerTape() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const widgetContainer = document.createElement('div')
    widgetContainer.className = 'tradingview-widget-container__widget'
    containerRef.current.appendChild(widgetContainer)

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
        { proName: "COINBASE:BTCUSD", title: "Bitcoin" },
        { proName: "COINBASE:ETHUSD", title: "Ethereum" },
        { proName: "FOREXCOM:XAUUSD", title: "Gold" }
      ],
      showSymbolLogo: true,
      colorTheme: "dark",
      isTransparent: false,
      displayMode: "adaptive",
      locale: "en"
    })

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ width: '100%', height: '46px' }}
    />
  )
}