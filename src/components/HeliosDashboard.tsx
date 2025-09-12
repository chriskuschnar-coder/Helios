import React from 'react';
import { Zap, ExternalLink, Activity, BarChart3, TrendingUp, DollarSign, Target, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import TickerTape from './TickerTape';
import { HeliosTradingTerminal } from './trading/HeliosTradingTerminal';
import { useState } from 'react';

const HeliosDashboard: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExternalLink, setShowExternalLink] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 safe-area-bottom">
      {/* TradingView Ticker Tape */}
      <div className="bg-gray-800 border-b border-gray-700">
        <TickerTape />
      </div>
      
      {/* Integrated Trading Terminal */}
      <div className="p-4">
        {/* Terminal Header */}
        <div className="bg-gray-800 rounded-t-xl border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Helios Trading Terminal</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live MT5 Connection</span>
                  </div>
                  <span>•</span>
                  <span>Real-time Data</span>
                  <span>•</span>
                  <span>Automated Trading</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5 text-white" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-white" />
                )}
              </button>
              
              <button
                onClick={() => setShowExternalLink(!showExternalLink)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="Open in New Tab"
              >
                <ExternalLink className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          
          {showExternalLink && (
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-blue-300 text-sm">Open Helios in separate tab for advanced features</span>
                <button
                  onClick={() => window.open('https://helios.luminarygrow.com/', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Open External Terminal
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Embedded Trading Terminal */}
        <div className={`bg-gray-800 border-x border-b border-gray-700 ${isFullscreen ? 'fixed inset-0 z-50' : 'rounded-b-xl'}`}>
          <HeliosTradingTerminal isFullscreen={isFullscreen} />
        </div>
      </div>
    </div>
  );
};

export default HeliosDashboard;