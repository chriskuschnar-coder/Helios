import React from 'react';
import { Zap, ExternalLink, Activity, ArrowRight, Loader2 } from 'lucide-react';
import TickerTape from './TickerTape';

const HeliosDashboard: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

  const handleOpenTerminal = () => {
    setLoading(true);
    
    // Show loading for smooth UX
    setTimeout(() => {
      console.log('🚀 Opening Helios Trading Terminal');
      window.open('https://helios.luminarygrow.com/', '_blank', 'noopener,noreferrer');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-900 safe-area-bottom">
      {/* TradingView Ticker Tape */}
      <div className="bg-gray-800 border-b border-gray-700">
        <TickerTape />
      </div>
      
      {/* Helios Terminal Gateway */}
      <div className="flex items-center justify-center min-h-[calc(100vh-46px)]">
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Zap className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Helios Trading Terminal
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            You're about to access the Helios Trading Terminal - our advanced platform 
            with real-time market data, professional charting tools, and live MT5 integration.
          </p>
          
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-lg font-bold text-green-400 mb-2">Live MT5 Data</div>
                <div className="text-sm text-gray-400">Real-time trading bot connection</div>
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-lg font-bold text-blue-400 mb-2">Professional Tools</div>
                <div className="text-sm text-gray-400">Advanced charting & analysis</div>
              </div>
              <div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ExternalLink className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-lg font-bold text-purple-400 mb-2">Secure Access</div>
                <div className="text-sm text-gray-400">Encrypted connections</div>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleOpenTerminal}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center space-x-3 mx-auto hover:scale-105 shadow-lg disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Opening Terminal...</span>
              </>
            ) : (
              <>
                <Zap className="w-6 h-6" />
                <span>Enter Terminal</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
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
              This terminal connects to our live MT5 trading bot with real positions, 
              signals, and portfolio performance data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeliosDashboard;