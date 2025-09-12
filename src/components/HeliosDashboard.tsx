import React from 'react';
import { Zap, ExternalLink, Activity } from 'lucide-react';
import TickerTape from './TickerTape';

const HeliosDashboard = () => {
  const [loading, setLoading] = React.useState(false);

  const handleOpenHelios = () => {
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
            Access professional trading tools and real-time market data
          </p>
          
          <button
            onClick={handleOpenHelios}
            disabled={loading}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Activity className="w-5 h-5 mr-2 animate-spin" />
                Launching Terminal...
              </>
            ) : (
              <>
                <ExternalLink className="w-5 h-5 mr-2" />
                Open Helios Terminal
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeliosDashboard;