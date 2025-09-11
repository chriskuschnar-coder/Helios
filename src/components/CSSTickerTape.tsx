export function CSSTickerTape() {
  const tickers = [
    { symbol: 'BTC/USD', price: '106,250.00', change: '+2.4%', positive: true },
    { symbol: 'ETH/USD', price: '3,195.00', change: '+4.2%', positive: true },
    { symbol: 'S&P 500', price: '5,970.50', change: '+0.85%', positive: true },
    { symbol: 'NASDAQ', price: '19,850.30', change: '+1.2%', positive: true },
    { symbol: 'EUR/USD', price: '1.0845', change: '-0.2%', positive: false },
    { symbol: 'GOLD', price: '2,685.50', change: '+0.9%', positive: true },
    { symbol: 'OIL', price: '78.25', change: '-1.1%', positive: false },
    { symbol: 'DXY', price: '105.50', change: '+0.1%', positive: true },
    { symbol: 'TESLA', price: '248.50', change: '+3.4%', positive: true },
    { symbol: 'APPLE', price: '225.75', change: '+1.8%', positive: true },
  ]

  // Double the array for seamless loop
  const doubledTickers = [...tickers, ...tickers]

  return (
    <>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .ticker-scroll {
          display: flex;
          animation: scroll 30s linear infinite;
          width: fit-content;
        }
        
        .ticker-container:hover .ticker-scroll {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="ticker-container bg-gray-800 border-b border-gray-700 h-12 overflow-hidden">
        <div className="ticker-scroll flex items-center h-full">
          {doubledTickers.map((ticker, index) => (
            <div key={index} className="flex items-center px-6 whitespace-nowrap">
              <span className="text-gray-400 text-sm mr-2 font-medium">{ticker.symbol}</span>
              <span className="text-white text-sm font-semibold mr-2">${ticker.price}</span>
              <span className={`text-sm font-semibold ${ticker.positive ? 'text-green-400' : 'text-red-400'}`}>
                {ticker.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}