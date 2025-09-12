import React from 'react';
import { Zap, ExternalLink, Activity } from 'lucide-react';
import TickerTape from './TickerTape';

const HeliosDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 safe-area-bottom">
      {/* TradingView Ticker Tape */}
      <div className="bg-gray-800 border-b border-gray-700">
        <TickerTape />
      </div>
      
      {/* Live Trading Terminal Redirect */}
      <div className="flex items-center justify-center min-h-[calc(100vh-46px)]">
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <Zap className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Live Trading Terminal
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Access the live Helios trading terminal connected to our MT5 trading bot. 
            Monitor real-time positions, signals, and performance metrics.
          </p>
          
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400 mb-2">Live</div>
                <div className="text-sm text-gray-400">Real-time Data</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400 mb-2">MT5</div>
                <div className="text-sm text-gray-400">Trading Platform</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400 mb-2">24/7</div>
                <div className="text-sm text-gray-400">Automated Trading</div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => window.open('https://helios.luminarygrow.com/', '_blank')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center space-x-3 mx-auto hover:scale-105 shadow-lg"
          >
            <Zap className="w-6 h-6" />
            <span>Open Live Trading Terminal</span>
            <ExternalLink className="w-5 h-5" />
          </button>
          
          <p className="text-sm text-gray-400 mt-4">
            Opens in a new tab • Connected to live MT5 trading bot
          </p>
          
          <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">Live Trading Environment</span>
            </div>
            <p className="text-yellow-200 text-sm">
              This terminal shows real trading activity from our automated MT5 bot. 
              All positions and signals are live and affect actual portfolio performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeliosDashboard;